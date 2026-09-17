/**
 * Local preparation only: the live enquiry route does not import this helper.
 * Parses a bounded JSON envelope, not an authenticated or validated enquiry.
 * Semantic validation, abuse controls and any submission workflow stay separate.
 */
export const ENQUIRY_JSON_MAX_BYTES = 32 * 1024;
export const ENQUIRY_JSON_READ_TIMEOUT_MS = 10_000;

export type EnquiryRequestError =
  | "INVALID_TRUSTED_ORIGIN"
  | "METHOD_NOT_ALLOWED"
  | "ORIGIN_NOT_ALLOWED"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "UNSUPPORTED_CONTENT_ENCODING"
  | "INVALID_CONTENT_LENGTH"
  | "CONTENT_LENGTH_MISMATCH"
  | "BODY_TOO_LARGE"
  | "EMPTY_BODY"
  | "BODY_UNREADABLE"
  | "READ_TIMEOUT"
  | "INVALID_UTF8"
  | "INVALID_JSON";

export type EnquiryJsonResult =
  | { readonly ok: true; readonly value: unknown }
  | { readonly ok: false; readonly error: EnquiryRequestError };

const failure = (error: EnquiryRequestError): EnquiryJsonResult => ({ ok: false, error });

function isTrustedOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    // Require canonical origin-only configuration: no credentials, path, query,
    // fragment, trailing slash or implicit default-port normalization.
    if (url.origin !== value || url.username || url.password) return false;
    return url.protocol === "https:" || (
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export async function readEnquiryJson(request: Request, trustedOrigin: string): Promise<EnquiryJsonResult> {
  if (!isTrustedOrigin(trustedOrigin)) return failure("INVALID_TRUSTED_ORIGIN");

  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let streamEnded = false;

  try {
    if (request.method !== "POST") return failure("METHOD_NOT_ALLOWED");
    // Never derive trust from Host, forwarded headers or the request URL.
    if (request.headers.get("origin") !== trustedOrigin) return failure("ORIGIN_NOT_ALLOWED");
    const mediaType = request.headers.get("content-type") ?? "";
    if (!/^application\/json(?:[ \t]*;[ \t]*charset[ \t]*=[ \t]*(?:utf-8|"utf-8"))?[ \t]*$/i.test(mediaType)) {
      return failure("UNSUPPORTED_MEDIA_TYPE");
    }
    const encoding = request.headers.get("content-encoding");
    if (encoding !== null && !/^identity$/i.test(encoding)) return failure("UNSUPPORTED_CONTENT_ENCODING");

    const lengthHeader = request.headers.get("content-length");
    let declaredLength: number | undefined;
    if (lengthHeader !== null) {
      if (!/^\d+$/.test(lengthHeader)) return failure("INVALID_CONTENT_LENGTH");
      declaredLength = Number(lengthHeader);
      if (!Number.isSafeInteger(declaredLength)) return failure("INVALID_CONTENT_LENGTH");
      if (declaredLength > ENQUIRY_JSON_MAX_BYTES) return failure("BODY_TOO_LARGE");
    }

    if (request.bodyUsed) return failure("BODY_UNREADABLE");
    if (request.body === null) return failure("EMPTY_BODY");
    reader = request.body.getReader();

    const expired = Symbol("read deadline");
    // One deadline for the entire stream, never reset by the arrival of a chunk.
    const deadline = new Promise<typeof expired>(resolve => {
      timer = setTimeout(() => resolve(expired), ENQUIRY_JSON_READ_TIMEOUT_MS);
    });
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let bytesRead = 0;
    let emptyChunks = 0;
    let text = "";

    while (true) {
      const chunk = await Promise.race([reader.read(), deadline]);
      if (chunk === expired) return failure("READ_TIMEOUT");
      if (chunk.done) {
        streamEnded = true;
        break;
      }
      if (!(chunk.value instanceof Uint8Array)) return failure("BODY_UNREADABLE");
      // Bound no-progress streams too: immediately resolved empty reads must
      // not monopolize the microtask queue and starve the deadline timer.
      if (chunk.value.byteLength === 0 && ++emptyChunks > 32) return failure("BODY_UNREADABLE");
      bytesRead += chunk.value.byteLength;
      if (bytesRead > ENQUIRY_JSON_MAX_BYTES) return failure("BODY_TOO_LARGE");
      try {
        text += decoder.decode(chunk.value, { stream: true });
      } catch {
        return failure("INVALID_UTF8");
      }
    }

    if (bytesRead === 0) return failure("EMPTY_BODY");
    if (declaredLength !== undefined && declaredLength !== bytesRead) return failure("CONTENT_LENGTH_MISMATCH");
    try {
      text += decoder.decode();
    } catch {
      return failure("INVALID_UTF8");
    }
    try {
      return { ok: true, value: JSON.parse(text) as unknown };
    } catch {
      return failure("INVALID_JSON");
    }
  } catch {
    // Stream/header exceptions can contain submitted details. Never echo them.
    return failure("BODY_UNREADABLE");
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    if (reader) {
      if (!streamEnded) {
        try {
          // An underlying cancel hook may never settle. Initiate cancellation,
          // handle rejection, and release our lock without waiting on the hook.
          void reader.cancel().catch(() => undefined);
        } catch { /* Cleanup must not replace the fixed result. */ }
      }
      try {
        reader.releaseLock();
      } catch { /* A malformed stream must still produce only a fixed result. */ }
    }
  }
}
