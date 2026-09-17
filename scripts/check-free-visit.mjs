import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FREE_VISIT_POLICY, evaluateSampleVisit } from "./lib/free-visit-policy.mjs";

let checks = 0;
function check(name, operation) {
  try {
    operation();
    checks += 1;
  } catch (error) {
    throw new Error(`FAILED: ${name}`, { cause: error });
  }
}

const clone = (value) => JSON.parse(JSON.stringify(value));
const candidate = (startTime = "09:00", date = "2026-09-07", existingVisits = []) => ({
  date, startTime, existingVisits,
});
const sample = (startTime, endTime, date = "2026-09-07") => ({ date, startTime, endTime });
function expectFit(input, expected, reason) {
  const outcome = evaluateSampleVisit(input);
  assert.equal(outcome.policyFit, expected);
  assert.equal(outcome.state, "LOCAL_DRAFT_NOT_BOOKABLE");
  assert.equal(outcome.scope, "SYNTHETIC_POLICY_CHECK_ONLY");
  for (const key of ["liveBookingAllowed", "liveAvailabilityChecked", "googleCalendarConflictsChecked",
    "coverageEligibilityChecked", "timezoneInstantConversionPerformed"]) {
    assert.equal(outcome[key], false);
  }
  if (reason) assert.ok(outcome.reasons.includes(reason), `${reason}: ${outcome.reasons}`);
  if (expected === "FIT") assert.deepEqual(outcome.reasons, []);
  assert.ok(Object.isFrozen(outcome));
  assert.ok(Object.isFrozen(outcome.reasons));
  assert.ok(outcome.activationHolds.length >= 8);
  assert.equal(Object.hasOwn(outcome, "slots"), false);
  return outcome;
}

check("exact Kitchen3D target and unknown remote IDs remain distinct", () => {
  assert.equal(FREE_VISIT_POLICY.siteId, "543768f5-be18-4f7c-bb3b-380f4b05c925");
  assert.equal(FREE_VISIT_POLICY.staffId, "ae2b0494-87a0-4bf3-84e4-27fbe22ccc0a");
  for (const key of ["remoteServiceId", "remoteResourceId", "remoteScheduleId"]) {
    assert.equal(FREE_VISIT_POLICY[key], null);
  }
});
check("approved duration, wall-clock zone and single gap", () => {
  assert.equal(FREE_VISIT_POLICY.timeZone, "Europe/London");
  assert.equal(FREE_VISIT_POLICY.visit.reservedDurationMinutes, 45);
  assert.match(FREE_VISIT_POLICY.visit.description, /Free, no-obligation.*up to 45/);
  assert.equal(FREE_VISIT_POLICY.gap.minimumMinutes, 60);
  assert.equal(FREE_VISIT_POLICY.gap.meaning, "ONE_GAP_FROM_PREVIOUS_VISIT_END_TO_NEXT_VISIT_START");
});
check("initial visit is at the customer property, free and without obligation", () => {
  assert.equal(FREE_VISIT_POLICY.visit.location, "CUSTOMER_PROPERTY");
  assert.equal(FREE_VISIT_POLICY.visit.freeOfCharge, true);
  assert.equal(FREE_VISIT_POLICY.visit.noObligation, true);
});
check("coverage covers the region without inventing a radius or postcode lookup", () => {
  assert.equal(FREE_VISIT_POLICY.coverage.area, "All Greater Manchester");
  assert.deepEqual(FREE_VISIT_POLICY.coverage.examples, ["Altrincham", "Oldham", "Bolton", "Bury"]);
  assert.equal(FREE_VISIT_POLICY.coverage.examplesAreExhaustive, false);
  assert.equal(FREE_VISIT_POLICY.coverage.mileageRadius, null);
  assert.equal(FREE_VISIT_POLICY.coverage.postcodeResolver, null);
});
check("policy and nested data are immutable and JSON safe", () => {
  function assertFrozen(value) {
    if (value && typeof value === "object") {
      assert.ok(Object.isFrozen(value));
      Object.values(value).forEach(assertFrozen);
    }
  }
  assertFrozen(FREE_VISIT_POLICY);
  assert.deepEqual(clone(FREE_VISIT_POLICY), FREE_VISIT_POLICY);
  assert.throws(() => { FREE_VISIT_POLICY.liveBookingAllowed = true; }, TypeError);
  assert.throws(() => { FREE_VISIT_POLICY.weeklyWindow.days.push("SUNDAY"); }, TypeError);
});

