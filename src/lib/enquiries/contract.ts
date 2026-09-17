/**
 * Inactive integration contract only. Nothing in this module reads credentials,
 * sends data, uploads files, creates contacts or confirms enquiries/bookings.
 * Only the client-safe choices are shared with the approved local preview.
 */
import { enquiryOptions } from "./options";
export { enquiryOptions } from "./options";

export const enquiryLimits = {
  name: 100, postcode: 10, address: 300, phone: 25, email: 254,
  notes: 2000, budget: 120, fileName: 255,
  fileCount: 5, fileBytes: 10 * 1024 * 1024, totalFileBytes: 20 * 1024 * 1024,
} as const;

const commonFields = ["selectedServices", "trades", "files", "visit", "time", "notes", "name", "postcode", "address", "phone", "email", "contact"] as const;

/** Exactly 16 visible fields per journey; the discriminator is not a new input. */
export const enquiryFieldKeys = {
  installation: ["supplier", "removal", "delivery", "start", ...commonFields],
  complete: ["stage", "style", "budget", "start", ...commonFields],
} as const;

type Option<Key extends keyof typeof enquiryOptions> = (typeof enquiryOptions)[Key][number];
export type EnquiryJourney = keyof typeof enquiryFieldKeys;
export type EnquiryFileMetadata = { name: string; type: Option<"fileTypes">; size: number };

type CommonAnswers = {
  selectedServices: Option<"services">[];
  trades: Option<"trades"> | "";
  files: EnquiryFileMetadata[];
  visit: string;
  time: Option<"time"> | "";
  notes: string;
  name: string;
  postcode: string;
  address: string;
  phone: string;
  email: string;
  contact: Option<"contact">;
};

export type EnquiryInput = CommonAnswers & (
  | { journey: "installation"; supplier: Option<"supplier">; removal: Option<"removal">; delivery: string; start: string }
  | { journey: "complete"; stage: Option<"stage">; style: Option<"style"> | ""; budget: string; start: Option<"timing"> | "" }
);

export type EnquiryValidationContext = {
  /** Trusted server-computed calendar date in Europe/London, not a request field. */
  today: string;
};
export type EnquiryValidationError = { field: string; code: "invalid_shape" | "unknown_field" | "missing_field" | "invalid_context" | "required" | "invalid_type" | "too_long" | "invalid_value" | "invalid_date" | "past_date" | "invalid_files" };
export type EnquiryValidationFailure = { ok: false; errors: EnquiryValidationError[] };
export type EnquiryValidationResult = { ok: true; value: EnquiryInput } | EnquiryValidationFailure;

function record(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Reflect.ownKeys(value).every(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    return typeof key === "string" && descriptor.enumerable && "value" in descriptor;
  });
}

function calendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || month < 1 || month > 12) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= days[month - 1];
}

function validFiles(value: unknown): value is EnquiryFileMetadata[] {
  if (!Array.isArray(value) || value.length > enquiryLimits.fileCount) return false;
  let total = 0;
  const extensions: Record<string, RegExp> = {
    "image/jpeg": /\.jpe?g$/i, "image/png": /\.png$/i,
    "image/webp": /\.webp$/i, "application/pdf": /\.pdf$/i,
  };
  for (const file of value) {
    if (!record(file) || Object.keys(file).length !== 3 || !["name", "type", "size"].every(key => Object.hasOwn(file, key))) return false;
    if (typeof file.name !== "string" || !file.name.trim() || file.name.length > enquiryLimits.fileName || /[\x00-\x1f\x7f/\\]/.test(file.name)) return false;
    if (typeof file.type !== "string" || !enquiryOptions.fileTypes.some(type => type === file.type) || !extensions[file.type].test(file.name)) return false;
    if (typeof file.size !== "number" || !Number.isSafeInteger(file.size) || file.size <= 0 || file.size > enquiryLimits.fileBytes) return false;
    total += file.size;
  }
  return total <= enquiryLimits.totalFileBytes;
}

/**
 * Validate an already-parsed synthetic object. This is not an HTTP parser or an
 * upload-security boundary. Optional UI answers must be present as "" or [].
 * Error output contains fixed field names/codes only, never submitted values.
 */
