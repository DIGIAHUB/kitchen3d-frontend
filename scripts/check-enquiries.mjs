import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { buildWixEnquiryFormDrafts } from "./lib/wix-enquiry-form-drafts.mjs";

// Synthetic, dependency-free checks only. No customer data, HTTP requests,
// credentials, Wix records, calendar operations or file uploads are involved.
const root = new URL("../", import.meta.url);
const activity = { network: 0, logs: 0, requestReads: 0 };
let checks = 0;
const sources = new Map();

async function loadModule(file, env = {}, allowedDependencies = {}) {
  const source = await readFile(new URL(file, root), "utf8");
  sources.set(file, source);
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const compiledModule = { exports: {} };
  const forbidNetwork = () => {
    activity.network++;
    throw new Error("Network access is forbidden in enquiry checks");
  };
  const forbidLog = () => {
    activity.logs++;
    throw new Error("The enquiry boundary must not log submitted details");
  };
  vm.runInNewContext(compiled.outputText, {
    module: compiledModule,
    exports: compiledModule.exports,
    process: { env },
    // Inputs are created in this Node realm. Share Object so the contract's
    // plain-record guard tests their real prototype, not a VM realm mismatch.
    Object,
    Response,
    fetch: forbidNetwork,
    XMLHttpRequest: forbidNetwork,
    WebSocket: forbidNetwork,
    console: { log: forbidLog, info: forbidLog, warn: forbidLog, error: forbidLog, debug: forbidLog },
    require: name => {
      if (Object.hasOwn(allowedDependencies, name)) return allowedDependencies[name];
      throw new Error(`Unexpected dependency in staged enquiry module: ${name}`);
    },
  }, { filename: fileURLToPath(new URL(file, root)) });
  return compiledModule.exports;
}

function check(name, test) {
  try {
    test();
    checks++;
  } catch (error) {
    throw new Error(`Enquiry check failed: ${name}`, { cause: error });
  }
}

const jsonCopy = value => JSON.parse(JSON.stringify(value));
const context = { today: "2026-09-05" };
const sharedOptions = await loadModule("src/lib/enquiries/options.ts");
const { validateEnquiry, mapEnquiryToLogicalTargets, enquiryFieldKeys, enquiryOptions } = await loadModule("src/lib/enquiries/contract.ts", {}, { "./options": sharedOptions });
check("contract reexports the client-safe shared options without duplication", () => {
  assert.equal(enquiryOptions, sharedOptions.enquiryOptions);
});

const shared = {
  selectedServices: [], trades: "", files: [], visit: "", time: "", notes: "",
  name: "Synthetic Test Person", postcode: "M1 1AA", address: "Synthetic project address",
  phone: "07700900000", email: "", contact: "Phone",
};
const installation = {
  journey: "installation", supplier: "Still deciding", removal: "Not sure yet", delivery: "", start: "", ...shared,
};
const complete = {
  journey: "complete", stage: "Just exploring ideas", style: "", budget: "", start: "", ...shared,
};

function valid(input, label, validationContext = context) {
  check(label, () => {
    const result = validateEnquiry(input, validationContext);
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.deepEqual(jsonCopy(result.value), jsonCopy(input));
  });
}

function invalid(input, label, expectedField, validationContext = context) {
  check(label, () => {
    const result = validateEnquiry(input, validationContext);
    assert.equal(result.ok, false);
    assert.ok(Array.isArray(result.errors) && result.errors.length > 0);
    assert.equal("value" in result, false);
    assert.equal("draft" in result, false);
    for (const error of result.errors) {
      assert.equal(typeof error.field, "string");
      assert.equal(typeof error.code, "string");
      assert.equal("value" in error, false, "Errors must not echo submitted values");
    }
    if (expectedField) assert.ok(result.errors.some(error => error.field === expectedField), JSON.stringify(result));
    const mapping = mapEnquiryToLogicalTargets(input, validationContext);
    assert.equal(mapping.ok, false, "Mapping must revalidate instead of bypassing validation");
    assert.equal("draft" in mapping, false);
  });
}

