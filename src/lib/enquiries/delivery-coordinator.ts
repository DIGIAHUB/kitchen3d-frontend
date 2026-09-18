import { createHmac } from "node:crypto";
import { prepareEnquirySubmission } from "./wix-submission-adapter";
import { sendEnquiryOnce, type DeliveryResult, type WixEnquiryTransportConfig } from "./wix-transport";
import type { EnquiryValidationContext } from "./contract";

export type Admission =
  | { state: "GRANTED"; lease: string }
  | { state: "CONFIRMED"; submissionId: string }
  | { state: "BUSY" | "CONFLICT" | "DENIED" | "UNCERTAIN" };

/** A REAL adapter must perform atomic durable admission across ALL workers:
 * bind requestKey to fingerprint, apply the server-derived actor's quota, and
 * persist GRANTED before replying. Same-key/different-payload => CONFLICT.
 * Pending/uncertain records must NEVER expire into automatic resend permission.
 * settle must be fenced by the lease. This project supplies no production store.
 * No request bodies, addresses, email, files or tokens are passed into this port.
 */
export interface EnquiryAdmissionStore {
  admit(input: { requestKey: string; fingerprint: string; actorKey: string }, signal: AbortSignal): Promise<Admission>;
  settle(requestKey: string, lease: string, outcome: DeliveryResult, signal: AbortSignal): Promise<void>;
}
export type DeliveryDependencies = {
  store: EnquiryAdmissionStore;
  request: typeof fetch;
  fingerprintSecret: string;
};
export type CoordinatedResult = DeliveryResult | {
  state: "NOT_SENT";
  code: "DELIVERY_UNAVAILABLE" | "INVALID_REQUEST_KEY" | "ADMISSION_DENIED" | "REQUEST_CONFLICT" | "REQUEST_IN_PROGRESS";
  automaticRetryAllowed: false;
  appointmentConfirmed: false;
};

function guid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)
    && value !== "00000000-0000-0000-0000-000000000000";
}

/** Bound each store call. A timed-out claim cannot resume the send path later. */
async function storeStep<T>(action: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new Error("Store deadline")); }, 5_000);
  });
  try { return await Promise.race([Promise.resolve().then(() => action(controller.signal)), deadline]); }
  finally { clearTimeout(timer); }
}

/** Server integration only, disconnected from HTTP/UI. actorKey must be a
 * server-derived opaque rate-limit key (not a trusted client/IP-header value).
 * A real quota backend, privacy and site bindings remain required.
 * No in-process Map fallback: that would not protect concurrent server workers.
 */
export async function coordinateEnquiry(
  input: unknown, context: EnquiryValidationContext, requestKey: string, actorKey: string,
  config?: WixEnquiryTransportConfig, dependencies?: DeliveryDependencies,
): Promise<CoordinatedResult> {
  const notSent = (code: Extract<CoordinatedResult, { state: "NOT_SENT" }>["code"]): CoordinatedResult =>
    ({ state: "NOT_SENT", code, automaticRetryAllowed: false, appointmentConfirmed: false });
  const uncertain = (): DeliveryResult => ({
    state: "UNCONFIRMED", code: "UNEXPECTED_RECEIPT", nextAction: "RECONCILE_BEFORE_RETRY",
    automaticRetryAllowed: false, appointmentConfirmed: false,
  });
  if (!guid(requestKey)) return notSent("INVALID_REQUEST_KEY");
  if (typeof window !== "undefined" || !config || !dependencies) return notSent("DELIVERY_UNAVAILABLE");
  let fingerprint: string;
  let stableInput: unknown;
  let stableContext: EnquiryValidationContext;
  let stableConfig: WixEnquiryTransportConfig;
  try {
    if (!/^[0-9a-f]{64}$/.test(actorKey) || !/^[0-9a-f]{64,128}$/.test(dependencies.fingerprintSecret)
      || typeof dependencies.request !== "function" || typeof dependencies.store?.admit !== "function"
      || typeof dependencies.store?.settle !== "function") return notSent("DELIVERY_UNAVAILABLE");
    const prepared = prepareEnquirySubmission(input, context, config.binding);
    if (!prepared.ok) return notSent("code" in prepared ? prepared.code : "INVALID_ENQUIRY");
    // Bind admission and sending to one snapshot across the asynchronous store
    // boundary. A caller cannot mutate answers or switch form IDs while waiting.
    stableInput = JSON.parse(JSON.stringify(input)) as unknown;
    stableContext = { today: context.today };
    stableConfig = {
      binding: JSON.parse(JSON.stringify(config.binding)) as unknown,
      authorization: config.authorization,
    };
    fingerprint = createHmac("sha256", dependencies.fingerprintSecret)
      .update(JSON.stringify(prepared.submission)).digest("hex");
  } catch { return notSent("DELIVERY_UNAVAILABLE"); }

  let admission: Admission;
  try { admission = await storeStep(signal => dependencies.store.admit({ requestKey, fingerprint, actorKey }, signal)); }
  catch { return notSent("DELIVERY_UNAVAILABLE"); }
  // Treat even an incorrectly implemented adapter conservatively.
  if (!admission || typeof admission !== "object") return notSent("DELIVERY_UNAVAILABLE");
  if (admission.state === "CONFIRMED") {
    return guid(admission.submissionId)
      ? { state: "CONFIRMED", submissionId: admission.submissionId, automaticRetryAllowed: false, appointmentConfirmed: false }
      : uncertain();
  }
  if (admission.state === "DENIED") return notSent("ADMISSION_DENIED");
  if (admission.state === "CONFLICT") return notSent("REQUEST_CONFLICT");
  if (admission.state === "BUSY") return notSent("REQUEST_IN_PROGRESS");
  if (admission.state !== "GRANTED" || !guid(admission.lease)) return uncertain();
  let result: DeliveryResult;
  try { result = await sendEnquiryOnce(stableInput, stableContext, stableConfig, dependencies.request); }
  catch { result = uncertain(); }
  try { await storeStep(signal => dependencies.store.settle(requestKey, admission.lease, result, signal)); }
  catch { return uncertain(); }
  return result;
}