for (let day = 7; day <= 12; day += 1) {
  check(`Monday through Saturday allowed: September ${day}`, () => {
    expectFit(candidate("09:00", `2026-09-${String(day).padStart(2, "0")}`), "FIT");
  });
}
check("Sunday is excluded", () => expectFit(candidate("09:00", "2026-09-13"), "DOES_NOT_FIT", "OUTSIDE_VISIT_DAYS"));
check("09:00 start fits the opening boundary", () => expectFit(candidate(), "FIT"));
check("08:59 is before opening", () => expectFit(candidate("08:59"), "DOES_NOT_FIT", "OUTSIDE_VISIT_HOURS"));
check("17:15 start ends exactly 18:00 and does not need an extra closing buffer", () => expectFit(candidate("17:15"), "FIT"));
check("17:16 start exceeds closing", () => expectFit(candidate("17:16"), "DOES_NOT_FIT", "OUTSIDE_VISIT_HOURS"));
check("18:00 start cannot fit a 45 minute visit", () => expectFit(candidate("18:00"), "DOES_NOT_FIT", "OUTSIDE_VISIT_HOURS"));
check("23:59 start cannot wrap into the next day", () => expectFit(candidate("23:59"), "DOES_NOT_FIT", "OUTSIDE_VISIT_HOURS"));

for (const [name, start, visits, fit, reason] of [
  ["60 minutes after a previous visit", "10:45", [sample("09:00", "09:45")], "FIT"],
  ["59 minutes after a previous visit", "10:44", [sample("09:00", "09:45")], "DOES_NOT_FIT", "INSUFFICIENT_VISIT_GAP"],
  ["60 minutes before a later visit", "09:00", [sample("10:45", "11:30")], "FIT"],
  ["59 minutes before a later visit", "09:00", [sample("10:44", "11:29")], "DOES_NOT_FIT", "INSUFFICIENT_VISIT_GAP"],
  ["candidate touching previous end", "09:45", [sample("09:00", "09:45")], "DOES_NOT_FIT", "INSUFFICIENT_VISIT_GAP"],
  ["candidate end touching later start", "09:00", [sample("09:45", "10:30")], "DOES_NOT_FIT", "INSUFFICIENT_VISIT_GAP"],
  ["overlap from the left", "09:00", [sample("09:30", "10:15")], "DOES_NOT_FIT", "SAMPLE_VISIT_OVERLAP"],
  ["overlap from the right", "09:30", [sample("09:00", "09:45")], "DOES_NOT_FIT", "SAMPLE_VISIT_OVERLAP"],
  ["identical visit is a duplicate overlap", "09:00", [sample("09:00", "09:45")], "DOES_NOT_FIT", "SAMPLE_VISIT_OVERLAP"],
  ["candidate contains a short sample", "09:00", [sample("09:10", "09:20")], "DOES_NOT_FIT", "SAMPLE_VISIT_OVERLAP"],
  ["sample contains the candidate", "10:00", [sample("09:00", "12:00")], "DOES_NOT_FIT", "SAMPLE_VISIT_OVERLAP"],
  ["60 minute gaps on both sides without a 120 minute double buffer", "10:45", [sample("09:00", "09:45"), sample("12:30", "13:15")], "FIT"],
  ["a 59 minute gap on either side fails", "10:45", [sample("09:00", "09:46"), sample("12:30", "13:15")], "DOES_NOT_FIT", "INSUFFICIENT_VISIT_GAP"],
  ["a later 59 minute gap also fails", "10:45", [sample("09:00", "09:45"), sample("12:29", "13:14")], "DOES_NOT_FIT", "INSUFFICIENT_VISIT_GAP"],
]) {
  check(name, () => expectFit(candidate(start, "2026-09-07", visits), fit, reason));
  check(`${name}, reversed sample order`, () => expectFit(candidate(start, "2026-09-07", [...visits].reverse()), fit, reason));
}

