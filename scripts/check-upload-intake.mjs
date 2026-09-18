import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

// Synthetic byte headers only. No disk files, HTTP, credentials or storage.
let checks = 0;
function check(name, test) { try { test(); checks++; } catch (cause) { throw new Error(`Upload intake check failed: ${name}`, { cause }); } }
const copy = value => JSON.parse(JSON.stringify(value));
async function load(file, dependencies = {}) {
  const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const compiledModule = { exports: {} };
  vm.runInNewContext(compiled.outputText, {
    module: compiledModule, exports: compiledModule.exports, Object, Reflect, Uint8Array,
    require: name => { if (Object.hasOwn(dependencies, name)) return dependencies[name]; throw new Error(`Unexpected dependency: ${name}`); },
  }, { filename: file });
  return compiledModule.exports;
}
const contract = await load("src/lib/enquiries/contract.ts", { "./options": { enquiryOptions: { fileTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"] } } });
const { inspectPendingUploads } = await load("src/lib/enquiries/upload-intake.ts", { "./contract": contract });
const headers = {
  "image/jpeg": [0xff, 0xd8, 0xff, 0xe0],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/webp": [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
  "application/pdf": [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31],
};
for (const [type, header] of Object.entries(headers)) check(`${type} accepted only with matching bytes`, () => {
  const result = inspectPendingUploads([{ name: `synthetic.${type.split("/")[1]}`, type, bytes: new Uint8Array(header) }]);
  assert.equal(result.ok, true); assert.equal(result.accepted[0].size, header.length);
});
check("empty list is valid and contains no content", () => assert.deepEqual(JSON.parse(JSON.stringify(inspectPendingUploads([]))), { ok: true, accepted: [] }));
for (const value of [null, {}, [null], [{ name: "test.jpg", type: "image/jpeg", bytes: [0xff] }], [{ name: "../test.jpg", type: "image/jpeg", bytes: new Uint8Array(headers["image/jpeg"]) }]]) {
  check("unsafe shapes fail closed", () => assert.equal(inspectPendingUploads(value).ok, false));
}
check("declared MIME cannot override mismatched content", () => assert.deepEqual(copy(inspectPendingUploads([{ name: "synthetic.jpg", type: "image/jpeg", bytes: new Uint8Array(headers["application/pdf"]) }])), { ok: false, code: "SIGNATURE_MISMATCH" }));
check("unsupported MIME fails closed", () => assert.deepEqual(copy(inspectPendingUploads([{ name: "synthetic.svg", type: "image/svg+xml", bytes: new Uint8Array([60]) }])), { ok: false, code: "UNSUPPORTED_FILE" }));
check("more than five files fails closed", () => {
  const files = Array.from({ length: 6 }, () => ({ name: "synthetic.jpg", type: "image/jpeg", bytes: new Uint8Array(headers["image/jpeg"]) }));
  assert.deepEqual(copy(inspectPendingUploads(files)), { ok: false, code: "TOO_MANY_FILES" });
});
const source = await readFile(new URL("../src/lib/enquiries/upload-intake.ts", import.meta.url), "utf8");
check("no network, storage or application code is imported", () => {
  assert.doesNotMatch(source, /\bfetch\s*\(|\bWIX_[A-Z_]+\b|from\s+["']node:fs|\bwriteFile\s*\(|\bconsole\./i);
});
console.log(`UPLOAD_INTAKE_CHECKS=PASS (${checks} synthetic checks)`);
console.log("BYTE_SIGNATURE_ONLY; NETWORK=0; STORAGE=0; LIVE_COLLECTION=DISABLED");
