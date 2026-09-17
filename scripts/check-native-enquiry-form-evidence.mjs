import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import { nativeEnquiryFormEvidence } from "../config/native-enquiry-form-evidence.mjs";

// Offline evidence comparison only: no credentials, HTTP, customer data or
// runtime form bindings. Dashboard observation is deliberately not API proof.
let checks = 0;
function check(name, test) {
  try { test(); checks++; } catch (cause) { throw new Error(`Native form evidence check failed: ${name}`, { cause }); }
}
async function loadAdapter() {
  const source = await readFile(new URL("../src/lib/enquiries/wix-submission-adapter.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const compiledModule = { exports: {} };
  vm.runInNewContext(compiled.outputText, {
    module: compiledModule, exports: compiledModule.exports, Object, Reflect,
    require: name => {
      if (name === "./contract") return { mapEnquiryToLogicalTargets() { throw new Error("not used"); } };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename: "wix-submission-adapter.ts" });
  return compiledModule.exports;
}

const adapter = await loadAdapter();
const source = await readFile(new URL("../src/lib/enquiries/wix-submission-adapter.ts", import.meta.url), "utf8");
const expectedShared = [
  "k3d_services", "k3d_trade_arrangement", "k3d_project_files", "k3d_visit_date", "k3d_visit_time_preference", "k3d_project_notes",
  "k3d_contact_name", "k3d_project_postcode", "k3d_project_address", "k3d_contact_phone", "k3d_contact_email", "k3d_preferred_contact",
];

check("evidence is explicitly non-runtime", () => assert.equal(nativeEnquiryFormEvidence.evidenceOnly, true));
check("evidence uses the exact Kitchen3D site", () => assert.equal(nativeEnquiryFormEvidence.siteId, adapter.KITCHEN3D_ENQUIRY_SITE_ID));
check("runtime bindings remain null", () => assert.deepEqual(JSON.parse(JSON.stringify(adapter.inactiveEnquiryBindings)), { installation: null, complete: null }));
check("source has no import of dashboard evidence", () => assert.doesNotMatch(source, /native-enquiry-form-evidence/));
for (const journey of ["installation", "complete"]) {
  const observed = nativeEnquiryFormEvidence.journeys[journey];
  const targets = Object.keys(adapter.expectedEnquiryTargets[journey]);
  check(`${journey}: form ID is a nonzero GUID`, () => assert.match(observed.formId, /^(?!00000000-0000-0000-0000-000000000000)[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/));
  check(`${journey}: exactly sixteen observed targets remain represented`, () => assert.equal(targets.length, 16));
  check(`${journey}: shared target set remains represented`, () => assert.ok(expectedShared.every(target => targets.includes(target))));
  check(`${journey}: observed required targets are represented`, () => assert.ok(observed.required.every(target => targets.includes(target))));
  check(`${journey}: observed conditional targets remain represented`, () => assert.deepEqual(Object.values(observed.conditionalRequired).sort(), ["k3d_contact_email", "k3d_contact_phone"]));
}
console.log(`NATIVE_FORM_EVIDENCE=PASS (${checks} offline checks)`);
console.log("DASHBOARD_OBSERVATION_ONLY; REMOTE_SCHEMA_NOT_VERIFIED; RUNTIME_BINDINGS=NULL; LIVE_COLLECTION=DISABLED");
