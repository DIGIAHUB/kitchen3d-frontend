import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../src/lib/enquiries/", import.meta.url);
const modules = new Map();
function load(name) {
  if (modules.has(name)) return modules.get(name);
  const source = readFileSync(new URL(name + ".ts", root), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const result = { exports: {} };
  modules.set(name, result.exports);
  vm.runInThisContext("(function(module,exports,require){" + compiled.outputText + "\n})", { filename: name + ".ts" })(
    result, result.exports, dependency => {
      assert.ok(["./options", "./contract", "./wix-cms-transport"].includes(dependency));
      return load(dependency.slice(2));
    },
  );
  return result.exports;
}
const { writeCmsEnquiryOnce } = load("wix-cms-transport");
const key = "11111111-1111-4111-8111-111111111111";
const input = {
  journey: "installation", supplier: "Still deciding", removal: "Not sure yet", delivery: "", start: "",
  selectedServices: [], trades: "", files: [], visit: "", time: "", notes: "", name: "Synthetic Test",
  postcode: "M1 1AA", address: "Synthetic test address", phone: "07700900000", email: "", contact: "Phone",
};
const context = { today: "2026-09-18" };
let calls = 0;
const confirmed = async (url, init) => {
  calls++;
  assert.equal(url, "https://www.wixapis.com/wix-data/v2/items");
  assert.equal(init.method, "POST");
  assert.equal(init.redirect, "error");
  assert.equal(init.cache, "no-store");
  assert.equal(init.headers["wix-site-id"], "543768f5-be18-4f7c-bb3b-380f4b05c925");
  assert.equal(init.headers.Authorization, "synthetic-not-a-credential");
  const body = JSON.parse(init.body);
  assert.deepEqual(Object.keys(body), ["dataCollectionId", "dataItem"]);
  assert.equal(body.dataCollectionId, "Kitchen3DEnquiries");
  assert.equal(body.dataItem.id, key);
  assert.deepEqual(Object.keys(body.dataItem.data).sort(), ["journey", "payload", "receivedAt", "status"]);
  assert.equal(body.dataItem.data.status, "NEW");
  assert.equal(body.dataItem.data.payload.values.k3d_contact_name, "Synthetic Test");
  assert.equal("files" in body.dataItem.data.payload, false);
  return Response.json({ dataItem: { id: key, dataCollectionId: "Kitchen3DEnquiries" } });
};

assert.deepEqual(await writeCmsEnquiryOnce(input, context, key, "synthetic-not-a-credential", confirmed), { state: "CONFIRMED", automaticRetryAllowed: false });
assert.equal(calls, 1);
for (const [badInput, badKey, badAuth] of [
  [{ ...input, name: "" }, key, "synthetic-not-a-credential"],
  [{ ...input, files: [{ name: "synthetic.pdf", type: "application/pdf", size: 12 }] }, key, "synthetic-not-a-credential"],
  [input, "not-a-request-key", "synthetic-not-a-credential"],
  [input, key, "bad\nheader"],
]) {
  const before = calls;
  assert.equal((await writeCmsEnquiryOnce(badInput, context, badKey, badAuth, confirmed)).state, "UNCONFIRMED");
  assert.equal(calls, before);
}
for (const response of [
  async () => new Response(null, { status: 409 }),
  async () => Response.json({ dataItem: { id: "different", dataCollectionId: "Kitchen3DEnquiries" } }),
  async () => Response.json({ dataItem: { id: key, dataCollectionId: "Other" } }),
  async () => { throw new Error("private synthetic transport failure"); },
]) {
  assert.equal((await writeCmsEnquiryOnce(input, context, key, "synthetic-not-a-credential", response)).state, "UNCONFIRMED");
}
console.log("WIX_CMS_ENQUIRY_CHECKS=PASS (private inbox writer; synthetic only; no remote writes)");
