# Kitchen3D — accepted preview to Wix integration

Date: 5 September 2026.
Status: **INACTIVE STAGE AUTHORISED; LOCAL IMPLEMENTATION COMPLETE; REMOTE CREATION HELD**.

## Execution update

Omid subsequently instructed the project to proceed under this framework, using
internal tools and subagents without repeated approval requests. That authorises
the inactive stage below, not the separately excluded live actions. Implementation,
checks and the unresolved remote identity gate are recorded in
`ENQUIRY_INTEGRATION_STAGE_2_HANDOVER_2026-09-05.md`.

Current Wix documentation corrects the older local recipe: configure native
contact handling with each field's `inputOptions.contactMapping`, not
`postSubmissionTriggers.upsertContact`. Map email/phone only; the supported enum
has no FULL_NAME value. Preserve the submitted full name in the enquiry and do
not guess a split or store it as FIRST_NAME. No manual duplicate contact creation.

## Accepted baseline

Omid has reviewed the homepage and both customer journeys and reported them
excellent and ready for the next steps. Preserve the approved layout, branding,
copy direction and two-journey structure. Do not reopen basic business discovery.

The working branch is `codex/k3d-owner-preview`, based on `c3d2364`. The original
configuration check changed documentation only. The subsequent authorised stage
adds isolated local contract/disabled-endpoint files and checks; approved preview
source, dependencies and original media are preserved. No new commit or push.

## Current configuration — checked this turn

Target site: **Kitchen3D**, `543768f5-be18-4f7c-bb3b-380f4b05c925`.

- Exact-site context confirms Editorless, Premium, English, GB, Europe/London,
  GBP, Velo enabled, and Wix Forms and Wix Bookings installed.
- “Published” in Wix context describes the existing Wix site state. It does not
  mean our local Next.js preview was deployed, promoted or connected to the domain.
- The exact-site Forms & Submissions dashboard displayed **0/25 forms created**
  and **No results found**. No reusable customer intake form was identified.
  This is the dashboard's displayed inventory, not a claim about every historical
  or app-generated form namespace.
- Three booking services returned by the scoped API were independently confirmed
  by name and price in the same site's Booking Services dashboard.

| Existing service | ID | Configured duration | Configured price |
|---|---|---|---|
| Installation Service | `44fdf341-c9b3-4e72-a36f-1d2d0ee3d403` | 120 minutes | GBP 3,000 |
| Design Consultation | `64464945-c028-4960-a26e-7291f5afe412` | 90 minutes | GBP 150 |
| Renovation Consultation | `ae971f97-334f-47bc-b55a-a406eea84b7e` | 60 minutes | GBP 200 |

All three are APPOINTMENT services at revision 1, with `hidden=false` and
`onlineBooking.enabled=true`. Their payment configuration is FIXED with online
payment enabled. Location type is BUSINESS, with a sample-looking location ID;
their form ID is all zeros. These are configuration observations, not verified
public claims, tested purchase paths, proof of live availability, or authorised
prices to add to the new website.

None matches the approved **free visit, up to 45 minutes, at the customer's
property**. Preserve all three pending an explicit decision to retain, replace,
hide or retire them. Do not silently repurpose a paid service as the free visit.
Do not use the all-zero form ID as an enquiry destination.

One service-provider staff record was returned:

- Display name: `Business Owner`.
- Staff ID: `c3e20114-bc68-46d7-af19-b297c221ba53`.
- Resource ID: `7219c33c-c92e-4d4b-852c-a6a207def1e9`.
- All three current services reference this resource ID.
- Its generic name alone does not establish that it is Reza's correct calendar
  identity. No private calendar events or staff email/phone values were retained.

The service query returned all 3 results; the staff query returned 1 provider with
no next page. The latter query is provider-only, not a full employee-directory audit.

### Scope safeguards

The prior Forms connector scope-isolation warning was checked in project history.
No Forms list/query API was retried. Forms inventory was inspected through the
exact-site dashboard instead. No customer submission bodies, contact records,
booking records, inbox conversations or private calendar events were deliberately
queried or exported. The connector's general introduction returned broader account
context; unrelated site information was not retained in this project record.

The Digia Booster Persian owner-intake form is evidence intake, not a customer
enquiry destination. Do not move it, overwrite it, or reuse its form ID here.