valid(installation, "installation with phone-only contact and optional blanks");
valid(complete, "complete kitchen with phone-only contact and optional blanks");
for (const [name, input] of [["installation", installation], ["complete", complete]]) {
  for (const service of ["Appliance installation", "Plumbing coordination", "Electrical-work coordination", "Gas-work coordination", "Tiling coordination", "Plastering coordination"]) {
    valid({ ...input, selectedServices: [service] }, `${name}: confirmed ${service} is selectable`);
  }
  for (const service of ["Plasterboard installation", "Drylining", "Structural extensions", "Certified gas installation"]) {
    invalid({ ...input, selectedServices: [service] }, `${name}: unconfirmed ${service} excluded`, "selectedServices");
  }
  valid({ ...input, contact: "Email", phone: "", email: "synthetic@example.invalid" }, `${name}: email-only contact`);
  valid({ ...input, email: "synthetic@example.invalid", phone: "+44 (7700) 900000" }, `${name}: both contact details`);
  invalid({ ...input, name: "   " }, `${name}: whitespace-only name`, "name");
  invalid({ ...input, address: "   " }, `${name}: whitespace-only project address`, "address");
  invalid({ ...input, phone: "" }, `${name}: phone required when preferred`, "phone");
  invalid({ ...input, contact: "Email", email: "" }, `${name}: email required when preferred`, "email");
  invalid({ ...input, contact: "Email", email: "synthetic@example.invalid", phone: "bad" }, `${name}: optional phone still validated`, "phone");
  invalid({ ...input, email: "not-an-email" }, `${name}: optional email still validated`, "email");
  invalid({ ...input, contact: "SMS" }, `${name}: unknown contact method`, "contact");
  invalid({ ...input, selectedServices: ["Unapproved structural extension"] }, `${name}: service allowlist`, "selectedServices");
  invalid({ ...input, selectedServices: ["Worktops", "Worktops"] }, `${name}: repeated services rejected`, "selectedServices");
  invalid({ ...input, trades: "All trades are directly certified" }, `${name}: trade selection allowlist`, "trades");
  invalid({ ...input, time: "Guaranteed 10:00" }, `${name}: time preference allowlist`, "time");
  invalid({ ...input, siteId: "caller-selected-site" }, `${name}: cannot select a Wix site`);
  invalid({ ...input, formId: "caller-selected-form" }, `${name}: cannot select a Wix form`);
  invalid({ ...input, enabled: true }, `${name}: caller cannot enable collection`);
  invalid({ ...input, marketingConsent: true }, `${name}: no invented marketing consent`);
  invalid({ ...input, apiKey: "synthetic-not-a-real-key" }, `${name}: no credential-bearing input`);
  for (const field of Object.keys(input)) {
    const missing = { ...input };
    delete missing[field];
    invalid(missing, `${name}: missing ${field} rejected`);
  }
}

for (const input of [null, undefined, "payload", 12, true, [], {}, { journey: "other" }]) {
  invalid(input, `malformed input ${typeof input}`);
}
invalid(JSON.parse('{"__proto__":{"enabled":true}}'), "prototype-shaped input rejected");
invalid({ ...installation, stage: "Just exploring ideas" }, "installation rejects other journey fields");
invalid({ ...complete, supplier: "Still deciding" }, "complete rejects other journey fields");
invalid({ ...installation, selectedServices: Array(1) }, "sparse service array rejected", "selectedServices");
invalid({ ...installation, files: Array(1) }, "sparse file array rejected", "files");
invalid(Object.assign(Object.create({ inherited: true }), installation), "custom prototype rejected");
invalid(Object.defineProperty({ ...installation }, "hidden", { value: "synthetic", enumerable: false }), "hidden properties rejected");
invalid({ ...installation, [Symbol("synthetic")]: "synthetic" }, "symbol properties rejected");
let getterReads = 0;
const accessorInput = Object.defineProperty({ ...installation }, "name", { enumerable: true, get: () => { getterReads++; return "Synthetic accessor"; } });
invalid(accessorInput, "accessor input rejected without invoking getter");
check("untrusted accessors were never invoked", () => assert.equal(getterReads, 0));

