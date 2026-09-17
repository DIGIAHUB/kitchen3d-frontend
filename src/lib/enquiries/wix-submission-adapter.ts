import { mapEnquiryToLogicalTargets, type EnquiryJourney, type EnquiryValidationContext, type EnquiryValidationFailure } from "./contract";

/** Server-integration helpers only. No transport, credentials, uploads or writes.
 * The approved preview and disabled HTTP route do not import this module.
 * Sources: Wix Form Submissions introduction, Submission Object and About
 * Submission Values (checked 7 September 2026). This prepares the submission
 * object, NOT an asserted complete REST request/authentication envelope.
 */
export const KITCHEN3D_ENQUIRY_SITE_ID = "543768f5-be18-4f7c-bb3b-380f4b05c925";
const FORM_NAMESPACE = "wix.form_app.form";
type InputType = "STRING" | "ARRAY" | "WIX_FILE";

const commonTargets: Readonly<Record<string, InputType>> = Object.freeze({
  k3d_services: "ARRAY", k3d_trade_arrangement: "STRING", k3d_project_files: "WIX_FILE",
  k3d_visit_date: "STRING", k3d_visit_time_preference: "STRING", k3d_project_notes: "STRING",
  k3d_contact_name: "STRING", k3d_project_postcode: "STRING", k3d_project_address: "STRING",
  k3d_contact_phone: "STRING", k3d_contact_email: "STRING", k3d_preferred_contact: "STRING",
});

export const expectedEnquiryTargets: Readonly<Record<EnquiryJourney, Readonly<Record<string, InputType>>>> = Object.freeze({
  installation: Object.freeze({ ...commonTargets, k3d_supplier: "STRING", k3d_removal: "STRING", k3d_delivery_date: "STRING", k3d_install_start: "STRING" }),
  complete: Object.freeze({ ...commonTargets, k3d_planning_stage: "STRING", k3d_style: "STRING", k3d_budget_guide: "STRING", k3d_project_timing: "STRING" }),
});

/** A future server-owned binding built from an independently verified saved
 * Kitchen3D form schema. Shape checking is NOT proof of site isolation, field
 * rules, privacy, permission or native API acceptance. Never accept this from
 * customer input. The current default contains no remote form IDs.
 */
export type EnquiryFormBinding = {
  siteId: string;
  journey: EnquiryJourney;
  formId: string;
  namespace: string;
  fieldTypes: Record<string, InputType>;
};
export const inactiveEnquiryBindings = Object.freeze({ installation: null, complete: null });

function dataRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === Object.prototype || prototype === null) && Reflect.ownKeys(value).every(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    return typeof key === "string" && descriptor.enumerable && "value" in descriptor;
  });
}

function guid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)
    && value !== "00000000-0000-0000-0000-000000000000";
}

function validBinding(value: unknown, journey: EnquiryJourney): value is EnquiryFormBinding {
  if (!dataRecord(value) || Object.keys(value).length !== 5
    || !["siteId", "journey", "formId", "namespace", "fieldTypes"].every(key => Object.hasOwn(value, key))
    || value.siteId !== KITCHEN3D_ENQUIRY_SITE_ID || value.journey !== journey
    || !guid(value.formId) || value.namespace !== FORM_NAMESPACE || !dataRecord(value.fieldTypes)) return false;
  const expected = expectedEnquiryTargets[journey];
  const actual = value.fieldTypes;
  return Object.keys(actual).length === Object.keys(expected).length
    && Object.entries(expected).every(([key, type]) => Object.hasOwn(actual, key) && actual[key] === type);
}

export type PreparedEnquirySubmission = {
  ok: true;
  state: "PREPARED_NOT_SENT";
  liveCollectionAllowed: false;
  submission: { formId: string; submissions: Record<string, string | string[]> };
  expectedReceipt: { formId: string; namespace: string };
};
export type EnquiryPreparationResult = PreparedEnquirySubmission
  | EnquiryValidationFailure
  | { ok: false; code: "FORM_BINDING_REQUIRED" | "INVALID_FORM_BINDING" | "UPLOADS_NOT_READY" };