## Integration design

### Two customer forms; one contact identity

Proposed new names, **not yet created**:

1. `Kitchen3D — Installation Enquiry` for `/installation-enquiry`.
2. `Kitchen3D — Complete Kitchen Enquiry` for `/plan-your-kitchen`.

Use separate form schemas so irrelevant fields do not appear in either journey.
Each journey currently collects 16 visible answer fields, including its optional
file selector. Keep the accepted UI; do not add another long questionnaire.

The field keys below are proposed logical targets. They are not existing Wix IDs,
verified contact-field enums or an executable API request. Actual schema UUIDs,
recognised Wix field identifiers and native target bindings must be resolved and
validated during the approved setup, then saved in a configuration manifest.

| Current field | Journey | Proposed form target | Handling |
|---|---|---|---|
| `supplier` | Installation | `k3d_supplier` | Required; supplier selection, no partnership implication |
| `removal` | Installation | `k3d_removal` | Required; removal requirement/status |
| `delivery` | Installation | `k3d_delivery_date` | Optional date; no availability promise |
| `start` | Installation | `k3d_install_start` | Optional preferred date |
| `stage` | Complete | `k3d_planning_stage` | Required; current planning stage |
| `style` | Complete | `k3d_style` | Optional style preference |
| `budget` | Complete | `k3d_budget_guide` | Optional free text; never a binding price |
| `start` | Complete | `k3d_project_timing` | Optional timing choice, not a date field |
| `selectedServices` | Both | `k3d_services` | Optional multi-selection |
| `trades` | Both | `k3d_trade_arrangement` | Optional coordination preference |
| `files` | Both | `k3d_project_files` | Optional controlled Wix Forms upload flow; see below |
| `visit` | Both | `k3d_visit_date` | Optional preference, never a confirmed slot |
| `time` | Both | `k3d_visit_time_preference` | Optional time-of-day preference |
| `notes` | Both | `k3d_project_notes` | Optional, potentially personal; 2,000-character cap |
| `name` | Both | `k3d_contact_name` | Required full name; preserve exactly, do not guess surname splits |
| `postcode` | Both | `k3d_project_postcode` | Required; location eligibility still needs checking |
| `address` | Both | `k3d_project_address` | Required project address; do not overwrite an existing contact's address automatically |
| `phone` | Both | `k3d_contact_phone` | Required when Phone is preferred; native contact mapping |
| `email` | Both | `k3d_contact_email` | Required when Email is preferred; native contact mapping |
| `contact` | Both | `k3d_preferred_contact` | Required preference; not marketing consent |

Preserve each enquiry as its own submission linked to a contact. Use Wix's
post-submission contact handling where the verified schema supports it; do not
create a second manual contact for the same successful form submission. Confirm
name-mapping support without changing the accepted full-name input. Test repeat
email/phone submissions and ambiguous shared contact details before relying on
automatic matching; never merge people merely because their names match.

Project-specific details belong with the enquiry rather than replacing identity
or address fields for every new project. Native labels can distinguish the two
journeys once verified and approved. Do not subscribe anyone to marketing.

### Submission and uploads

- Keep preview mode unchanged and offline. Build a separate adapter behind a
  disabled integration switch; private credentials must never enter browser code.
- Pin the Kitchen3D site and the two verified form IDs server-side. Never accept
  caller-supplied site IDs, form IDs or credential-bearing requests.
- Revalidate fields and cross-field requirements server-side, enforce input size
  limits and rate limits, and use the supported Wix spam/CAPTCHA path as needed.
- Recheck the native submission schema: only field `target` keys it defines may
  be sent. Map validation errors to the visible inputs without exposing raw errors.
- Prevent accidental duplicate clicks and define safe retry/reconciliation after
  an uncertain response. Do not claim success merely because the HTTP call returned.
  Wix submission `status` must be checked: `PENDING` is not a recorded enquiry.
- Retain the current file limits: 5 files, JPG/PNG/WebP/PDF, 10 MB each, 20 MB total.
  Use Wix Forms' supported upload association rather than importing customer files
  as publicly showcased project media. Verify actual file-access behaviour,
  validation, retention and deletion permissions before inviting real uploads.
