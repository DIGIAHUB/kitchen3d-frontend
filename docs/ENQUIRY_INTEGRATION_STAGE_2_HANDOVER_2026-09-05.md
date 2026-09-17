# Kitchen3D inactive enquiry integration

Date: 5 September 2026.
Status: **LOCAL IMPLEMENTATION COMPLETE — REMOTE FORM CREATION HELD — NOT LIVE**.

### Current direction — frontend first, dashboard deferred

Omid explicitly instructed that the team will handle internal Wix dashboard
setup manually later. Stop calendar, dashboard and plugin-reauthentication work.
These are **user-managed deferred tasks, not blockers to frontend development**.
This direction supersedes earlier "next action" instructions below; those sections
remain historical checkpoints, not pending requests to the user.

The latest local technical implementation and verification are recorded in
[Technical integration, 7 September](TECHNICAL_INTEGRATION_2026-09-07.md).
[Frontend continuation](FRONTEND_CONTINUATION_2026-09-05.md) records the accepted UI. The approved structure
remains four steps and sixteen questions per journey. Live enquiry collection,
booking activation, publication and DNS are not enabled by this continuation.

### Latest local resumption

Navigation is now explicitly placed on all four pages of each offline native
draft: 16 input fields plus one notice and four navigation display fields
(21 total; per-page layout counts 5/7/7/2). No question or approved frontend was
changed. New regression tests require exactly one unique, last-position navigation
control per page. **248 synthetic checks, offline preview checks, lint and
typecheck passed.** An independent review found no issues in this change and
reran all 248 checks. Native API acceptance/rendering still need verification.

Documentation/schema tools responded successfully. Older dispatch failures and
reconnect suggestions below are historical; no new site-context or Forms/Contacts
isolation proof was obtained, and no business-data call was made. Remote creation
remains held. No new build or browser acceptance test was run.

