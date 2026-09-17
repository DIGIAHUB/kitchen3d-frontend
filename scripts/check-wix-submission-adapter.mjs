import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

// Synthetic-only, no credentials, HTTP, real form IDs, files or customer data.
const root = new URL("../", import.meta.url);
const activity = { network: 0, logs: 0 };
let checks = 0;
const copy = value => JSON.parse(JSON.stringify(value));
function check(name, test) {
  try { test(); checks++; } catch (cause) { throw new Error(`Submission adapter check failed: ${name}`, { cause }); }
}
async function checkAsync(name, test) {
  try { await test(); checks++; } catch (cause) { throw new Error(`Submission pipeline check failed: ${name}`, { cause }); }
}
async function load(file, dependencies = {}) {
  const source = await readFile(new URL(file, root), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const compiledModule = { exports: {} };
  const network = () => { activity.network++; throw new Error("Network forbidden"); };
  const log = () => { activity.logs++; throw new Error("Application logs forbidden"); };
  vm.runInNewContext(compiled.outputText, {
    // Model one server realm across isolated test modules: JSON.parse must
    // create the same plain-object prototype that the contract checks.
    module: compiledModule, exports: compiledModule.exports, Object, JSON, Response,
    URL, TextDecoder, Uint8Array, setTimeout, clearTimeout,
    process: { env: { K3D_ENQUIRIES_ENABLED: "1", WIX_SITE_ID: "synthetic-wrong-site", WIX_API_KEY: "synthetic-no-key" } },
    fetch: network, XMLHttpRequest: network, WebSocket: network,
    console: { log, info: log, warn: log, error: log },
    require: name => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unapproved dependency: ${name}`);
    },
  }, { filename: file });
  return compiledModule.exports;
}
const options = await load("src/lib/enquiries/options.ts");
const contract = await load("src/lib/enquiries/contract.ts", { "./options": options });
const adapter = await load("src/lib/enquiries/wix-submission-adapter.ts", { "./contract": contract });
const { prepareEnquirySubmission, classifyEnquiryReceipt, expectedEnquiryTargets, inactiveEnquiryBindings, KITCHEN3D_ENQUIRY_SITE_ID } = adapter;
const context = { today: "2026-09-07" };
const syntheticFormId = "11111111-1111-4111-8111-111111111111";
const syntheticSubmissionId = "22222222-2222-4222-8222-222222222222";
const namespace = "wix.form_app.form";
const common = {
  selectedServices: [], trades: "", files: [], visit: "", time: "", notes: "",
  name: "Synthetic Test", postcode: "M1 1AA", address: "Synthetic project address",
  phone: "07700900000", email: "", contact: "Phone",
};
const samples = [
  { journey: "installation", supplier: "Still deciding", removal: "Not sure yet", delivery: "", start: "", ...common },
  { journey: "complete", stage: "Just exploring ideas", style: "", budget: "", start: "", ...common },
];
const bindingFor = journey => ({
  siteId: KITCHEN3D_ENQUIRY_SITE_ID, journey, formId: syntheticFormId, namespace,
  fieldTypes: copy(expectedEnquiryTargets[journey]),
});

check("no remote form IDs configured", () => {
  assert.deepEqual(copy(inactiveEnquiryBindings), { installation: null, complete: null });
  assert.equal(Object.isFrozen(inactiveEnquiryBindings), true);
});
for (const input of samples) {
  const binding = bindingFor(input.journey);
  check(`${input.journey}: default fails without a binding`, () => assert.equal(prepareEnquirySubmission(input, context).code, "FORM_BINDING_REQUIRED"));
  check(`${input.journey}: exactly sixteen matching schema targets`, () => {
    const logical = contract.mapEnquiryToLogicalTargets(input, context).draft;
    assert.equal(Object.keys(binding.fieldTypes).length, 16);
    assert.deepEqual(Object.keys(binding.fieldTypes).sort(), [...Object.keys(logical.values), logical.files.target].sort());
  });
  check(`${input.journey}: valid native submission object, never sent`, () => {
    const prepared = prepareEnquirySubmission(input, context, binding);
    assert.equal(prepared.ok, true);
    assert.equal(prepared.state, "PREPARED_NOT_SENT");
    assert.equal(prepared.liveCollectionAllowed, false);
    assert.equal(prepared.submission.formId, syntheticFormId);
    assert.deepEqual(Object.keys(prepared.submission).sort(), ["formId", "submissions"]);
    const values = prepared.submission.submissions;
    assert.equal(values.k3d_contact_name, input.name);
    assert.equal(values.k3d_contact_phone, input.phone);
    for (const key of ["k3d_services", "k3d_contact_email", "k3d_project_files", "k3d_visit_date", "contactId", "status", "namespace", "marketingConsent"]) assert.equal(key in values, false);
    assert.ok(Object.values(values).every(value => value !== "" && !(Array.isArray(value) && value.length === 0)));
  });
  check(`${input.journey}: email-only does not invent phone`, () => {
    const result = prepareEnquirySubmission({ ...input, contact: "Email", phone: "", email: "synthetic@example.invalid" }, context, binding);
    assert.equal(result.ok, true);
    assert.equal(result.submission.submissions.k3d_contact_email, "synthetic@example.invalid");
    assert.equal("k3d_contact_phone" in result.submission.submissions, false);
  });
  check(`${input.journey}: preserve text, choices and dates without creating a slot`, () => {
    const source = { ...input, name: "  محمد رضا — Synthetic  ", notes: "Synthetic first line\nSecond line", visit: "2026-09-08", time: "Morning", selectedServices: [...options.enquiryOptions.services] };
    const result = prepareEnquirySubmission(source, context, binding);
    assert.equal(result.ok, true);
    assert.equal(result.submission.submissions.k3d_contact_name, source.name);
    assert.equal(result.submission.submissions.k3d_project_notes, source.notes);
    assert.deepEqual(copy(result.submission.submissions.k3d_services), source.selectedServices);
    source.selectedServices.push("mutated");
    assert.equal(result.submission.submissions.k3d_services.includes("mutated"), false);
    assert.equal(result.submission.submissions.k3d_visit_date, "2026-09-08");
    assert.equal("appointmentDetails" in result.submission, false);
  });
  check(`${input.journey}: files cannot be silently dropped or sent as local metadata`, () => {
    const result = prepareEnquirySubmission({ ...input, files: [{ name: "synthetic.jpg", type: "image/jpeg", size: 1024 }] }, context, binding);
    assert.deepEqual(copy(result), { ok: false, code: "UPLOADS_NOT_READY" });
  });
  for (const change of [
    { siteId: "33333333-3333-4333-8333-333333333333" },
    { journey: input.journey === "complete" ? "installation" : "complete" },
    { formId: "00000000-0000-0000-0000-000000000000" }, { formId: "" }, { formId: "not-a-guid" },
    { namespace: "other.app.form" }, { fieldTypes: {} },
    { fieldTypes: { ...binding.fieldTypes, k3d_contact_name: "ARRAY" } },
    { fieldTypes: { ...binding.fieldTypes, extra_target: "STRING" } }, { enabled: true },
  ]) {
    check(`${input.journey}: invalid binding ${Object.keys(change).join()}`, () => assert.equal(prepareEnquirySubmission(input, context, { ...binding, ...change }).code, "INVALID_FORM_BINDING"));
  }
  check(`${input.journey}: binding descriptors cannot run getters`, () => {
    let calls = 0;
    const unsafe = { ...binding, get formId() { calls++; return syntheticFormId; } };
    assert.equal(prepareEnquirySubmission(input, context, unsafe).code, "INVALID_FORM_BINDING");
    assert.equal(calls, 0);
  });
  for (const badInput of [{ ...input, name: " " }, { ...input, formId: syntheticFormId }, { ...input, siteId: KITCHEN3D_ENQUIRY_SITE_ID }, { ...input, selectedServices: ["Structural extension"] }, { ...input, visit: "2026-09-06" }]) {
    check(`${input.journey}: raw answers revalidated`, () => {
      const result = prepareEnquirySubmission(badInput, context, binding);
      assert.equal(result.ok, false);
      assert.ok(result.errors?.length);
      assert.equal("submission" in result, false);
    });
  }
}

const expected = { formId: syntheticFormId, namespace };
const receipt = { id: syntheticSubmissionId, formId: syntheticFormId, namespace, status: "CONFIRMED" };
check("matching CONFIRMED submission is interpreted without booking or retry", () => {
  assert.deepEqual(copy(classifyEnquiryReceipt(receipt, expected)), {
    state: "CONFIRMED", submissionId: syntheticSubmissionId, appointmentConfirmed: false, automaticRetryAllowed: false,
  });
});
for (const status of ["PENDING", "PAYMENT_WAITING", "PAYMENT_CANCELED", "CONFIRMED_WITH_PAYMENT", "", null]) {
  check(`status ${status} is not enquiry confirmation`, () => {
    const result = classifyEnquiryReceipt({ ...receipt, status }, expected);
    assert.equal(result.state, "UNCONFIRMED");
    assert.equal(result.automaticRetryAllowed, false);
    assert.equal(result.nextAction, "RECONCILE_BEFORE_RETRY");
  });
}
for (const change of [{ id: "" }, { id: "00000000-0000-0000-0000-000000000000" }, { formId: syntheticSubmissionId }, { namespace: "other.app.form" }, { status: undefined }, { appointmentDetails: {} }, { orderDetails: {} }]) {
  check(`mismatched/incomplete receipt ${Object.keys(change).join()}`, () => assert.equal(classifyEnquiryReceipt({ ...receipt, ...change }, expected).state, "UNCONFIRMED"));
}
for (const value of [null, undefined, "HTTP 200", [], { ok: true }, { status: 200, submission: receipt }, { formSubmission: receipt }, { error: "Synthetic secret-looking provider failure" }]) {
  check("malformed or HTTP-envelope-only receipt is not success", () => {
    const result = classifyEnquiryReceipt(value, expected);
    assert.equal(result.state, "UNCONFIRMED");
    assert.equal(JSON.stringify(result).includes("secret-looking"), false);
  });
}
for (const value of [null, {}, { formId: syntheticFormId, namespace: "other" }, { ...expected, extra: true }]) {
  check("receipt expectation fails closed", () => assert.equal(classifyEnquiryReceipt(receipt, value).code, "INVALID_EXPECTATION"));
}
check("receipt getters rejected without execution", () => {
  let calls = 0;
  assert.equal(classifyEnquiryReceipt({ ...receipt, get status() { calls++; return "CONFIRMED"; } }, expected).state, "UNCONFIRMED");
  assert.equal(calls, 0);
});
const routeSource = await readFile(new URL("src/app/api/enquiries/route.ts", root), "utf8");
check("route does not import preparation or body-reading helpers", () => assert.doesNotMatch(routeSource, /\bimport\b|prepareEnquirySubmission|readEnquiryJson/));
const route = await load("src/app/api/enquiries/route.ts");
const disabled = await route.POST(new Proxy({}, { get() { throw new Error("Disabled route must not read any request property"); } }));
check("route cannot be activated through injected environment", () => assert.equal(disabled.status, 503));
const { readEnquiryJson } = await load("src/lib/enquiries/request-boundary.ts");
const syntheticOrigin = "https://synthetic.example.invalid";
for (const input of samples) {
  await checkAsync(`${input.journey}: parsed request through semantic validation and preparation`, async () => {
    const request = new Request(`${syntheticOrigin}/api/enquiries`, {
      method: "POST", headers: { origin: syntheticOrigin, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(input),
    });
    const parsed = await readEnquiryJson(request, syntheticOrigin);
    assert.equal(parsed.ok, true);
    const prepared = prepareEnquirySubmission(parsed.value, context, bindingFor(input.journey));
    assert.equal(prepared.ok, true);
    assert.equal(prepared.state, "PREPARED_NOT_SENT");
    // Normalize the synthetic VM result back into the harness's object realm.
    // Production modules share one realm; retain the strict plain-object guard.
    const receiptExpectation = copy(prepared.expectedReceipt);
    // Simulated provider objects only. Nothing executes an HTTP submission.
    assert.equal(classifyEnquiryReceipt(receipt, receiptExpectation).state, "CONFIRMED");
    assert.equal(classifyEnquiryReceipt({ ...receipt, status: "PENDING" }, receiptExpectation).state, "UNCONFIRMED");
  });
  await checkAsync(`${input.journey}: parsed customer body cannot choose a target form`, async () => {
    const parsed = await readEnquiryJson(new Request(`${syntheticOrigin}/api/enquiries`, {
      method: "POST", headers: { origin: syntheticOrigin, "content-type": "application/json" },
      body: JSON.stringify({ ...input, formId: syntheticFormId }),
    }), syntheticOrigin);
    assert.equal(parsed.ok, true);
    const prepared = prepareEnquirySubmission(parsed.value, context, bindingFor(input.journey));
    assert.equal(prepared.ok, false);
    assert.equal(prepared.errors[0].code, "unknown_field");
  });
}
check("zero network and logs", () => assert.deepEqual(activity, { network: 0, logs: 0 }));
console.log(`SUBMISSION_ADAPTER_CHECKS=PASS (${checks} synthetic checks)`);
console.log("NETWORK_CALLS=0; APPLICATION_LOGS=0; REMOTE_FORM_IDS=NONE; LIVE_COLLECTION=DISABLED");
console.log("PREPARED_NOT_SENT; NATIVE_TRANSPORT_UPLOADS_SPAM_IDEMPOTENCY_AND_DELIVERY_NOT_VERIFIED");
