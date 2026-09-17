export const UNSUCCESSFUL_RETENTION_DAYS = 90;
const RETENTION_MS = UNSUCCESSFUL_RETENTION_DAYS * 24 * 60 * 60 * 1000;
export type EnquiryLifecycle = "active" | "unsuccessful" | "accepted";
export type RetentionDecision = {
  eligible: boolean;
  dueAt: string | null;
  reason: "invalid-input" | "not-unsuccessful" | "within-period" | "due";
};

function utcInstant(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value ? time : null;
}

// Pure local policy, not a deletion command. First receipt must come from a
// trusted immutable server record, never a customer input or last-updated time.
// Associated uploads follow the same eligibility; accepted project data does not.
export function unsuccessfulEnquiryRetention(input: {
  firstReceivedAt: string;
  status: EnquiryLifecycle;
  now: string;
}): RetentionDecision {
  const received = utcInstant(input?.firstReceivedAt);
  const now = utcInstant(input?.now);
  if (received === null || now === null || received > now ||
      !["active", "unsuccessful", "accepted"].includes(input?.status)) {
    return {eligible:false,dueAt:null,reason:"invalid-input"};
  }
  if (input.status !== "unsuccessful") return {eligible:false,dueAt:null,reason:"not-unsuccessful"};
  const deadline = received + RETENTION_MS;
  return {eligible:now >= deadline,dueAt:new Date(deadline).toISOString(),reason:now >= deadline ? "due" : "within-period"};
}