const enumeratedOptions = {
  supplier: ["Howdens", "Wren Kitchens", "B&Q", "Wickes", "Magnet", "DIY Kitchens", "Other", "Still deciding"],
  removal: ["Yes, please include removal", "No, it will be removed", "It has already been removed", "Not sure yet"],
  stage: ["Just exploring ideas", "Ready to discuss a design", "I have a layout or plans", "Ready to get started"],
  style: ["Modern & minimal", "Warm & natural", "Classic / shaker", "A mix of styles", "I have inspiration to share"],
  trades: ["I have my own tradespeople", "Please coordinate the trades needed", "A mixture of my own and coordinated trades"],
  time: ["Morning", "Afternoon", "Please call to arrange"],
};
for (const [field, values] of Object.entries(enumeratedOptions)) {
  const base = ["stage", "style"].includes(field) ? complete : installation;
  for (const value of values) valid({ ...base, [field]: value }, `${field}: approved choice ${value}`);
  invalid({ ...base, [field]: "Unapproved option" }, `${field}: unknown choice`, field);
}
for (const value of ["As soon as practical", "In 1–3 months", "In 3–6 months", "Later this year / next year"]) {
  valid({ ...complete, start: value }, `complete: approved timing ${value}`);
}
invalid({ ...complete, start: "2026-09-06" }, "complete timing is not an installation date", "start");
invalid({ ...installation, start: "As soon as practical" }, "installation start is not a complete timing choice", "start");

const allServices = [
  "Existing kitchen removal", "Cabinets & fitting", "Worktops", "Flooring", "Internal wooden doors",
  "Appliance installation", "Plumbing coordination", "Electrical-work coordination", "Gas-work coordination",
  "Tiling coordination", "Plastering coordination", "Specialist trades", "Help me decide",
];
valid({ ...complete, selectedServices: allServices }, "all approved service choices accepted");
check("both schemas preserve exactly the approved sixteen visible answer fields", () => {
  for (const input of [installation, complete]) {
    const keys = jsonCopy(enquiryFieldKeys[input.journey]);
    assert.equal(keys.length, 16);
    assert.equal(new Set(keys).size, 16);
    assert.deepEqual(keys.slice().sort(), Object.keys(input).filter(key => key !== "journey").sort());
  }
  assert.deepEqual(jsonCopy(enquiryOptions.services), allServices);
});
for (const [field, length] of [["name", 100], ["address", 300], ["notes", 2000]]) {
  valid({ ...installation, [field]: "x".repeat(length) }, `${field}: maximum length accepted`);
  invalid({ ...installation, [field]: "x".repeat(length + 1) }, `${field}: excessive length rejected`, field);
  invalid({ ...installation, [field]: 1 }, `${field}: non-string rejected`, field);
}
valid({ ...complete, budget: "x".repeat(120) }, "budget: maximum length accepted");
invalid({ ...complete, budget: "x".repeat(121) }, "budget: excessive length rejected", "budget");
valid({ ...installation, name: "  محمد رضا ساوادی — Synthetic  " }, "Unicode full name preserved, not split or trimmed");
valid({ ...installation, notes: "Synthetic line one\nSynthetic line two", address: "Synthetic address\nSynthetic second line" }, "notes and addresses may contain line breaks");
invalid({ ...installation, name: "Synthetic\nName" }, "name rejects control characters", "name");
invalid({ ...installation, notes: "Synthetic\u0000notes" }, "notes reject null characters", "notes");
invalid({ ...installation, email: `${"x".repeat(240)}@example.invalid` }, "email length bounded", "email");
for (const postcode of ["M1 1AA", "SW1A 1AA", "GIR 0AA", "m11aa"]) valid({ ...installation, postcode }, `postcode: ${postcode}`);
for (const postcode of ["", "UNKNOWN", "12345", "M1", "M1 1AA trailing"]) invalid({ ...installation, postcode }, `invalid postcode: ${postcode}`, "postcode");
for (const phone of ["-------", "       ", "123", "a07700900000", "0".repeat(26)]) invalid({ ...installation, phone }, "invalid phone", "phone");

valid({ ...installation, delivery: "2020-01-01", start: context.today, visit: "2026-09-06" }, "delivery may be historical; requested start/visit not past");
for (const field of ["delivery", "start", "visit"]) {
  for (const value of ["2026-02-30", "2025-02-29", "2026-13-01", "2026-00-05", "2026-09-00", "26-09-05", "2026-09-05T10:00:00Z"]) {
    invalid({ ...installation, [field]: value }, `${field}: impossible/malformed date ${value}`, field);
  }
}
valid({ ...installation, start: "2028-02-29" }, "actual leap-day date accepted");
invalid({ ...installation, start: "2026-09-04" }, "past preferred installation start rejected", "start");
invalid({ ...installation, visit: "2026-09-04" }, "past preferred visit date rejected", "visit");
for (const today of ["", "2026-02-30", "today", "2026-09-05T00:00:00Z"]) invalid(installation, "invalid validation date fails closed", undefined, { today });