- Do not log names, addresses, notes, file contents or tokens. Redact failures and
  use an opaque correlation/reference ID for support and duplicate handling.
- The form's information-use notice and privacy link must be ready before live
  collection. Real submissions and upload tests require a separate activation gate.

### Confirmation and notifications

| Event | Customer-facing result | Business action |
|---|---|---|
| Enquiry not recorded / uncertain | Explain that receipt is not confirmed; preserve inputs for a safe retry | Reconcile before retrying; no success message or duplicate notification |
| Enquiry recorded | “Your enquiry has been received. Reza will contact you to discuss the next step.” | Associate contact, tag journey, notify the approved recipient once |
| Visit preference included | “Your preferred time is a request, not a confirmed appointment.” | Check location, availability and travel time |
| Appointment actually confirmed later | Confirm the real date, time, timezone and location from Wix Bookings | Send the appropriate appointment confirmation |

Draft notifications only at first. Confirm the operational recipient and channel
before enabling them; a published business email is not by itself approval for
all automations. Phone-only enquiries must not be forced to invent an email.
Email/SMS delivery or inbox appearance must be verified, not assumed from a saved
automation setting. Never send a booking confirmation for a general enquiry.

## Free visit / calendar stage — not activated

Plan a distinct `Free Kitchen Site Visit`, APPOINTMENT, 45-minute reserved duration,
no fee, at the customer's property, capacity one. Draft it hidden and with online
booking disabled only after the correct Reza staff resource is resolved. No
retrospective change to the three paid services is included.

Before exposing slots, resolve these operational details without reopening design:

- The intended Google account/calendar and whether `Business Owner` is Reza's
  correct Wix identity. The account holder performs Google's consent step.
- Actual visit days/times; the stated Monday–Friday 8am–6pm business hours are a
  reference, not proof every moment is available for visits.
- Travel buffer and outer service-area boundary.

Use the previously agreed Wix-centred booking workflow and the sync acceptance
tests in `../../docs/K3D_CONFIRMED_DIRECTION_AND_EXECUTION_BRIEF_2026-09-05.md`.
No calendar connection, availability query or customer appointment was created
in this check. Phone bookings must eventually enter the same central workflow.

## Authorised inactive-stage boundary

**Authorised scope: inactive enquiry setup and local adapter only.**

Create the two new customer enquiry forms on Kitchen3D with submissions disabled;
configure their field/contact mappings and prepare notification drafts without
enabling them. Create the local integration adapter with synthetic tests, keeping
network writes disabled by default. Preserve the approved UI and existing records.

Before any Forms mutation, use the exact-site UI or an independently verified
site-scoped connector path. If a disabled/non-collecting form state cannot be
guaranteed, stop without creating an enabled form. A hidden link alone is not a
submission-disable control.

This proposal excludes live submissions, real-file uploads, customer records,
outgoing messages, enabled automations, staff/calendar changes, paid-service edits,
package installation/upgrades, publication, deployment, PR/push and DNS changes.
The free-visit service remains a specification until its staff/availability gate
is resolved. A separate controlled activation test will cover successful receipt,
validation failure, retries, duplicate requests and appointment conflicts.

## Evidence sources

- Exact Kitchen3D site context and read-only service/staff queries, this turn.
- [Kitchen3D Forms & Submissions dashboard](https://manage.wix.com/dashboard/543768f5-be18-4f7c-bb3b-380f4b05c925/wix-forms) — current route observed in its sidebar; the older `/forms` recipe route no longer resolved.
- [Kitchen3D Booking Services dashboard](https://manage.wix.com/dashboard/543768f5-be18-4f7c-bb3b-380f4b05c925/bookings/services) — service names/prices cross-checked, no Edit action.
- [Query Services](https://dev.wix.com/docs/api-reference/business-solutions/bookings/services/services-v2/query-services) and [Query Staff Members](https://dev.wix.com/docs/api-reference/business-solutions/bookings/staff-members/staff-members/query-staff-members) — current API articles/schema inspected.
- Wix management skill's full Create Form recipe — recognised field identifiers, targets, contact mapping and layout preservation.
- [Form Submissions introduction](https://dev.wix.com/docs/api-reference/crm/forms/form-submissions/introduction) — recorded versus pending submission states, target-key validation and supported upload flow.