export function validateEnquiry(input: unknown, context: EnquiryValidationContext): EnquiryValidationResult {
  const errors: EnquiryValidationError[] = [];
  const fail = (field: string, code: EnquiryValidationError["code"]) => { errors.push({ field, code }); };
  if (!context || typeof context.today !== "string" || !calendarDate(context.today)) {
    return { ok: false, errors: [{ field: "_form", code: "invalid_context" }] };
  }
  if (!record(input) || (input.journey !== "installation" && input.journey !== "complete")) {
    return { ok: false, errors: [{ field: "_form", code: "invalid_shape" }] };
  }
  const keys: readonly string[] = ["journey", ...enquiryFieldKeys[input.journey]];
  if (Object.keys(input).some(key => !keys.includes(key))) fail("_form", "unknown_field");
  for (const key of keys) if (!Object.hasOwn(input, key)) fail(key, "missing_field");
  if (errors.length) return { ok: false, errors };
  const answers = input;

  function string(field: string, limit: number, required = false): string | undefined {
    const value = answers[field];
    if (typeof value !== "string") { fail(field, "invalid_type"); return; }
    if (value.length > limit) fail(field, "too_long");
    if (required && !value.trim()) fail(field, "required");
    // Line breaks/tabs are acceptable in project notes/addresses, not identifiers.
    const controls = field === "notes" || field === "address" ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/ : /[\x00-\x1f\x7f]/;
    if (controls.test(value)) fail(field, "invalid_value");
    return value;
  }
  function choice(field: string, options: readonly string[], required = false) {
    const value = string(field, 100, required);
    if (value !== undefined && !(value === "" && !required) && !options.includes(value)) fail(field, "invalid_value");
  }
  function date(field: string, future: boolean) {
    const value = string(field, 10);
    if (value === undefined || value === "") return;
    if (!calendarDate(value)) fail(field, "invalid_date");
    else if (future && value < context.today) fail(field, "past_date");
  }

  if (input.journey === "installation") {
    choice("supplier", enquiryOptions.supplier, true);
    choice("removal", enquiryOptions.removal, true);
    date("delivery", false);
    date("start", true);
  } else {
    choice("stage", enquiryOptions.stage, true);
    choice("style", enquiryOptions.style);
    string("budget", enquiryLimits.budget);
    choice("start", enquiryOptions.timing);
  }
  choice("trades", enquiryOptions.trades);
  choice("time", enquiryOptions.time);
  choice("contact", enquiryOptions.contact, true);
  date("visit", true);
  string("notes", enquiryLimits.notes);
  string("name", enquiryLimits.name, true);
  string("address", enquiryLimits.address, true);
  const postcode = string("postcode", enquiryLimits.postcode, true);
  if (postcode !== undefined && !/^(GIR 0AA|[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})$/i.test(postcode)) fail("postcode", "invalid_value");
  const phone = string("phone", enquiryLimits.phone, input.contact === "Phone");
  if (phone && !/^(?=(?:\D*\d){7,})[+0-9() .-]{7,25}$/.test(phone)) fail("phone", "invalid_value");
  const email = string("email", enquiryLimits.email, input.contact === "Email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("email", "invalid_value");
  const services = input.selectedServices;
  if (!Array.isArray(services) || services.length > enquiryOptions.services.length || new Set(services).size !== services.length
      || !Array.from(services).every(service => typeof service === "string" && enquiryOptions.services.some(option => option === service))) {
    fail("selectedServices", "invalid_value");
  }
  if (!validFiles(input.files)) fail("files", "invalid_files");
  if (errors.length) return { ok: false, errors };
  // Fresh copies prevent callers mutating a successfully validated input afterward.
  return { ok: true, value: { ...input, selectedServices: [...services as CommonAnswers["selectedServices"]], files: (input.files as EnquiryFileMetadata[]).map(file => ({ ...file })) } as EnquiryInput };
}

export type LogicalEnquiryDraft = {
  journey: EnquiryJourney;
  /** Proposed targets only: not a verified or executable Wix API body. */
  values: Record<string, string | string[]>;
  /** Metadata is NOT a Wix file reference and must never be submitted as one. */
  files: { target: "k3d_project_files"; metadata: EnquiryFileMetadata[] };
  /**
   * Reference data only, not native contact-field bindings. Full name stays in
   * the enquiry until supported mapping exists; never put it into FIRST_NAME or
   * guess a surname split. No contact address or marketing consent is included.
   */
  contact: { fullName: string; email?: string; phone?: string };
};

/** Pure logical mapping, deliberately without Wix site/form IDs or a writer. */
export function mapEnquiryToLogicalTargets(input: unknown, context: EnquiryValidationContext): { ok: true; draft: LogicalEnquiryDraft } | EnquiryValidationFailure {
  const result = validateEnquiry(input, context);
  if (!result.ok) return result;
  const value = result.value;
  const values: LogicalEnquiryDraft["values"] = {
    k3d_services: [...value.selectedServices], k3d_trade_arrangement: value.trades,
    k3d_visit_date: value.visit, k3d_visit_time_preference: value.time,
    k3d_project_notes: value.notes, k3d_contact_name: value.name,
    k3d_project_postcode: value.postcode, k3d_project_address: value.address,
    k3d_contact_phone: value.phone, k3d_contact_email: value.email,
    k3d_preferred_contact: value.contact,
  };
  if (value.journey === "installation") {
    Object.assign(values, { k3d_supplier: value.supplier, k3d_removal: value.removal, k3d_delivery_date: value.delivery, k3d_install_start: value.start });
  } else {
    Object.assign(values, { k3d_planning_stage: value.stage, k3d_style: value.style, k3d_budget_guide: value.budget, k3d_project_timing: value.start });
  }
  return { ok: true, draft: {
    journey: value.journey, values,
    files: { target: "k3d_project_files", metadata: value.files.map(file => ({ ...file })) },
    contact: { fullName: value.name, ...(value.email ? { email: value.email } : {}), ...(value.phone ? { phone: value.phone } : {}) },
  } };
}