const MiB = 1024 * 1024;
const photo = { name: "synthetic-kitchen.jpg", type: "image/jpeg", size: 1024 };
for (const file of [photo, { name: "synthetic.png", type: "image/png", size: 1 }, { name: "synthetic.webp", type: "image/webp", size: 1 }, { name: "synthetic.pdf", type: "application/pdf", size: 10 * MiB }]) {
  valid({ ...installation, files: [file] }, `accepted file metadata: ${file.type}`);
}
valid({ ...installation, files: Array.from({ length: 5 }, (_, i) => ({ ...photo, name: `synthetic-${i}.jpg` })) }, "five small files accepted");
valid({ ...installation, files: [{ ...photo, size: 10 * MiB }, { name: "synthetic.pdf", type: "application/pdf", size: 10 * MiB }] }, "twenty MiB aggregate accepted");
valid({ ...installation, files: [{ ...photo, name: "x".repeat(251) + ".jpg" }] }, "255-character metadata filename accepted");
valid({ ...installation, files: [{ ...photo, name: "SYNTHETIC.JPEG" }] }, "JPEG extension matching is case insensitive");
for (const files of [
  Array(6).fill(photo),
  [{ ...photo, size: 10 * MiB + 1 }],
  Array(3).fill({ ...photo, size: 8 * MiB }),
  [{ ...photo, size: -1 }], [{ ...photo, size: 0 }], [{ ...photo, size: 0.5 }],
  [{ ...photo, size: NaN }], [{ ...photo, size: Infinity }], [{ ...photo, size: "1024" }],
  [{ ...photo, type: "text/html" }], [{ ...photo, type: "image/svg+xml" }],
  [{ ...photo, name: "synthetic.html" }], [{ ...photo, name: "synthetic.pdf" }],
  [{ ...photo, name: "../synthetic.jpg" }], [{ ...photo, name: "C:\\synthetic.jpg" }],
  [{ ...photo, name: "folder/synthetic.jpg" }], [{ ...photo, name: "synthetic\u0000.jpg" }],
  [{ ...photo, name: "x".repeat(256) + ".jpg" }], [{ ...photo, name: "" }],
  [{ ...photo, url: "https://example.invalid/customer-file" }],
  [{ ...photo, content: "synthetic bytes" }], [{ ...photo, mediaId: "caller-file-id" }],
  [null], ["synthetic.jpg"], {}, null,
]) invalid({ ...installation, files }, "unsafe file metadata rejected", "files");

check("validated result and mapped draft do not share mutable lists or metadata with caller", () => {
  const input = { ...installation, selectedServices: ["Flooring"], files: [{ ...photo }] };
  const result = validateEnquiry(input, context);
  const mapping = mapEnquiryToLogicalTargets(input, context);
  assert.equal(result.ok, true);
  assert.equal(mapping.ok, true);
  input.selectedServices.push("Worktops");
  input.files[0].name = "changed.jpg";
  assert.deepEqual(jsonCopy(result.value.selectedServices), ["Flooring"]);
  assert.equal(result.value.files[0].name, photo.name);
  assert.deepEqual(jsonCopy(mapping.draft.values.k3d_services), ["Flooring"]);
  assert.equal(mapping.draft.files.metadata[0].name, photo.name);
});

