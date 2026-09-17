/**
 * Offline specification only. This is not a Wix payload or an availability API.
 * Sample dates and times are Europe/London calendar dates and wall-clock times,
 * not UTC instants. No customer data or real calendar should be passed here.
 */

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export const FREE_VISIT_POLICY = deepFreeze({
  state: "LOCAL_DRAFT_NOT_BOOKABLE",
  liveBookingAllowed: false,
  siteId: "543768f5-be18-4f7c-bb3b-380f4b05c925",
  staffId: "ae2b0494-87a0-4bf3-84e4-27fbe22ccc0a",
  remoteServiceId: null,
  remoteResourceId: null,
  remoteScheduleId: null,
  timeZone: "Europe/London",
  visit: {
    description: "Free, no-obligation initial visit, up to 45 minutes.",
    reservedDurationMinutes: 45,
    location: "CUSTOMER_PROPERTY",
    freeOfCharge: true,
    noObligation: true,
  },
  weeklyWindow: {
    days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
    startTime: "09:00",
    endTime: "18:00",
  },
  gap: {
    minimumMinutes: 60,
    meaning: "ONE_GAP_FROM_PREVIOUS_VISIT_END_TO_NEXT_VISIT_START",
    crossDateComparison: "NOT_PERFORMED",
  },
  coverage: {
    area: "All Greater Manchester",
    examples: ["Altrincham", "Oldham", "Bolton", "Bury"],
    examplesAreExhaustive: false,
    mileageRadius: null,
    postcodeResolver: null,
  },
  activationHolds: [
    "This local policy fit is not live availability or permission to book.",
    "Verify the correct Wix service, staff resource and schedule assignment separately.",
    "Verify real Google busy-event blocking and synchronization separately; they are not tested here.",
    "Verify Google- and phone-originated appointments also respect the travel gap; a Wix after-appointment buffer alone does not prove this.",
    "Verify live service capacity, working hours, exceptions and cross-date behavior separately.",
    "Confirm the customer address is inside the approved coverage area; no geographic lookup is performed.",
    "Agree remaining operational rules separately; lead time, cancellation and rescheduling policies are not inferred.",
    "Verify real timezone handling separately; no wall-clock-to-instant conversion is performed here.",
    "Keep enquiries, bookings, customer messages and notifications inactive until the separate live activation gate.",
  ],
});

const DAY_NAMES = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
];

function hasExactDataKeys(value, expectedKeys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const keys = Reflect.ownKeys(value);
  return keys.length === expectedKeys.length && keys.every((key) => {
    if (typeof key !== "string" || !expectedKeys.includes(key)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor.enumerable && Object.hasOwn(descriptor, "value");
  });
}

function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  if (value.startsWith("0000-")) return null;
  // UTC is used only to identify the weekday of an ISO calendar date. It is
  // deliberately not used to convert a visit's Europe/London wall-clock time.
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return { dayName: DAY_NAMES[date.getUTCDay()] };
}

function parseTime(value) {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function result(policyFit, reasons) {
  return deepFreeze({
    state: FREE_VISIT_POLICY.state,
    scope: "SYNTHETIC_POLICY_CHECK_ONLY",
    policyFit,
    liveBookingAllowed: false,
    liveAvailabilityChecked: false,
    googleCalendarConflictsChecked: false,
    coverageEligibilityChecked: false,
    timezoneInstantConversionPerformed: false,
    reasons: [...new Set(reasons)],
    activationHolds: FREE_VISIT_POLICY.activationHolds,
  });
}

/**
 * Evaluate one synthetic candidate, never enumerate or offer bookable slots.
 *
 * Exact input shape:
 * { date: "YYYY-MM-DD", startTime: "HH:mm", existingVisits: [
 *   { date: "YYYY-MM-DD", startTime: "HH:mm", endTime: "HH:mm" }
 * ] }
 *
 * The candidate always reserves 45 minutes. Existing sample windows must have
 * positive same-date durations (no overnight ranges). Valid windows on other
 * dates are ignored, not joined across midnight. Array order is immaterial.
 * Only the candidate's fit is assessed, not mutual conflicts among all existing
 * samples. Existing sample durations can differ from the candidate's duration.
 * Existing samples are not evidence of any actual Wix or Google availability.
 * FIT means only that this sample meets the modeled days/hours/gap rules.
 */
export function evaluateSampleVisit(input) {
  if (!hasExactDataKeys(input, ["date", "startTime", "existingVisits"])) {
    return result("INVALID_INPUT", ["INVALID_CANDIDATE_SHAPE"]);
  }

  const date = parseDate(input.date);
  const start = parseTime(input.startTime);
  const errors = [];
  if (!date) errors.push("INVALID_CANDIDATE_DATE");
  if (start === null) errors.push("INVALID_CANDIDATE_TIME");
  if (!Array.isArray(input.existingVisits)) {
    errors.push("INVALID_EXISTING_VISITS");
    return result("INVALID_INPUT", errors);
  }

  const samples = [];
  for (let index = 0; index < input.existingVisits.length; index += 1) {
    // Reject sparse entries/accessors without evaluating their getters.
    const entry = Object.getOwnPropertyDescriptor(input.existingVisits, String(index));
    if (!entry || !Object.hasOwn(entry, "value") || !entry.enumerable ||
        !hasExactDataKeys(entry.value, ["date", "startTime", "endTime"])) {
      errors.push("INVALID_EXISTING_VISIT_SHAPE");
      continue;
    }
    const sample = entry.value;
    const sampleDate = parseDate(sample.date);
    const sampleStart = parseTime(sample.startTime);
    const sampleEnd = parseTime(sample.endTime);
    if (!sampleDate) errors.push("INVALID_EXISTING_VISIT_DATE");
    if (sampleStart === null || sampleEnd === null) errors.push("INVALID_EXISTING_VISIT_TIME");
    if (sampleStart !== null && sampleEnd !== null && sampleEnd <= sampleStart) {
      errors.push("INVALID_EXISTING_VISIT_RANGE");
    }
    samples.push({ date: sample.date, start: sampleStart, end: sampleEnd });
  }
  if (errors.length) return result("INVALID_INPUT", errors);

  const end = start + FREE_VISIT_POLICY.visit.reservedDurationMinutes;
  const reasons = [];
  if (!FREE_VISIT_POLICY.weeklyWindow.days.includes(date.dayName)) {
    reasons.push("OUTSIDE_VISIT_DAYS");
  }
  if (start < parseTime(FREE_VISIT_POLICY.weeklyWindow.startTime) ||
      end > parseTime(FREE_VISIT_POLICY.weeklyWindow.endTime)) {
    reasons.push("OUTSIDE_VISIT_HOURS");
  }

  for (const sample of samples) {
    if (sample.date !== input.date) continue;
    if (start < sample.end && end > sample.start) {
      reasons.push("SAMPLE_VISIT_OVERLAP");
    } else {
      const gap = end <= sample.start ? sample.start - end : start - sample.end;
      if (gap < FREE_VISIT_POLICY.gap.minimumMinutes) reasons.push("INSUFFICIENT_VISIT_GAP");
    }
  }
  return result(reasons.length ? "DOES_NOT_FIT" : "FIT", reasons);
}
