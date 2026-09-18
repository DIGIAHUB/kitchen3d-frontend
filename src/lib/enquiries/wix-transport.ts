import { prepareEnquirySubmission, classifyEnquiryReceipt, KITCHEN3D_ENQUIRY_SITE_ID, type EnquiryReceiptResult } from "./wix-submission-adapter";
import type { EnquiryValidationContext } from "./contract";

const ENDPOINT = "https://www.wixapis.com/form-submission-service/v4/submissions";
export const DELIVERY_TIMEOUT_MS = 10_000;
export const RECEIPT_MAX_BYTES = 65_536;

/** Server-owned configuration only. No environment lookup or default fetch.
 * A future route must enforce durable deduplication, rate limiting and spam
 * admission BEFORE calling this transport. This helper alone is not activation.
 */
export type WixEnquiryTransportConfig = {
  binding: unknown;
  authorization: string;
  captchaToken: string;
};
export type DeliveryResult = EnquiryReceiptResult | {
  state: "NOT_SENT";
  code: "TRANSPORT_DISABLED" | "INVALID_CONFIGURATION" | "INVALID_ENQUIRY" | "FORM_BINDING_REQUIRED" | "INVALID_FORM_BINDING" | "UPLOADS_NOT_READY";
  automaticRetryAllowed: false;
  appointmentConfirmed: false;
};

function safeToken(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max
    && value.trim() === value && !/[\x00-\x1f\x7f]/.test(value);
}

async function readReceipt(response: Response, signal: AbortSignal): Promise<unknown> {
  if (signal.aborted) {
    try { void response.body?.cancel().catch(() => undefined); } catch { /* bounded cleanup */ }
    throw new Error("Delivery deadline");
  }
  if (!response.body || !/^application\/json(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "")) throw new Error("Invalid receipt");
  const declared = response.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared)) || Number(declared) > RECEIPT_MAX_BYTES)) throw new Error("Invalid receipt");
  const reader = response.body.getReader();
  const cancelRead = () => { try { void reader.cancel().catch(() => undefined); } catch { /* bounded cleanup */ } };
  signal.addEventListener("abort", cancelRead, { once: true });
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let emptyChunks = 0;
  let text = "";
  let ended = false;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) { ended = true; break; }
      if (!(chunk.value instanceof Uint8Array)) throw new Error("Invalid receipt");
      if (chunk.value.byteLength === 0 && ++emptyChunks > 32) throw new Error("Invalid receipt");
      size += chunk.value.byteLength;
      if (size > RECEIPT_MAX_BYTES) throw new Error("Invalid receipt");
      text += decoder.decode(chunk.value, { stream: true });
    }
    if (declared !== null && Number(declared) !== size) throw new Error("Invalid receipt");
    return JSON.parse(text + decoder.decode()) as unknown;
  } finally {
    signal.removeEventListener("abort", cancelRead);
    if (!ended) { try { void reader.cancel().catch(() => undefined); } catch { /* no sensitive errors */ } }
    try { reader.releaseLock(); } catch { /* no sensitive errors */ }
  }
}

/** Exactly one attempt; any uncertain outcome requires reconciliation, never a
 * blind retry. An injected transport is mandatory. Synthetic tests provide all
 * configuration and requests; the route supplies only server-owned values.
 * REST envelope: { submission, captchaToken }; response: { submission }.
 */
export async function sendEnquiryOnce(
  input: unknown,
  context: EnquiryValidationContext,
  config?: WixEnquiryTransportConfig,
  request?: typeof fetch,
): Promise<DeliveryResult> {
  const notSent = (code: Extract<DeliveryResult, { state: "NOT_SENT" }>["code"]): DeliveryResult =>
    ({ state: "NOT_SENT", code, automaticRetryAllowed: false, appointmentConfirmed: false });
  if (typeof window !== "undefined" || typeof request !== "function" || !config) return notSent("TRANSPORT_DISABLED");
  let prepared;
  let body: string;
  let authorization: string;
  try {
    const suppliedAuthorization = config.authorization;
    const suppliedCaptcha = config.captchaToken;
    if (!safeToken(suppliedAuthorization, 8192) || !safeToken(suppliedCaptcha, 3000)) return notSent("INVALID_CONFIGURATION");
    prepared = prepareEnquirySubmission(input, context, config.binding);
    if (!prepared.ok) return notSent("code" in prepared ? prepared.code : "INVALID_ENQUIRY");
    authorization = suppliedAuthorization;
    body = JSON.stringify({ submission: prepared.submission, captchaToken: suppliedCaptcha });
  } catch { return notSent("INVALID_CONFIGURATION"); }

  const expected = prepared.expectedReceipt;
  const sentValues = prepared.submission.submissions;
  const uncertain = (): EnquiryReceiptResult => ({
    state: "UNCONFIRMED", code: "UNEXPECTED_RECEIPT", nextAction: "RECONCILE_BEFORE_RETRY",
    automaticRetryAllowed: false, appointmentConfirmed: false,
  });
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new Error("Delivery deadline")); }, DELIVERY_TIMEOUT_MS);
  });
  try {
    const envelope = await Promise.race([(async () => {
      const response = await request(ENDPOINT, {
        method: "POST", redirect: "error", cache: "no-store", signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: authorization, "wix-site-id": KITCHEN3D_ENQUIRY_SITE_ID },
        body,
      });
      // Do not read or surface a provider error body (may contain personal data).
      if (!response.ok) throw new Error("Delivery unconfirmed");
      return readReceipt(response, controller.signal);
    })(), deadline]);
    if (!envelope || typeof envelope !== "object" || !("submission" in envelope)) return uncertain();
    const submission = envelope.submission;
    const result = classifyEnquiryReceipt(submission, expected);
    if (result.state !== "CONFIRMED") return result;
    // Require submitted target values in the returned object, not just a form ID.
    const received = (submission as { submissions?: unknown }).submissions;
    if (!received || typeof received !== "object" || Array.isArray(received)) return uncertain();
    if (!Object.entries(sentValues).every(([key, value]) => Object.hasOwn(received, key)
      && JSON.stringify((received as Record<string, unknown>)[key]) === JSON.stringify(value))) return uncertain();
    return result;
  } catch {
    controller.abort();
    return uncertain();
  } finally { clearTimeout(timer); }
}
