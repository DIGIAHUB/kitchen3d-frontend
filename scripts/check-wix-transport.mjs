import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createHmac } from "node:crypto";

const root = new URL("../src/lib/enquiries/", import.meta.url);
const timers = new Map();
let timerId = 0;
let checks = 0;
let intercepted = 0;
const forbidden = () => { throw new Error("Unexpected real network or logging"); };
const sandbox = vm.createContext({
  Uint8Array, TextDecoder, AbortController,
  fetch: forbidden, XMLHttpRequest: forbidden, WebSocket: forbidden,
  console: { log: forbidden, warn: forbidden, error: forbidden },
  setTimeout: (fn, ms) => { assert.ok([5000, 10000].includes(ms)); timers.set(++timerId, fn); return timerId; },
  clearTimeout: id => timers.delete(id),
});
const modules = new Map();
function load(name) {
  if (modules.has(name)) return modules.get(name);
  const source = readFileSync(new URL(name + ".ts", root), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const result = { exports: {} };
  modules.set(name, result.exports);
  vm.runInContext("(function(module,exports,require){" + compiled.outputText + "\n})", sandbox)(
    result, result.exports, dependency => {
      if (dependency === "node:crypto") return { createHmac };
      assert.ok(["./contract", "./options", "./wix-submission-adapter", "./wix-transport"].includes(dependency));
      return load(dependency.slice(2));
    });
  return result.exports;
}
const intoRealm = value => vm.runInContext("JSON.parse", sandbox)(JSON.stringify(value));
const { sendEnquiryOnce } = load("wix-transport");
const adapter = load("wix-submission-adapter");
const formId = "11111111-1111-4111-8111-111111111111";
const submissionId = "22222222-2222-4222-8222-222222222222";
const common = { selectedServices: [], trades: "", files: [], visit: "", time: "", notes: "", name: "Synthetic Test", postcode: "M1 1AA", address: "Synthetic test address", phone: "07700900000", email: "", contact: "Phone" };
const samples = [
  { ...common, journey: "installation", supplier: "Still deciding", removal: "Not sure yet", delivery: "", start: "" },
  { ...common, journey: "complete", stage: "Just exploring ideas", style: "", budget: "", start: "" },
];
const context = intoRealm({ today: "2026-09-17" });
const configFor = journey => intoRealm({
  binding: { siteId: adapter.KITCHEN3D_ENQUIRY_SITE_ID, journey, formId, namespace: "wix.form_app.form", fieldTypes: adapter.expectedEnquiryTargets[journey] },
  authorization: "synthetic-not-a-credential",
});
async function check(name, run) {
  try { await run(); assert.equal(timers.size, 0); checks++; }
  catch (cause) { throw new Error("Transport check failed: " + name, { cause }); }
}
function confirmed(init, patch = {}) {
  const submitted = JSON.parse(init.body).submission;
  return Response.json({ submission: { ...submitted, id: submissionId, namespace: "wix.form_app.form", status: "CONFIRMED", ...patch } });
}
async function call(sample, config = configFor(sample.journey), responder = (_, init) => confirmed(init)) {
  let count = 0;
  const result = await sendEnquiryOnce(intoRealm(sample), context, config, async (url, init) => {
    count++; intercepted++;
    assert.equal(url, "https://www.wixapis.com/form-submission-service/v4/submissions");
    assert.equal(init.method, "POST");
    assert.equal(init.redirect, "error");
    assert.equal(init.cache, "no-store");
    assert.equal(init.headers["wix-site-id"], adapter.KITCHEN3D_ENQUIRY_SITE_ID);
    assert.equal(init.headers.Authorization, "synthetic-not-a-credential");
    const body = JSON.parse(init.body);
    assert.deepEqual(Object.keys(body).sort(), ["submission"]);
    return responder(url, init);
  });
  assert.ok(count <= 1, "Never automatically retry");
  assert.equal(result.automaticRetryAllowed, false);
  assert.equal(result.appointmentConfirmed, false);
  assert.ok(!JSON.stringify(result).includes("synthetic-not-a-credential"));
  return { result, count };
}
for (const sample of samples) {
  await check(sample.journey + ": verified response and envelope", async () => {
    const { result, count } = await call(sample);
    assert.equal(result.state, "CONFIRMED"); assert.equal(result.submissionId, submissionId); assert.equal(count, 1);
  });
  await check(sample.journey + ": disabled without injected transport", async () => {
    const result = await sendEnquiryOnce(intoRealm(sample), context, configFor(sample.journey));
    assert.equal(result.code, "TRANSPORT_DISABLED");
  });
  await check(sample.journey + ": PENDING Wix Form receipt is accepted", async () => {
    assert.equal((await call(sample, undefined, (_, init) => confirmed(init, { status: "PENDING" }))).result.state, "CONFIRMED");
  });
  for (const status of ["PAYMENT_WAITING", "PAYMENT_CANCELED", "OTHER", null]) {
    await check(sample.journey + ": status " + status, async () => {
      assert.equal((await call(sample, undefined, (_, init) => confirmed(init, { status }))).result.state, "UNCONFIRMED");
    });
  }
  for (const patch of [{ id: "" }, { formId: submissionId }, { namespace: "other" }, { submissions: {} }, { submissions: null }, { orderDetails: {} }, { appointmentDetails: {} }]) {
    await check(sample.journey + ": mismatched receipt", async () => {
      assert.equal((await call(sample, undefined, (_, init) => confirmed(init, patch))).result.state, "UNCONFIRMED");
    });
  }
  await check(sample.journey + ": receipt values belong to another enquiry", async () => {
    const { result } = await call(sample, undefined, (_, init) => {
      const values = JSON.parse(init.body).submission.submissions;
      return confirmed(init, { submissions: { ...values, k3d_contact_name: "Someone else" } });
    });
    assert.equal(result.state, "UNCONFIRMED");
  });
  await check(sample.journey + ": invalid input cannot reach transport", async () => {
    const { result, count } = await call({ ...sample, name: "" });
    assert.equal(result.code, "INVALID_ENQUIRY"); assert.equal(count, 0);
  });
  await check(sample.journey + ": attachments cannot silently disappear", async () => {
    const { result, count } = await call({ ...sample, files: [{ name: "test.pdf", type: "application/pdf", size: 20 }] });
    assert.equal(result.code, "UPLOADS_NOT_READY"); assert.equal(count, 0);
  });
}
const sample = samples[0];
for (const [key, value] of [["authorization", ""], ["authorization", "bad\nheader"], ["authorization", "a".repeat(8193)]]) {
  await check("invalid token before network", async () => {
    const config = configFor(sample.journey); config[key] = value;
    const { result, count } = await call(sample, config);
    assert.equal(result.code, "INVALID_CONFIGURATION"); assert.equal(count, 0);
  });
}
for (const binding of [null, {}, { ...configFor(sample.journey).binding, siteId: "other-site" }]) {
  await check("binding gate", async () => {
    const config = configFor(sample.journey); config.binding = intoRealm(binding);
    const { result, count } = await call(sample, config);
    assert.equal(result.state, "NOT_SENT"); assert.equal(count, 0);
  });
}
for (const status of [301, 400, 401, 403, 404, 428, 429, 500, 503]) {
  await check("HTTP failure " + status + " without error-body read", async () => {
    const { result } = await call(sample, undefined, () => ({ ok: false, status, get body() { throw new Error("Must not read error body"); } }));
    assert.equal(result.state, "UNCONFIRMED");
  });
}
for (const makeResponse of [
  () => Response.json({}), () => Response.json(null),
  () => new Response("not json", { headers: { "content-type": "application/json" } }),
  () => new Response("{}", { headers: { "content-type": "text/html" } }),
  () => new Response(new Uint8Array([0xff]), { headers: { "content-type": "application/json" } }),
  () => new Response("x".repeat(65537), { headers: { "content-type": "application/json" } }),
  () => new Response("{}", { headers: { "content-type": "application/json", "content-length": "65537" } }),
  () => new Response("{}", { headers: { "content-type": "application/json", "content-length": "3" } }),
  () => { throw new Error("synthetic-private-provider-error"); },
]) {
  await check("malformed/oversized receipt is sanitized", async () => {
    const { result } = await call(sample, undefined, makeResponse);
    assert.equal(result.state, "UNCONFIRMED");
    assert.ok(!JSON.stringify(result).includes("synthetic-private"));
  });
}
for (const stage of ["fetch", "body"]) {
  await check("single deadline bounds " + stage, async () => {
    let signal; let cancelled = 0;
    const pending = call(sample, undefined, (_, init) => {
      signal = init.signal;
      return stage === "fetch" ? new Promise(() => {}) : new Response(new ReadableStream({
        cancel() { cancelled++; return new Promise(() => {}); },
      }), { headers: { "content-type": "application/json" } });
    });
    for (let n = 0; n < 12; n++) await Promise.resolve();
    assert.equal(timers.size, 1);
    [...timers.values()][0]();
    const { result } = await pending;
    assert.equal(result.state, "UNCONFIRMED");
    assert.equal(signal.aborted, true);
    if (stage === "body") assert.equal(cancelled, 1);
  });
}
await check("client runtime cannot invoke transport", async () => {
  sandbox.window = {};
  try { assert.equal((await call(sample)).result.code, "TRANSPORT_DISABLED"); }
  finally { delete sandbox.window; }
});
await check("live route keeps its server-side submission boundary", () => {
  const source = readFileSync(new URL("../src/app/api/enquiries/route.ts", import.meta.url), "utf8");
  assert.match(source, /readEnquiryJson/);
  assert.match(source, /liveEnquiryBindings/);
  assert.match(source, /sendEnquiryOnce/);
  assert.match(source, /https:\/\/kitchen3d\.co\.uk/);
  assert.match(source, /appointment is created/i);
  assert.match(source, /console\.warn\("K3D Wix Forms delivery unconfirmed", \{ code: result\.code \}\)/);
  assert.doesNotMatch(source, /process\.env\.WIX_FORMS_API_KEY/);
});
const { coordinateEnquiry } = load("delivery-coordinator");
const requestKey = "33333333-3333-4333-8333-333333333333";
const lease = "44444444-4444-4444-8444-444444444444";
const actorKey = "a".repeat(64);
const secret = "b".repeat(64);
function runtime(admission = { state: "GRANTED", lease }) {
  const activity = { admissions: [], settlements: [], sends: 0 };
  const dependencies = {
    fingerprintSecret: secret,
    request: async (_, init) => { activity.sends++; intercepted++; return confirmed(init); },
    store: {
      admit: async input => { activity.admissions.push(input); return admission; },
      settle: async (...args) => { activity.settlements.push(args.slice(0, 3)); },
    },
  };
  return { activity, dependencies };
}
const dispatch = dependencies => coordinateEnquiry(intoRealm(sample), context, requestKey, actorKey, configFor(sample.journey), dependencies);
await check("no durable backend means no delivery", async () => assert.equal((await dispatch()).code, "DELIVERY_UNAVAILABLE"));
for (const [admission, code] of [
  [{ state: "BUSY" }, "REQUEST_IN_PROGRESS"], [{ state: "DENIED" }, "ADMISSION_DENIED"],
  [{ state: "CONFLICT" }, "REQUEST_CONFLICT"], [{ state: "UNCERTAIN" }, "UNEXPECTED_RECEIPT"],
  [{ state: "GRANTED", lease: "" }, "UNEXPECTED_RECEIPT"], [{ state: "OTHER" }, "UNEXPECTED_RECEIPT"],
]) {
  await check("no send for admission " + admission.state, async () => {
    const { dependencies, activity } = runtime(admission);
    assert.equal((await dispatch(dependencies)).code, code);
    assert.equal(activity.sends, 0);
  });
}
await check("persist a receipt after one send; only opaque identity reaches store", async () => {
  const { dependencies, activity } = runtime();
  const result = await dispatch(dependencies);
  assert.equal(result.state, "CONFIRMED"); assert.equal(activity.sends, 1);
  assert.equal(activity.settlements[0][1], lease);
  assert.deepEqual(Object.keys(activity.admissions[0]).sort(), ["actorKey", "fingerprint", "requestKey"]);
  assert.match(activity.admissions[0].fingerprint, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(activity).includes(sample.name));
});
await check("confirmed retry reads stored result and never sends", async () => {
  const { dependencies, activity } = runtime({ state: "CONFIRMED", submissionId });
  assert.equal((await dispatch(dependencies)).submissionId, submissionId);
  assert.equal(activity.sends, 0); assert.equal(activity.settlements.length, 0);
});
await check("settlement failure after delivery stays uncertain", async () => {
  const { dependencies, activity } = runtime();
  dependencies.store.settle = async () => { throw new Error("synthetic-private-store"); };
  assert.equal((await dispatch(dependencies)).state, "UNCONFIRMED");
  assert.equal(activity.sends, 1);
});
await check("admission outage cannot send", async () => {
  const { dependencies, activity } = runtime();
  dependencies.store.admit = async () => { throw new Error("synthetic-private-store"); };
  assert.equal((await dispatch(dependencies)).code, "DELIVERY_UNAVAILABLE");
  assert.equal(activity.sends, 0);
});
await check("invalid request identity is rejected before admission", async () => {
  const { dependencies, activity } = runtime();
  assert.equal((await coordinateEnquiry(intoRealm(sample), context, "bad", actorKey, configFor(sample.journey), dependencies)).code, "INVALID_REQUEST_KEY");
  assert.equal(activity.admissions.length, 0);
});
await check("concurrent identical requests send once with an atomic store adapter", async () => {
  const { dependencies, activity } = runtime();
  let claimed = false; let saved;
  dependencies.store.admit = async () => saved ? { state: "CONFIRMED", submissionId: saved } : claimed ? { state: "BUSY" } : (claimed = true, { state: "GRANTED", lease });
  dependencies.store.settle = async (_, __, result) => { saved = result.submissionId; };
  const results = await Promise.all([dispatch(dependencies), dispatch(dependencies)]);
  assert.equal(activity.sends, 1);
  assert.equal(results.filter(result => result.state === "CONFIRMED").length, 1);
  assert.equal(results.filter(result => result.code === "REQUEST_IN_PROGRESS").length, 1);
  assert.equal((await dispatch(dependencies)).state, "CONFIRMED");
  assert.equal(activity.sends, 1);
});
await check("a late timed-out admission can never resume sending", async () => {
  const { dependencies, activity } = runtime();
  let release;
  dependencies.store.admit = () => new Promise(resolve => { release = resolve; });
  const pending = dispatch(dependencies);
  for (let n = 0; n < 8; n++) await Promise.resolve();
  [...timers.values()][0]();
  assert.equal((await pending).code, "DELIVERY_UNAVAILABLE");
  release({ state: "GRANTED", lease });
  for (let n = 0; n < 8; n++) await Promise.resolve();
  assert.equal(activity.sends, 0);
});
await check("input and form configuration cannot change after admission begins", async () => {
  const { dependencies } = runtime();
  const input = intoRealm(sample);
  const config = configFor(sample.journey);
  let submitted;
  dependencies.store.admit = async () => {
    input.name = "Changed during admission";
    config.binding.formId = submissionId;
    config.authorization = "changed";
    return { state: "GRANTED", lease };
  };
  dependencies.request = async (_, init) => {
    submitted = JSON.parse(init.body).submission; intercepted++;
    assert.equal(init.headers.Authorization, "synthetic-not-a-credential");
    return confirmed(init);
  };
  const result = await coordinateEnquiry(input, context, requestKey, actorKey, config, dependencies);
  assert.equal(result.state, "CONFIRMED");
  assert.equal(submitted.formId, formId);
  assert.equal(submitted.submissions.k3d_contact_name, sample.name);
});
console.log("WIX_DELIVERY_CHECKS=PASS (" + checks + " checks; " + intercepted + " intercepted attempts; real network=0)");
console.log("ROUTE_BOUNDARY_CHECKED; NO_REAL_CREDENTIALS; NO_REMOTE_WRITES; NO_AUTOMATIC_RETRY");
