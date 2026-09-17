# Kitchen3D free-visit setup and test plan

Date: 5 September 2026.
Status: **LOCAL DRAFT ONLY — NOT A WIX API REQUEST — NOT BOOKABLE**.

## Confirmed requirements

| Item | Requirement |
|---|---|
| Offering | Free initial kitchen site visit, without obligation |
| Duration | Up to 45 minutes; reserve a fixed 45-minute appointment for planning |
| Location | Customer's property |
| Coverage | All Greater Manchester, including Altrincham, Oldham, Bolton and Bury; the towns are examples, not an exhaustive list or a radius |
| Visit window | Monday-Saturday, 09:00-18:00, Europe/London; no Sundays |
| Gap | At least 60 minutes from one visit's end to the next visit's start |
| Intended professional | Mohammad Reza Savadi, staff ID `ae2b0494-87a0-4bf3-84e4-27fbe22ccc0a` |
| Target site | Kitchen3D, `543768f5-be18-4f7c-bb3b-380f4b05c925` |
| Google evidence | Supplied screenshot shows `kitchen3dltd@gmail.com` as SYNCED; exact staff-schedule pairing still needs verification |

The wording "9 pm" was explicitly corrected to 9 am. Public contact hours and
existing default staff hours must not override this confirmed visit window.
Do not publish a promise of unlimited materials or additional work: scope,
materials, additions and final price remain subject to agreed quotation/contract.

## Prepared locally

`scripts/lib/free-visit-policy.mjs` is an offline policy model and synthetic
window-fit evaluator. `scripts/check-free-visit.mjs` checks its boundaries without
customer data, credentials, network calls, real calendar reads or writes.

Its results are **policy fit only**, never available slots, reservations or proof
of Wix/Google conflict handling. Live booking remains prohibited in every result.
Service, staff-resource and event-schedule IDs are unresolved, not fabricated.
Do not feed this logical model to a Wix API or bind it to the approved frontend.

Planning examples, not offered appointments:

- A 09:00 visit occupies 09:00-09:45; another visit must not start before 10:45.
- The gap must also hold before an existing visit, regardless of insertion order.
- 17:15-18:00 fits the visit window in isolation; 17:16-18:01 does not. Actual
  selectable start times depend on native slot intervals and other constraints.
- Do not add a second 60-minute buffer and silently require a two-hour gap.
- Fit checks cannot resolve holidays, past dates/lead times, coverage, travel
  feasibility, other appointments or simultaneous bookings without further inputs.

## Important native buffer limitation