for (const input of [
  { ...installation, supplier: "Wren Kitchens", selectedServices: ["Specialist trades", "Flooring"], files: [photo], visit: "2026-09-08", time: "Morning" },
  { ...complete, stage: "Ready to discuss a design", budget: "Synthetic guide only", start: "In 1–3 months", contact: "Email", email: "synthetic@example.invalid", phone: "" },
]) {
  check(`${input.journey}: exact logical mapping and safe contact semantics`, () => {
    const original = JSON.stringify(input);
    const mapped = mapEnquiryToLogicalTargets(input, context);
    assert.equal(mapped.ok, true);
    const draft = jsonCopy(mapped.draft);
    assert.equal(draft.journey, input.journey);
    assert.equal(draft.contact.fullName, input.name);
    assert.equal(draft.contact.email || "", input.email);
    assert.equal(draft.contact.phone || "", input.phone);
    assert.equal("firstName" in draft.contact, false);
    assert.equal("lastName" in draft.contact, false);
    assert.equal("address" in draft.contact, false);
    assert.equal("postcode" in draft.contact, false);
    assert.equal("marketingConsent" in draft.contact, false);
    const expected = {
      k3d_services: input.selectedServices, k3d_trade_arrangement: input.trades,
      k3d_visit_date: input.visit, k3d_visit_time_preference: input.time,
      k3d_project_notes: input.notes, k3d_contact_name: input.name,
      k3d_project_postcode: input.postcode, k3d_project_address: input.address,
      k3d_contact_phone: input.phone, k3d_contact_email: input.email, k3d_preferred_contact: input.contact,
      ...(input.journey === "installation" ? {
        k3d_supplier: input.supplier, k3d_removal: input.removal,
        k3d_delivery_date: input.delivery, k3d_install_start: input.start,
      } : {
        k3d_planning_stage: input.stage, k3d_style: input.style,
        k3d_budget_guide: input.budget, k3d_project_timing: input.start,
      }),
    };
    assert.deepEqual(draft.values, expected);
    assert.deepEqual(draft.files, { target: "k3d_project_files", metadata: input.files });
    assert.equal("k3d_project_files" in draft.values, false, "Unuploaded metadata must not become a Wix upload value");
    assert.doesNotMatch(JSON.stringify(draft), /"(?:bookingId|appointmentId|reservationId|slotId|siteId|formId|submissionId|firstName|lastName|marketingConsent)"/);
    assert.equal(JSON.stringify(input), original, "Mapping must not mutate input");
  });
}

for (const env of [{}, new Proxy({ K3D_LOCAL_PREVIEW: "0", K3D_ENQUIRIES_ENABLED: "1", NEXT_PUBLIC_K3D_ENQUIRIES_ENABLED: "true", WIX_SITE_ID: "synthetic-site", WIX_API_KEY: "synthetic-not-a-real-key" }, { get: (target, key) => target[key] ?? "true" })]) {
  const route = await loadModule("src/app/api/enquiries/route.ts", env);
  const unreadableRequest = new Proxy({}, { get: () => { activity.requestReads++; throw new Error("Disabled route must not consume the request"); } });
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await route.POST(unreadableRequest);
    const body = await response.json();
    check("disabled route is non-collecting even with enabling environment and repeated calls", () => {
      assert.equal(response.status, 503);
      assert.match(response.headers.get("cache-control"), /no-store/);
      assert.match(response.headers.get("x-robots-tag"), /noindex/);
      assert.equal(body.status, "disabled");
      assert.equal(body.code, "ENQUIRY_COLLECTION_DISABLED");
      assert.match(body.message, /No enquiry has been recorded/);
      assert.match(body.message, /no appointment has been booked/);
      assert.equal("submissionId" in body, false);
      assert.equal("bookingId" in body, false);
      assert.equal("details" in body, false);
    });
  }
}

// These checks cover offline composition and internal consistency only. They do
// not establish that Wix accepts this schema or renders it as intended.
const optionsBefore = JSON.stringify(enquiryOptions);
// Normalize across the contract VM's Array realm, just as a future JSON body
// serialization would. This does not send the drafts anywhere.
const wixDrafts = jsonCopy(buildWixEnquiryFormDrafts(enquiryOptions));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function definedIds(value, output = []) {
  if (Array.isArray(value)) value.forEach(item => definedIds(item, output));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "id") {
        if (child === "") assert.equal(value.type, "TEXT", "Only rich-text leaf nodes use blank IDs");
        else output.push(child);
      } else definedIds(child, output);
    }
  }
  return output;
}

