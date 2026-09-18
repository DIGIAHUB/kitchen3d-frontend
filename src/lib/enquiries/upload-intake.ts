import { enquiryLimits } from "./contract";

/**
 * Future server-side upload inspection only. It neither reads requests nor
 * stores, uploads, logs or returns file contents. A customer-declared MIME type
 * and filename are not trusted: a controlled private upload path must call this
 * after enforcing authentication, admission and a byte limit while streaming.
 */
export type PendingUpload = { name: string; type: string; bytes: Uint8Array };
export type UploadInspection =
  | { ok: true; accepted: ReadonlyArray<{ name: string; type: "image/jpeg" | "image/png" | "image/webp" | "application/pdf"; size: number }> }
  | { ok: false; code: "INVALID_UPLOAD_SHAPE" | "TOO_MANY_FILES" | "FILE_TOO_LARGE" | "TOTAL_TOO_LARGE" | "UNSUPPORTED_FILE" | "SIGNATURE_MISMATCH" };

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
type AcceptedType = (typeof acceptedTypes)[number];

function record(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === Object.prototype || prototype === null) && Reflect.ownKeys(value).every(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    return typeof key === "string" && descriptor.enumerable && "value" in descriptor;
  });
}

function starts(bytes: Uint8Array, header: readonly number[]): boolean {
  return bytes.length >= header.length && header.every((value, index) => bytes[index] === value);
}

function signatureMatches(type: AcceptedType, bytes: Uint8Array): boolean {
  if (type === "image/jpeg") return starts(bytes, [0xff, 0xd8, 0xff]);
  if (type === "image/png") return starts(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (type === "image/webp") return starts(bytes, [0x52, 0x49, 0x46, 0x46]) && starts(bytes.slice(8), [0x57, 0x45, 0x42, 0x50]);
  return starts(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
}

function validName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= enquiryLimits.fileName
    && !/[\x00-\x1f\x7f/\\]/.test(value);
}

/**
 * Produces only safe file metadata for a later private-store association. Any
 * uncertainty fails closed. This is not an antivirus scan or a file parser;
 * private access control, malware scanning and cleanup remain activation gates.
 */
export function inspectPendingUploads(value: unknown): UploadInspection {
  if (!Array.isArray(value)) return { ok: false, code: "INVALID_UPLOAD_SHAPE" };
  if (value.length > enquiryLimits.fileCount) return { ok: false, code: "TOO_MANY_FILES" };
  let total = 0;
  const accepted: Array<{ name: string; type: AcceptedType; size: number }> = [];
  for (const item of value) {
    if (!record(item) || Object.keys(item).length !== 3 || !["name", "type", "bytes"].every(key => Object.hasOwn(item, key))
      || !validName(item.name) || typeof item.type !== "string" || !(item.bytes instanceof Uint8Array)) {
      return { ok: false, code: "INVALID_UPLOAD_SHAPE" };
    }
    if (!acceptedTypes.includes(item.type as AcceptedType)) return { ok: false, code: "UNSUPPORTED_FILE" };
    const type = item.type as AcceptedType;
    const size = item.bytes.byteLength;
    if (size === 0 || size > enquiryLimits.fileBytes) return { ok: false, code: "FILE_TOO_LARGE" };
    total += size;
    if (total > enquiryLimits.totalFileBytes) return { ok: false, code: "TOTAL_TOO_LARGE" };
    if (!signatureMatches(type, item.bytes)) return { ok: false, code: "SIGNATURE_MISMATCH" };
    accepted.push({ name: item.name, type, size });
  }
  return { ok: true, accepted };
}