check("other dates do not create same-time conflicts", () => expectFit(candidate("09:00", "2026-09-07", [
  sample("09:00", "09:45", "2026-09-08"), sample("09:00", "09:45", "2026-09-06"),
]), "FIT"));
check("other dates are not concatenated across midnight", () => expectFit(candidate("09:00", "2026-09-07", [
  sample("23:00", "23:59", "2026-09-06"), sample("00:00", "00:45", "2026-09-08"),
]), "FIT"));
check("other visit durations can be modeled without assessing their mutual conflicts", () => expectFit(candidate("12:00", "2026-09-07", [
  sample("09:00", "10:00"), sample("09:30", "10:30"),
]), "FIT"));
check("all same-day samples are checked even if surrounded by other dates", () => expectFit(candidate("09:00", "2026-09-07", [
  sample("09:00", "09:45", "2026-09-06"), sample("09:20", "10:05"), sample("09:00", "09:45", "2026-09-08"),
]), "DOES_NOT_FIT", "SAMPLE_VISIT_OVERLAP"));
check("valid leap-day date is evaluated as a calendar date", () => expectFit(candidate("09:00", "2028-02-29"), "FIT"));
check("summer wall-clock window remains 09:00, without claiming instant conversion", () => expectFit(candidate("09:00", "2026-07-06"), "FIT"));
check("winter wall-clock window remains 09:00, without claiming instant conversion", () => expectFit(candidate("09:00", "2026-01-05"), "FIT"));