check("two offline Wix drafts preserve the approved journeys and never acquire remote form IDs", () => {
  assert.equal(wixDrafts.length, 2);
  assert.deepEqual(wixDrafts.map(draft => draft.journey), ["installation", "complete"]);
  assert.deepEqual(wixDrafts.map(draft => draft.request.form.name), ["Kitchen3D — Installation Enquiry", "Kitchen3D — Complete Kitchen Enquiry"]);
  assert.equal(JSON.stringify(enquiryOptions), optionsBefore, "Builder must not mutate contract options");
  for (const draft of wixDrafts) {
    assert.equal(draft.siteId, "543768f5-be18-4f7c-bb3b-380f4b05c925");
    assert.equal(draft.remoteFormId, null);
    assert.equal(draft.state, "LOCAL_DRAFT_NOT_CREATED");
    assert.equal(Object.hasOwn(draft.request.form, "enabled"), true);
    assert.equal(draft.request.form.enabled, false);
    assert.equal(draft.request.form.namespace, "wix.form_app.form");
    assert.equal(draft.request.form.spamFilterProtectionLevel, "ADVANCED");
    assert.equal(draft.request.form.submissionAccess, "OWNER_AND_COLLABORATORS");
    assert.deepEqual(Object.keys(draft.request), ["form"]);
    assert.equal("id" in draft.request.form, false, "Local field IDs are not remote form IDs");
    assert.match(JSON.stringify(draft.request.form.disabledFormMessage), /No enquiry or appointment can be submitted/);
  }
});