/** Revalidate raw answers, then construct only native field-target values.
 * Blank optional strings/arrays are omitted. Any selected file fails closed:
 * local metadata must never masquerade as an uploaded/private Wix file reference.
 * Success here means prepared in memory, never sent, recorded or booked.
 */
export function prepareEnquirySubmission(input: unknown, context: EnquiryValidationContext, binding: unknown = null): EnquiryPreparationResult {
  const mapped = mapEnquiryToLogicalTargets(input, context);
  if (!mapped.ok) return mapped;
  if (binding === null || binding === undefined) return { ok: false, code: "FORM_BINDING_REQUIRED" };
  if (!validBinding(binding, mapped.draft.journey)) return { ok: false, code: "INVALID_FORM_BINDING" };
  if (mapped.draft.files.metadata.length > 0) return { ok: false, code: "UPLOADS_NOT_READY" };
  const submissions: Record<string, string | string[]> = {};
  for (const [target, value] of Object.entries(mapped.draft.values)) {
    if (typeof value === "string" ? value.trim().length > 0 : value.length > 0) {
      submissions[target] = Array.isArray(value) ? [...value] : value;
    }
  }
  return {
    ok: true, state: "PREPARED_NOT_SENT", liveCollectionAllowed: false,
    submission: { formId: binding.formId, submissions },
    expectedReceipt: { formId: binding.formId, namespace: FORM_NAMESPACE },
  };
}

type ExpectedReceipt = PreparedEnquirySubmission["expectedReceipt"];
export type EnquiryReceiptResult = {
  state: "CONFIRMED";
  submissionId: string;
  appointmentConfirmed: false;
  automaticRetryAllowed: false;
} | {
  state: "UNCONFIRMED";
  code: "INVALID_EXPECTATION" | "UNEXPECTED_RECEIPT" | "SUBMISSION_PENDING" | "UNEXPECTED_PAYMENT";
  nextAction: "RECONCILE_BEFORE_RETRY";
  appointmentConfirmed: false;
  automaticRetryAllowed: false;
};

/** Classify a submission object obtained by a FUTURE trusted transport.
 * No HTTP envelope is guessed; raw error bodies must not be passed to the UI.
 * Matching form, namespace, nonempty native ID and CONFIRMED status are required.
 * Transport/authenticity/idempotency verification belongs outside this pure helper.
 */
export function classifyEnquiryReceipt(submission: unknown, expected: ExpectedReceipt): EnquiryReceiptResult {
  const unconfirmed = (code: Extract<EnquiryReceiptResult, { state: "UNCONFIRMED" }>["code"]): EnquiryReceiptResult => ({
    state: "UNCONFIRMED", code, nextAction: "RECONCILE_BEFORE_RETRY",
    appointmentConfirmed: false, automaticRetryAllowed: false,
  });
  if (!dataRecord(expected) || Object.keys(expected).length !== 2
    || !guid(expected.formId) || expected.namespace !== FORM_NAMESPACE) return unconfirmed("INVALID_EXPECTATION");
  if (!dataRecord(submission) || !guid(submission.id) || submission.formId !== expected.formId
    || submission.namespace !== expected.namespace) return unconfirmed("UNEXPECTED_RECEIPT");
  if (submission.status === "PENDING") return unconfirmed("SUBMISSION_PENDING");
  if (submission.status === "PAYMENT_WAITING" || submission.status === "PAYMENT_CANCELED") return unconfirmed("UNEXPECTED_PAYMENT");
  // An enquiry cannot create an appointment or order. Reject crossed workflows.
  if (submission.status !== "CONFIRMED" || submission.appointmentDetails != null || submission.orderDetails != null) {
    return unconfirmed("UNEXPECTED_RECEIPT");
  }
  return { state: "CONFIRMED", submissionId: submission.id, appointmentConfirmed: false, automaticRetryAllowed: false };
}