Omid confirmed a **60-minute gap between visits**, separate from visit duration.
He subsequently confirmed **Monday-Saturday, 09:00-18:00 visits; Sundays
unavailable**, explicitly clarifying the start as 9 am. Retain Europe/London time.
Reza also confirmed **all Greater Manchester**, including Altrincham, Oldham,
Bolton and Bury, for the free initial visit. These are examples, not a four-town
limit or a mileage radius; coverage outside Greater Manchester is not confirmed.
Visit days, daily hours, gap and coverage are now confirmed. No holiday exceptions
were specified. These are recorded requirements only:
no Wix availability was changed or activated. See the
[dashboard audit's resumption record](WIX_DASHBOARD_INTEGRATION_AUDIT_2026-09-05.md#resumption--local-mapping-and-one-hour-gap-confirmed)
for this decision and the completed frontend/client/callback mapping.

### Google connection follow-up

Omid reports Reza has authorised and connected Google and has now supplied the
requested screenshot. Wix's Manage calendar sync dialog shows **Google Calendar,
kitchen3dltd@gmail.com, SYNCED**. The intended account's displayed sync status is
therefore **screenshot-confirmed**. No reconnection or repeated screenshot request
is needed. See the [screenshot evidence record](WIX_DASHBOARD_INTEGRATION_AUDIT_2026-09-05.md#supplied-google-calendar-sync-confirmation).

The earlier live check showed Reza non-bookable with Connections disabled; the
exact-ID staff metadata request required Wix connector reauthentication and
returned no schedule data. Those checks were not rerun after the image arrived.
The image omits site/staff/schedule identifiers, so exact staff-schedule pairing
and operational sync/conflict behaviour still need verification. No booking
setting was enabled or changed, and no calendar events were accessed.

Next is a safe read-only staff-schedule mapping check, followed by preparation of
the confirmed free-visit configuration and controlled integration tests.
Notification destination, privacy/retention and controlled integration testing
remain outstanding. Prior synthetic test results below were not rerun in this
documentation-only follow-up.

### Free-visit scheduling continuation

The subsequent GO ON instruction advances a separate local policy model and
synthetic checks in `scripts/lib/free-visit-policy.mjs` and
`scripts/check-free-visit.mjs`. They do not change either approved enquiry
journey, create a Wix service, offer real slots or enable booking.
See the [free-visit setup and test plan](FREE_VISIT_SETUP_AND_TEST_PLAN_2026-09-05.md)
for confirmed requirements, final verification and remaining gates.

The Codex Wix plugin now rejects documentation calls with an explicit
reauthentication requirement. This is separate from the screenshot-confirmed
Google sync. Omid was asked to reauthenticate the Wix plugin only; do not repeat
Reza's Google consent or disconnect his calendar. No business-data call was
retried. Reza's currently displayed profile remains non-bookable with connection
controls disabled, and its More Actions menu exposes no alternative sync view.

## Authority and outcome

Omid instructed the project to proceed under its framework without repeated
approval requests and explicitly authorised internal/subagent coordination.
This executes the previously proposed inactive enquiry stage. It does not activate
customer collection, notifications, calendar connections, deployment or DNS.

Three bounded subagents handled contract implementation, independent synthetic QA,
and service coverage. The main agent handled current Wix schema research, the
scope check, local native-form drafts, integration review and handover.

- Existing branch: `codex/k3d-owner-preview`, base `c3d2364`.
- Approved homepage, branding and both four-step journeys are unchanged.
- Exactly 16 visible answer fields remain in each journey. No extra questionnaire.
- No packages, dependency fields, versions or lockfiles changed.
- No commit, push, PR, deployment, publication, calendar change or DNS change.
- No customer submissions, uploads, contacts or outgoing messages were created.
- Existing media, paid booking services and the Digia owner-intake form are untouched.

## Delivered locally

| Artifact | Purpose and boundary |
|---|---|
| `src/lib/enquiries/contract.ts` | Typed installation/complete contracts; strict runtime validation of already-parsed synthetic input; pure logical target mapping. No network or credential access. |
| `src/app/api/enquiries/route.ts` | POST always returns 503 / `ENQUIRY_COLLECTION_DISABLED`, no-store/noindex. Does not read request properties or body. No environment/client switch can enable collection. |
| `scripts/check-enquiries.mjs` | Independent tests for both contracts, mappings, malformed input, cross-field contact requirements, dates, file metadata and disabled endpoint. Also validates local native drafts. |
| `scripts/lib/wix-enquiry-form-drafts.mjs` | Offline composition of two complete disabled-form request drafts from the contract options. Generates fresh lowercase field/option/step/rule UUIDs. No executor and no remote form IDs. |
| `docs/SERVICE_CONTENT_COVERAGE_2026-09-05.md` | Owner-confirmed services mapped to current UI; concise draft descriptions for later application. |

### Data handling

Required name, project postcode and project address are validated. A usable phone
is required for Phone preference; email for Email preference. Full names remain
unsplit. Project addresses stay with the enquiry and never overwrite CRM addresses.
No marketing opt-in is inferred from a contact preference.

File metadata is isolated from proposed submission values. It is not a Wix file
reference, proof of file contents or upload-security verification. The current
preview still retains actual file selections only in page memory.

Logical values may contain empty optional strings. A future real-submission
adapter must omit blank optional targets where required by the native schema;
it must not send this draft directly. A preferred visit date/time never becomes a
booking, availability slot, quoted price or reservation in this stage.

## Wix state and identity hold

Exact target: Kitchen3D, `543768f5-be18-4f7c-bb3b-380f4b05c925`.

### Reconnection follow-up

Omid reported disconnecting and reconnecting the Wix plugin again. The follow-up
attempts to read the Wix introduction, exact-site context and documentation all
failed immediately with MCP **-32001 / Unknown tool**. This is a tool-dispatch
failure, not a Wix HTTP response or a new Kitchen3D permission finding. No site
identity or Forms request could execute in this follow-up.

The plugin-management read found a Wix permission-settings entry following the
user's default. That is not proof of an operational OAuth connection or site
scope. No permission setting was changed. Do not ask for another repeated Wix
reconnection on this evidence. The next troubleshooting step is to fully quit
and reopen Codex, return to this task and retry; a refreshed session is not a
guaranteed fix. Do not uninstall the plugin or request pasted credentials.

Independent local preflight again passed all 246 synthetic checks without
modifying application files. Native rendering still needs checking, particularly
whether the single navigation element on the final step provides usable controls
on preceding steps. TEXT_AREA with TEXT_INPUT is the documented native pairing;
it is not, by itself, a defect. No remote form was created.

The authenticated exact-site Forms & Submissions dashboard was rechecked and
displayed **0/25 forms created** and **No results found**. Only the Create Form
menu was opened; no Website Form or Standalone Form creation was initiated.
The menu did not expose a create-disabled control. This does not prove that no
later editor setting exists; it means disabled-at-creation was not established.

An independent read-only app-instance identity check through the site-scoped
connector returned **HTTP 400: Missing authentication information**. That result
does not identify the site behind the connector or prove a particular repair.
It may reflect the method's app-authentication requirement. Existing dashboard
access remains valid; the whole Wix account is not claimed to be inaccessible.

Because the historical Forms connector isolation warning remains unresolved,
no Forms list/query/create/update call was made. No out-of-scope form data was
retrieved. Remote creation is held, not completed and not awaiting another generic
business/design approval. Neither customer form has a verified Wix form ID.

### Current native schema findings

The checked Form Schemas v4 contract supports explicit `enabled: false`. Omitting
it defaults to enabled; a hidden/unshared form is not a substitute. The local
drafts request disabled state from creation, `ADVANCED` spam protection and
`OWNER_AND_COLLABORATORS` submission access. These are requested draft settings,
not saved remote settings or a completed privacy review.

Current Wix docs supersede the installed skill's older example: use per-field
`inputOptions.contactMapping`. `postSubmissionTriggers.upsertContact` is a noop /
response-only and must not be used for configuration. Only phone and email are
mapped in the drafts. No native FULL_NAME enum exists; name stays in the enquiry.

Each draft now has 16 input fields, a review notice and four navigation display fields,
four steps with every field placed, native option/validation pairs and conditional
phone/email requirements. This native Review step is a notice, not a second
implementation of the custom frontend's dynamic answer summary.

Native upload categories IMAGE/DOCUMENT are broader than the agreed JPG/PNG/WebP/
PDF list and do not provide the approved 10 MB each / 20 MB total guarantee.
The future controlled upload path must verify MIME, file signatures, byte/count
limits, private access, retention and deletion. Do not activate this draft as an
unrestricted standalone upload form.

The native recipe calls for a live test submission to prove ARRAY-field behaviour.
That step was deliberately deferred because this stage excludes submissions.
Saved-schema, dashboard rendering and receipt tests remain outstanding.

## Notification drafts — text only, no automation configured

### Customer enquiry acknowledgement

Subject: **Your Kitchen3D enquiry**

> Thank you for your enquiry. Reza will contact you to discuss your kitchen project
> and the next step. Any preferred site-visit date or time is a request, not a
> confirmed appointment. The initial visit is free and without obligation, takes
> up to 45 minutes and is arranged subject to service-area coverage and availability.
> Work, materials, agreed additional items and final price will be set out in your
> agreed quotation and contract.

Send only after a verified recorded submission, once the recipient/channel and
delivery workflow are approved and tested. Phone-only enquiries must not receive
an email or be forced to invent one. Do not infer SMS authority or marketing consent.

### Internal notification

Subject: **New Kitchen3D [installation / complete kitchen] enquiry — [reference]**

> A new enquiry has been recorded. Review the enquiry in the authorised Wix
> dashboard, check the project postcode and requirements, then contact the customer
> using their preferred method. A requested visit time is not reserved.

The operational recipient remains unset. Do not insert addresses, project notes,
file contents or tokens in logs or general notification previews. Notify once
after confirmed receipt; reconcile ambiguous responses before retrying.

## Verification

- `node scripts/check-enquiries.mjs`: **PASS — 246 synthetic checks**. Both
  journeys and the two offline native drafts pass. Disabled-boundary counters:
  network calls 0, request-property/body reads 0, application logs 0, even with
  spoofed enabling settings. Remote form IDs remain absent.
- `node scripts/check-preview.mjs`: **PASS**, zero Wix CMS requests in offline
  tests; original credential gate and preview form-safety checks retained.
- `npm run lint` and `npm run typecheck`: **PASS** after final code integration.
- `K3D_LOCAL_PREVIEW=1 npm run build`: **PASS**, Next.js 14.2.35. The new endpoint
  is dynamic; approved page bundles remain approximately 102 kB for home and
  101 kB for each enquiry journey. This is an offline production-format build.
- Loopback HTTP: all three preview routes return **200**, noindex and preview
  notices. Synthetic POST to `/api/enquiries` returns **503** with the fixed
  disabled code, `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.
- Browser: settled homepage layout and both journey screens render; navigation
  works; empty required installation fields block progression. No captured
  error/warning logs or framework overlay. Document/body widths match in the
  desktop check. Earlier full-journey/mobile acceptance remains recorded in the
  preview handover; it was not represented as a new full retest here.
- Browser verification used the integrated browser because `agent-browser` is
  not installed. No browser tool or dependency was installed.
- `check:inventory`: **structural PASS / publication HOLD**. Existing 80 missing
  alt texts, 11 review-required names, descriptive differences and 124-versus-123
  media conflict remain.
- `check:content`: **FAIL — 41 matches / publication HOLD**, up from 40 because
  the new inactive contract repeats the approved supplier-selection list. This
  is not a new public partnership claim. No checker suppression was added.
- `git diff --check`: **PASS**. Git retains existing Windows CRLF conversion
  notices; no whitespace-error failure. Package/dependency/lockfile diff is empty.

The original preview process was stopped before building; the updated preview
was restarted on `127.0.0.1:3100`. Temporary audit/verification tabs were closed;
the user's preview tab was left intact. No subagent work remains running.

These checks prove local behaviour only; they are not evidence of live Wix
receipt, spam protection, duplicate prevention, file privacy, notifications or
calendar sync. The existing optional `sharp` recommendation remains; no install.

## Next action and activation gates

1. Restore or independently verify the Wix connector's **Kitchen3D-only scope**.
   Reconnecting the Wix integration is a reasonable troubleshooting step, not a
   guaranteed fix. No API key or token should be pasted into chat. Re-run a valid
   identity proof before any Forms access; do not retry the historical leaking
   list route on the assumption that it is now safe.
2. Once scope is proven, execute the already-authorised two disabled creations
   atomically per form, verify disabled state, all field/layout/rule mappings and
   dashboard rendering, and save the actual returned form IDs. Do not create an
   enabled form as an intermediate state. Do not consume slots with probe forms.
3. Apply approved service descriptions and the missing appliance-installation
   mention in a coordinated local content pass. If extending choices, change UI,
   contract, native enums and tests together without increasing the field count.
4. Before live collection: finish privacy/retention, spam/rate/size limits,
   upload controls, native confirmation/retry/reconciliation handling and controlled
   activation testing. An environment toggle alone must not bypass these gates.
5. Before live booking: resolve Reza's correct staff/calendar identity, Google
   consent, actual visit availability, travel buffers and service boundary. Preserve
   the three existing paid services. Deployment and DNS remain separate gates.

## Sources checked this stage

- Exact-site dashboard: <https://manage.wix.com/dashboard/543768f5-be18-4f7c-bb3b-380f4b05c925/wix-forms>
- [Create Form recipe](https://dev.wix.com/docs/api-reference/crm/forms/skills/create-form)
- [Create Form API/schema](https://dev.wix.com/docs/api-reference/crm/forms/form-schemas/create-form)
- [About Form Fields](https://dev.wix.com/docs/api-reference/crm/forms/form-schemas/about-form-fields)
- [Get App Instance](https://dev.wix.com/docs/api-reference/app-management/app-instance/get-app-instance) — method requires Wix app authentication; identity attempt failed as described above.

Use the saved project plan and owner-direction evidence for business scope. Do
not reinterpret an offline technical PASS as a public claim or release approval.