const draftChoiceKeys = {
  k3d_supplier: "supplier", k3d_removal: "removal", k3d_planning_stage: "stage",
  k3d_style: "style", k3d_project_timing: "timing", k3d_trade_arrangement: "trades",
  k3d_visit_time_preference: "time", k3d_preferred_contact: "contact",
};
for (const draft of wixDrafts) {
  const form = draft.request.form;
  const inputs = form.formFields.filter(field => field.fieldType === "INPUT");
  const displays = form.formFields.filter(field => field.fieldType === "DISPLAY");
  const byTarget = Object.fromEntries(inputs.map(field => [field.inputOptions.target, field]));
  check(`${draft.journey}: sixteen unique inputs match logical mapper plus file target`, () => {
    assert.equal(inputs.length, 16);
    assert.equal(displays.length, 5);
    assert.equal(form.formFields.length, 21);
    assert.equal(Object.keys(byTarget).length, 16);
    const mapped = mapEnquiryToLogicalTargets(draft.journey === "installation" ? installation : complete, context);
    assert.equal(mapped.ok, true);
    const targets = [...Object.keys(mapped.draft.values), mapped.draft.files.target].sort();
    assert.deepEqual(Object.keys(byTarget).sort(), targets);
    for (const field of inputs) {
      assert.equal(field.hidden, false);
      assert.equal(field.inputOptions.readOnly, false);
      assert.equal(field.inputOptions.pii, true);
      assert.equal(typeof field.inputOptions.required, "boolean");
    }
  });
  check(`${draft.journey}: fields appear once across four correctly linked steps`, () => {
    assert.deepEqual(form.steps.map(step => step.name), ["Your project", "The details", "Contact", "Review"]);
    assert.deepEqual(form.steps.map(step => step.layout.large.items.length), [5, 7, 7, 2]);
    const placed = form.steps.flatMap(step => step.layout.large.items.map(item => item.fieldId));
    assert.equal(new Set(placed).size, form.formFields.length);
    assert.deepEqual(placed.slice().sort(), form.formFields.map(field => field.id).sort());
    for (const step of form.steps) {
      assert.equal(step.hidden, false);
      assert.deepEqual(step.layout.large.sections, []);
      assert.equal(new Set(step.layout.large.items.map(item => item.row)).size, step.layout.large.items.length);
      for (const item of step.layout.large.items) {
        assert.match(item.fieldId, uuid);
        assert.equal(item.column, 0);
        assert.equal(item.width, 12);
        assert.equal(item.height, 1);
      }
    }
  });
  check(`${draft.journey}: every page ends with its own navigation control, not another answer field`, () => {
    const byId = new Map(form.formFields.map(field => [field.id, field]));
    const navigation = displays.filter(field => field.displayOptions.displayFieldType === "PAGE_NAVIGATION");
    assert.equal(navigation.length, 4);
    assert.equal(new Set(navigation.map(field => field.id)).size, 4);
    assert.equal(displays.filter(field => field.displayOptions.displayFieldType === "RICH_CONTENT").length, 1);
    for (const step of form.steps) {
      const placed = [...step.layout.large.items].sort((a, b) => a.row - b.row || a.column - b.column);
      const controls = placed.map(item => byId.get(item.fieldId)).filter(field => field.displayOptions?.displayFieldType === "PAGE_NAVIGATION");
      assert.equal(controls.length, 1, "Each page must have exactly one placed navigation control");
      const control = controls[0];
      assert.equal(placed.at(-1).fieldId, control.id, "Navigation follows the page's fields or review notice");
      assert.equal(control.fieldType, "DISPLAY");
      assert.equal(control.identifier, "SUBMIT_BUTTON");
      assert.equal("inputOptions" in control, false);
      assert.deepEqual(control.displayOptions.pageNavigationOptions, { previousPageText: "Back", nextPageText: "Next", submitText: "Send enquiry" });
    }
  });
  check(`${draft.journey}: dropdown validation and visible choices share contract enum values`, () => {
    for (const [target, key] of Object.entries(draftChoiceKeys)) {
      const field = byTarget[target];
      if (!field) continue;
      const options = field.inputOptions.stringOptions;
      assert.equal(field.identifier, "DROPDOWN");
      assert.equal(field.inputOptions.inputType, "STRING");
      assert.equal(options.componentType, "DROPDOWN");
      assert.deepEqual(options.validation.enum, jsonCopy(enquiryOptions[key]));
      assert.deepEqual(options.dropdownOptions.options.map(option => option.value), options.validation.enum);
      assert.deepEqual(options.dropdownOptions.options.map(option => option.label), options.validation.enum);
    }
    const services = byTarget.k3d_services;
    assert.equal(services.inputOptions.inputType, "ARRAY");
    assert.equal(services.identifier, "CHECKBOX_GROUP");
    const options = services.inputOptions.arrayOptions;
    assert.equal(options.componentType, "CHECKBOX_GROUP");
    assert.equal(options.validation.items.itemType, "STRING");
    assert.equal(options.validation.maxItems, enquiryOptions.services.length);
    assert.deepEqual(options.validation.items.stringOptions.enum, jsonCopy(enquiryOptions.services));
    assert.deepEqual(options.checkboxGroupOptions.options.map(option => option.value), jsonCopy(enquiryOptions.services));
    assert.deepEqual(options.checkboxGroupOptions.options.map(option => option.label), jsonCopy(enquiryOptions.services));
  });
  check(`${draft.journey}: only email and phone map to contact identity`, () => {
    const mappings = inputs.filter(field => field.inputOptions.contactMapping);
    assert.deepEqual(mappings.map(field => field.inputOptions.target).sort(), ["k3d_contact_email", "k3d_contact_phone"]);
    assert.deepEqual(byTarget.k3d_contact_email.inputOptions.contactMapping, { contactField: "EMAIL", emailInfo: { tag: "UNTAGGED" } });
    assert.deepEqual(byTarget.k3d_contact_phone.inputOptions.contactMapping, { contactField: "PHONE", phoneInfo: { tag: "UNTAGGED" } });
    for (const target of ["k3d_contact_name", "k3d_project_address", "k3d_project_postcode", "k3d_preferred_contact"]) {
      assert.equal("contactMapping" in byTarget[target].inputOptions, false);
    }
    assert.doesNotMatch(JSON.stringify(form), /"(?:upsertContact|postSubmissionTriggers|marketingConsent|subscribe|subscription|notifications|automations)"\s*:/);
    assert.doesNotMatch(JSON.stringify(form), /"contactField":"(?:FIRST_NAME|LAST_NAME|ADDRESS|COMPANY|BIRTHDATE)"/);
  });
  check(`${draft.journey}: preferred contact rules match the correct optional native field`, () => {
    assert.equal(form.formRules.length, 2);
    assert.equal(byTarget.k3d_preferred_contact.inputOptions.required, true);
    for (const preferred of ["Phone", "Email"]) {
      const target = preferred === "Phone" ? "k3d_contact_phone" : "k3d_contact_email";
      const field = byTarget[target];
      assert.equal(field.inputOptions.required, false, "Phone-only and email-only enquiries remain possible");
      const rules = form.formRules.filter(rule => rule.expression.and.conditions[0].condition.value === preferred);
      assert.equal(rules.length, 1);
      const rule = rules[0];
      assert.deepEqual(rule.expression, { and: { conditions: [{ condition: { target: "k3d_preferred_contact", operator: "EQUAL", value: preferred } }] } });
      assert.deepEqual(rule.overrides, [{ entityType: "FIELD", fieldOptions: { fieldId: field.id, propertyType: "REQUIRED", requiredOptions: { required: true } } }]);
    }
  });
  check(`${draft.journey}: broad native uploads and all live-activation prerequisites remain explicit holds`, () => {
    const files = byTarget.k3d_project_files.inputOptions;
    assert.equal(files.inputType, "WIX_FILE");
    assert.equal(files.wixFileOptions.componentType, "FILE_UPLOAD");
    assert.deepEqual(files.wixFileOptions.validation, { fileLimit: 5, uploadFileFormats: ["IMAGE", "DOCUMENT"] });
    assert.ok(Array.isArray(draft.activationHolds) && draft.activationHolds.length >= 9);
    const holds = draft.activationHolds.join("\n");
    for (const required of [/exact-site connector isolation/i, /saved schema and dashboard rendering/i, /explicitly disabled/i,
      /broader than approved JPG\/PNG\/WebP\/PDF/, /MIME, signature and byte limits/, /private file access, retention and deletion/,
      /conditional required rules/, /omit blank optional targets/, /London-date checks/, /privacy link/, /rate limits/,
      /spam flow/, /duplicate reconciliation/, /No notification automation/, /separate controlled activation gate/]) assert.match(holds, required);
    assert.match(JSON.stringify(form.submitSettings), /request, not a confirmed appointment/);
    assert.match(JSON.stringify(displays), /Enquiry collection is disabled/);
    assert.match(JSON.stringify(displays), /subject to the agreed quotation and contract/);
  });
}