for (const date of [null, undefined, 20260907, "", "2026-9-07", "2026-09-7", "2026-02-29", "2026-04-31", "2026-13-01", "2026-00-01", "0000-01-01", "2026-09-07T09:00:00Z", " 2026-09-07"]) {
  check(`malformed candidate date: ${String(date)}`, () => expectFit({ ...candidate(), date }, "INVALID_INPUT", "INVALID_CANDIDATE_DATE"));
}
for (const startTime of [null, undefined, 900, "", "9:00", "09:0", "24:00", "09:60", "-1:00", "09:00:00", "09:00Z", " 09:00", "09:00 "]) {
  check(`malformed candidate time: ${String(startTime)}`, () => expectFit({ ...candidate(), startTime }, "INVALID_INPUT", "INVALID_CANDIDATE_TIME"));
}
for (const input of [null, undefined, [], "09:00", {}, { date: "2026-09-07", startTime: "09:00" },
  { ...candidate(), liveBookingAllowed: true }, new Date("2026-09-07"), Object.create(candidate())]) {
  check(`invalid candidate record ${checks}`, () => expectFit(input, "INVALID_INPUT", "INVALID_CANDIDATE_SHAPE"));
}
for (const existingVisits of [null, undefined, {}, "none"]) {
  check(`invalid sample list ${checks}`, () => expectFit({ ...candidate(), existingVisits }, "INVALID_INPUT", "INVALID_EXISTING_VISITS"));
}
for (const invalidSample of [null, undefined, [], {}, { date: "2026-09-07", startTime: "09:00" },
  { ...sample("09:00", "09:45"), status: "confirmed" }]) {
  check(`invalid sample shape ${checks}`, () => expectFit(candidate("12:00", "2026-09-07", [invalidSample]), "INVALID_INPUT", "INVALID_EXISTING_VISIT_SHAPE"));
}
for (const [invalidSample, reason] of [
  [sample("09:00", "09:45", "2026-02-29"), "INVALID_EXISTING_VISIT_DATE"],
  [sample("9:00", "09:45"), "INVALID_EXISTING_VISIT_TIME"],
  [sample("09:00", "24:00"), "INVALID_EXISTING_VISIT_TIME"],
  [sample("09:00", "09:00"), "INVALID_EXISTING_VISIT_RANGE"],
  [sample("10:00", "09:00"), "INVALID_EXISTING_VISIT_RANGE"],
  [sample("23:00", "01:00"), "INVALID_EXISTING_VISIT_RANGE"],
  [sample("09:00", "25:00", "2026-09-08"), "INVALID_EXISTING_VISIT_TIME"],
]) {
  check(`invalid sample window ${checks}`, () => expectFit(candidate("12:00", "2026-09-07", [invalidSample]), "INVALID_INPUT", reason));
}
check("sparse sample array is rejected", () => expectFit(candidate("12:00", "2026-09-07", new Array(1)), "INVALID_INPUT", "INVALID_EXISTING_VISIT_SHAPE"));
check("candidate getter is rejected without evaluation", () => {
  const input = candidate();
  Object.defineProperty(input, "date", { enumerable: true, get() { throw new Error("Getter must not execute"); } });
  expectFit(input, "INVALID_INPUT", "INVALID_CANDIDATE_SHAPE");
});
check("sample getter is rejected without evaluation", () => {
  const input = sample("09:00", "09:45");
  Object.defineProperty(input, "date", { enumerable: true, get() { throw new Error("Getter must not execute"); } });
  expectFit(candidate("12:00", "2026-09-07", [input]), "INVALID_INPUT", "INVALID_EXISTING_VISIT_SHAPE");
});
check("sample array getter is rejected without evaluation", () => {
  const visits = [];
  Object.defineProperty(visits, "0", { enumerable: true, get() { throw new Error("Getter must not execute"); } });
  expectFit(candidate("12:00", "2026-09-07", visits), "INVALID_INPUT", "INVALID_EXISTING_VISIT_SHAPE");
});
check("symbol candidate metadata cannot smuggle activation", () => {
  const input = candidate();
  input[Symbol("activate")] = true;
  expectFit(input, "INVALID_INPUT", "INVALID_CANDIDATE_SHAPE");
});
check("hidden candidate fields are rejected", () => {
  const input = candidate();
  Object.defineProperty(input, "date", { value: input.date, enumerable: false });
  expectFit(input, "INVALID_INPUT", "INVALID_CANDIDATE_SHAPE");
});
check("null-prototype data records are safe", () => {
  const input = Object.assign(Object.create(null), candidate());
  expectFit(input, "FIT");
});
check("input windows and their order are preserved", () => {
  const input = candidate("10:45", "2026-09-07", [sample("12:30", "13:15"), sample("09:00", "09:45")]);
  const before = clone(input);
  input.existingVisits.forEach(Object.freeze);
  Object.freeze(input.existingVisits);
  Object.freeze(input);
  const first = expectFit(input, "FIT");
  const second = expectFit(clone(input), "FIT");
  assert.deepEqual(input, before);
  assert.deepEqual(first, second);
  assert.deepEqual(clone(first), first);
});
check("multiple repeated conflicts do not duplicate reason codes", () => {
  const outcome = expectFit(candidate("09:00", "2026-09-07", [sample("09:00", "09:45"), sample("09:00", "09:45")]), "DOES_NOT_FIT", "SAMPLE_VISIT_OVERLAP");
  assert.deepEqual(outcome.reasons, ["SAMPLE_VISIT_OVERLAP"]);
});
check("all non-fit reasons are retained", () => {
  const outcome = expectFit(candidate("08:30", "2026-09-13", [sample("08:30", "09:15", "2026-09-13")]), "DOES_NOT_FIT");
  assert.deepEqual(outcome.reasons, ["OUTSIDE_VISIT_DAYS", "OUTSIDE_VISIT_HOURS", "SAMPLE_VISIT_OVERLAP"]);
});
check("policy evaluator has no imports, network, environment, timer or storage use", () => {
  const source = readFileSync(new URL("./lib/free-visit-policy.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\bimport\b|\brequire\s*\(|\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bprocess\s*\.|\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|\bsetTimeout\s*\(|\bDate\.now\s*\(|\bnew Date\s*\(\s*\)/);
});

console.log(`PASS: ${checks} synthetic free-visit policy checks.`);
console.log("LOCAL_DRAFT_NOT_BOOKABLE: liveBookingAllowed=false for every outcome.");
console.log("No Wix/Google calls, bookings, messages, calendar activation or customer data. Live availability and Google conflict handling remain UNVERIFIED.");