Wix documents an after-appointment buffer for fixed-duration appointments. It
also states that this buffer does **not** appear as busy time in synced calendars.
Therefore a 45-minute visit plus Wix's 60-minute buffer is not evidence that a
Google-originated or phone-entered appointment cannot occupy the travel gap.
[Wix buffer guidance](https://support.wix.com/en/article/wix-bookings-adding-a-time-buffer-after-appointments).

Keep Google/phone-originated appointment handling as an activation gate. Do not
automatically create extra Google busy events, duplicate calendar connections or
blocks to compensate without a reviewed design and appropriate authority.

Wix's slot-display interval can be global and can differ from duration plus buffer.
Preserve existing settings affecting the paid services. Verify the free-visit
flow's actual displayed starts rather than promising every mathematical fit.
[Wix slot intervals](https://support.wix.com/en/article/wix-bookings-changing-time-slots-for-appointments).

## Separate inactive service — future configuration, not created

Proposed internal service name: **Free initial kitchen visit**. Use an appointment,
not a class or course; free, at the customer's property, with a fixed 45-minute
reservation and 60-minute after-visit buffer. Assign only the verified Reza
resource after staff/schedule mapping is established. The staff ID must not be
substituted blindly for a required resource ID.

Before saving any remote service, verify the current native schema and a path
that preserves both disabled online booking and non-public visibility from
inception. Online bookings off creates a view-only service, which can still be
visible; hiding alone is not an access or booking-safety guarantee. Do not save an
enabled/visible intermediate service as a probe.
[Wix view-only services](https://support.wix.com/en/article/wix-bookings-creating-view-only-services),
[Wix visibility controls](https://support.wix.com/en/article/wix-bookings-making-services-unbookable).

Do not enable Reza's Bookable switch merely to inspect the Connections tab.
Do not inherit the other staff member's availability, create another staff profile,
reconnect Google, or change shared business hours/global booking policies.

Preserve these existing paid services, their prices, assignments and settings:

- Installation Service: `44fdf341-c9b3-4e72-a36f-1d2d0ee3d403`.
- Design Consultation: `64464945-c028-4960-a26e-7291f5afe412`.
- Renovation Consultation: `ae971f97-334f-47bc-b55a-a406eea84b7e`.

## Controlled integration test matrix — NOT RUN LIVE

Before any test, establish authorised test identities/recipients, private event
handling, notification effects and recoverable cleanup. The previously inspected
booking-confirmation automation was ACTIVE; do not assume a test is silent.

| Test | Required evidence before activation |
|---|---|
| Staff/schedule identity | Intended Google account linked to Reza's exact event schedule on Kitchen3D, with sync status/direction inspected; no private event contents needed for the identity check |
| Inactive service | Exact returned service ID and saved settings; no public rendering/booking path; frontend enquiry endpoint still disabled |
| Days and closing time | No Sunday or out-of-window offer; visits finish by 18:00; actual native slot intervals verified |
| Buffer in both insertion orders | 60-minute end-to-start gap accepted; 59 minutes, overlap and duplicate starts rejected; no accidental double buffer |
| Google Busy / Free / all-day | Controlled synthetic events demonstrate which cases block availability and sync latency; do not read unrelated personal events |
| Phone / Google-originated visit | The same 60-minute gap survives appointments entered outside the web flow; Wix buffer visibility limitation resolved operationally |
| Simultaneous requests | Competing attempts cannot both secure the same professional/time; ambiguous responses reconciled before retry |
| Cancellation / rescheduling | Correct interval released/reblocked across both systems without duplicate records or alerts |
| Boundary / travel | Greater Manchester coverage checked from the actual project address; do not treat an `M` postcode prefix as a county boundary; allow manual review of unclear addresses |
| London time | Native tests on both sides of GMT/BST changes preserve the 09:00-18:00 local window; no fixed UTC-offset assumption |
| Notifications / privacy | Only intended recipients receive the approved necessary information; no marketing consent inferred; retention/deletion and access controls verified |
| Paid-service regression | Existing paid services, other staff and global scheduling preferences remain unchanged |

Lead time, advance-booking horizon, cancellation/rescheduling policy, holiday
exceptions, notification destination and retention/privacy settings have not been
invented. Resolve inherited native policy effects before activation.

## Historical connector checkpoint — superseded by user-directed deferral

The current Codex Wix connector returns **UNAUTHORIZED / Reauthentication required**,
including for documentation calls. No business-data request was retried in this
continuation. The browser still shows Reza's Connections and Booking & availability
tabs disabled while non-bookable; More Actions exposes no alternative sync control.
Nothing in the dashboard was saved or toggled.

The Wix service recipe requires current method/type/payment/location details.
Those full API articles could not be retrieved through the connector, and the
public API-doc reader failed on oversized pages. Consequently this deliverable
is deliberately a logical draft, not an asserted schema-valid native payload.
Accessible Wix Help Center articles support the limited operational findings above.

Omid was asked to reauthenticate the **Codex Wix plugin**, leaving Reza's already
synced Google connection untouched. He then explicitly redirected the task:
internal Wix dashboard setup will be handled manually later. The reauthentication
request is no longer pending, and no further staff/calendar checks are being
pursued. Dashboard work is **user-managed / deferred, not a frontend blocker**.
Forms/Contacts access remains held; this deferral is not permission to retry it.

## Completed local checks

`node scripts/check-free-visit.mjs`: **116 synthetic checks PASS**, also rerun
by an independent reviewer with no findings. Scoped ESLint passed. These checks
cover only the local policy; no calendar/booking integration is claimed. The
helper is not connected to the frontend as an availability engine.

No installation, dependency/lockfile change, code deployment, live booking,
notification, calendar event, publication, DNS or paid-service change is included.