check("all draft entity IDs are unique lowercase UUIDs and never reused as remote identities", () => {
  const ids = definedIds(wixDrafts);
  ids.forEach(id => assert.match(id, uuid));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(wixDrafts.reduce((total, draft) => total + draft.request.form.formFields.filter(field => field.fieldType === "INPUT").length, 0), 32);
  const allTargets = wixDrafts.flatMap(draft => draft.request.form.formFields.filter(field => field.fieldType === "INPUT").map(field => field.inputOptions.target));
  assert.equal(new Set(allTargets).size, 20, "Twelve common targets plus four project targets per journey");
  const nextDrafts = buildWixEnquiryFormDrafts({ ...enquiryOptions, siteId: "caller-selected-site", enabled: true });
  for (const draft of nextDrafts) {
    assert.equal(draft.siteId, "543768f5-be18-4f7c-bb3b-380f4b05c925");
    assert.equal(draft.remoteFormId, null);
    assert.equal(draft.request.form.enabled, false);
  }
  assert.ok(definedIds(nextDrafts).every(id => !ids.includes(id)), "A rebuild produces new draft entity IDs, not stable remote identities");
});

sources.set("scripts/lib/wix-enquiry-form-drafts.mjs", await readFile(new URL("scripts/lib/wix-enquiry-form-drafts.mjs", root), "utf8"));
check("contract, route and offline drafts have no network, logging, credential or storage implementation", () => {
  for (const source of sources.values()) {
    assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage)\s*[.(]/);
    assert.doesNotMatch(source, /\bconsole\.(?:log|info|warn|error|debug)\s*\(/);
    assert.doesNotMatch(source, /process\.env\.(?:WIX_|NEXT_PUBLIC_)/);
  }
  assert.deepEqual(activity, { network: 0, logs: 0, requestReads: 0 });
});

console.log(`ENQUIRY_CHECKS=PASS (${checks} synthetic checks; both journeys, exact targets, contact rules, file metadata, disabled boundary, offline Wix drafts)`);
console.log("ENQUIRY_NETWORK_CALLS=0; REQUEST_BODY_READS=0; ENQUIRY_LOGS=0; LIVE_COLLECTION=DISABLED; ACTIVATION_STATUS=HOLD");
console.log("NOT_TESTED_LIVE=Wix receipt, contact matching, upload access, CAPTCHA, rate limits, retries, notifications, calendar conflicts");
console.log("WIX_FORM_DRAFTS=2_LOCAL_ONLY; REMOTE_FORM_IDS=NONE; API_ACCEPTANCE_AND_NATIVE_RENDERING=UNVERIFIED");
