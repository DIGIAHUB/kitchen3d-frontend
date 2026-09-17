import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);

async function loadModule(file, env = {}, fetch = () => { throw new Error("Network access is forbidden in this test"); }) {
  const source = await readFile(new URL(file, root), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const compiledModule = { exports: {} };
  vm.runInNewContext(compiled.outputText, { module: compiledModule, exports: compiledModule.exports, process: { env }, fetch }, { filename: fileURLToPath(new URL(file, root)) });
  return compiledModule.exports;
}

// All four CMS operations stay offline, including when key-shaped values exist.
let calls = 0;
const offline = await loadModule("src/lib/wix.ts", {
  K3D_LOCAL_PREVIEW: "1", WIX_SITE_ID: "synthetic-site", WIX_API_KEY: "synthetic-key",
}, () => { calls++; throw new Error("Unexpected fetch"); });
assert.equal((await offline.getAllPages()).length, 0);
assert.equal((await offline.getAllPosts()).length, 0);
assert.equal(await offline.getPageBySlug("home"), null);
assert.equal(await offline.getPostBySlug("test"), null);
assert.equal(calls, 0);

// The original missing-credential gate is preserved when preview is off.
const normal = await loadModule("src/lib/wix.ts");
await assert.rejects(normal.getAllPages(), /Missing WIX_SITE_ID or WIX_API_KEY/);

const { previewFilesError, previewPhonePattern } = await loadModule("src/lib/preview-validation.ts");
const photo = { type: "image/jpeg", size: 1024 };
assert.equal(previewFilesError([]), "");
assert.equal(previewFilesError([photo]), "");
assert.equal(previewFilesError([{ type: "application/pdf", size: 10 * 1024 * 1024 }]), "");
assert.notEqual(previewFilesError(Array(6).fill(photo)), "");
assert.notEqual(previewFilesError([{ type: "text/html", size: 100 }]), "");
assert.notEqual(previewFilesError([{ ...photo, size: 10 * 1024 * 1024 + 1 }]), "");
assert.notEqual(previewFilesError(Array(3).fill({ ...photo, size: 8 * 1024 * 1024 })), "");
const phone = new RegExp(`^(?:${previewPhonePattern})$`, "v");
assert.equal(phone.test("07700900000"), true);
assert.equal(phone.test("+44 (7700) 900000"), true);
assert.equal(phone.test("-------"), false);
assert.equal(phone.test("       "), false);
assert.equal(phone.test("123"), false);

for (const file of ["src/app/installation-enquiry/page.tsx", "src/app/plan-your-kitchen/page.tsx"]) {
  const source = await readFile(new URL(file, root), "utf8");
  assert.match(source, /process\.env\.K3D_LOCAL_PREVIEW === "1"/);
  assert.match(source, /: <EnquiryUnavailable journey=/);
  assert.doesNotMatch(source, /notFound\(\)/);
  assert.match(source, /index: false, follow: false/);
}
const form = await readFile(new URL("src/components/preview/enquiry-wizard.tsx", root), "utf8");
assert.doesNotMatch(form, /\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)\s*[.(]/);
assert.doesNotMatch(form, /dangerouslySetInnerHTML|use server/);
assert.match(form, /event\.preventDefault\(\)/);
assert.match(form, /disabled=\{!today\}/);
assert.match(form, /import \{ enquiryOptions \} from "@\/lib\/enquiries\/options"/);
assert.doesNotMatch(form, /from ["'][^"']*enquiries\/contract["']/);
for (const field of ["supplier", "removal", "stage", "style", "timing", "services", "trades", "time", "contact"]) {
  assert.ok(form.includes(`enquiryOptions.${field}.map(`), `${field} must render from shared choices`);
}
assert.match(form, /accept=\{enquiryOptions\.fileTypes\.join\(","\)\}/);
const { enquiryOptions } = await loadModule("src/lib/enquiries/options.ts");
assert.equal(enquiryOptions.services.length, 13);
assert.equal(new Set(enquiryOptions.services).size, 13);
assert.ok(enquiryOptions.services.includes("Specialist trades"));
assert.ok(enquiryOptions.services.includes("Help me decide"));
console.log("PREVIEW_CHECKS=PASS (offline CMS, original credential gate, file limits, phone format, route guards, form safety, shared choices)");
console.log("WIX_NETWORK_CALLS=0; PUBLICATION_STATUS=HOLD");
