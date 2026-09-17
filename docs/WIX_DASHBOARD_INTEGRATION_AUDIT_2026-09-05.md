# Kitchen3D dashboard integration audit

Date: 5 September 2026.
Status: **USER-MANAGED DASHBOARD SETUP DEFERRED — FRONTEND WORK CONTINUES — NOT LIVE**.

This record contains successive checkpoints. Google sync evidence is recorded in
"Supplied Google Calendar sync confirmation". The latest continuation is in
"User-directed dashboard deferral" at the end. Earlier findings retain their
original scope and timing.

## Initial read-only scope and evidence

Omid authorised control of the open browser session to inspect settings needed for
integration and setup. The inspected in-app browser remained within Kitchen3D,
site `543768f5-be18-4f7c-bb3b-380f4b05c925`. Findings below are current rendered
dashboard observations, not results from the Wix connector. A separate read-only
subagent checked the existing local handover for missing prerequisites.

No dashboard values were entered, saved or toggled. No client secret or API key
was generated, revealed or used. No OAuth consent, invitation, notification,
submission, upload, booking, app installation, payment setup, deployment or DNS
change was performed. Settings editors were left without saving. Staff email
addresses were omitted from captured text; no customer records or calendar
events were opened. Only this local audit document was added.

The successful exact-ID lookup reported by Omid belongs to a fresh task. This
original task's last exact-ID connector call still returned MCP `Unknown tool`.
Browser access works independently; it does not establish connector-wide
isolation or lift the Forms/Contacts connector hold. Neither Forms & Submissions
nor Contacts was opened during this inspection. Generic app and notification
settings mentioning Forms/Contacts are not submission/contact queries.

## Verified configuration and implications

| Area | Current dashboard observation | Integration implication |
|---|---|---|
| Existing plan and apps | Setup shows Core. Manage Apps lists Wix Forms, Wix Bookings and Wix Blog as business solutions, plus Checkout & Orders. | Reuse the existing site/apps. No duplicate client, app install or plan upgrade is justified by this inspection. Individual feature entitlements still need verification when used. |
| Headless client | One existing client, type Other, created 20 August 2026. | Client existence is verified; authentication capability, permissions and intended ownership are not proven by its presence. No tokens were requested. |
| Frontend link | Blank, with Add Link offered. | Set an approved externally reachable frontend URL only in the later controlled configuration stage. Do not put the loopback preview in a live email/notification setting. |
| Redirect configuration | Allowed redirect domains include `http://localhost:4321` and existing Wix-hosted domains. Authorization callbacks use port 4321 and the Wix-hosted domains, with `/api/auth/callback` and `/api/auth/logout-callback`. No port-3100 entry was displayed. Login URL is blank. | Existing values differ from the port-3100 preview. First establish which client and actual callback routes the future frontend will use. Do not blindly add 3100 or remove existing entries. This is not a defect in the current intentionally offline preview. A blank custom Login URL does not itself prove a missing required feature. |
| Language and region | English; English - United Kingdom; GBP; London time zone. | Preserve. The dashboard labels London as GMT+00:00; do not convert this to a fixed-offset application setting. |
| Default and staff hours | Monday-Friday 10:00-18:00; weekends not working. Staff hours explicitly follow business hours. | These are configured availability, not Reza's approval of visit hours. Published contact hours must not silently become appointment availability. |
| Staff and calendar | One bookable staff profile named Business Owner. Connections offers Sync; no connected calendar identity/status is displayed. | Reza's correct staff identity and calendar connection remain unverified. Do not equate the logged-in developer/account owner with the visiting professional. No Sync or invitation action was started. |
| Booking services | Exactly three listed: Installation Service (£3,000), Design Consultation (£150), Renovation Consultation (£200). No separate free-visit service appears. | Preserve these existing paid services and prices. They are configuration observations, not newly approved public offers. The approved free, no-obligation, up-to-45-minute customer-property visit requires a separate service later. |
| Payment warning | Bookings displays a warning that no payment method is connected and clients cannot book services. | Record the warning for the existing paid setup. Do not connect a payment provider just to implement the free visit; verify the eventual free-service flow separately. No live test was performed. |
| Outgoing notifications | The booking-confirmation email automation summary is ACTIVE. Other booking/form automation entries are present, but their individual states and recipients were not verified. | Creating a booking could trigger a real email. Keep booking/submission tests held until notification behaviour and test recipients are controlled. Do not duplicate default automations or assume all listed entries are active. |
| Privacy tools | The page offers a consent-banner app via Add to Site and privacy-policy setup guidance. | This is not proof of policy publication, consent enforcement or compliance on the new frontend. Do not install an app or infer legal readiness from this page. |

## Current official guidance checked

- A frontend link is used for communications and returns from Wix-managed flows.
  Setup-page entry can also change allowed redirect domains; the Headless Settings
  entry changes only the frontend link. This is why neither control was used.
  [Wix: Add a Frontend Link](https://dev.wix.com/docs/go-headless/project-management/add-a-frontend-link).
- Login callbacks need matching allowed authorization URIs; non-authentication
  returns use allowed redirect domains. Preserve the distinction when preparing
  the exact future configuration diff.
  [Wix: Allow Redirect URIs and Domains](https://dev.wix.com/docs/go-headless/authentication/setup/allow-redirect-uris-and-domains).
- Wix supports a Free price type. The payment warning does not by itself justify
  paid-provider setup for the approved no-obligation visit.
  [Wix: Selecting How You Charge](https://support.wix.com/en/article/wix-bookings-selecting-how-you-charge-for-bookings-services).
- The Google setup requires the correct account holder's consent. Current support
  guidance says only the primary Google calendar syncs; all-day or Free events
  do not block availability. Imported events can be shown as Busy. These cases
  belong in later controlled conflict tests, not a promise of perfect prevention.
  [Wix: Syncing Bookings and Google Calendars](https://support.wix.com/en/article/wix-bookings-syncing-bookings-and-google-calendars).

## Next work, without another generic approval loop

### Account confirmation follow-up

Omid confirmed `kitchen3dltd@gmail.com` as Reza's intended Google account. This
closes the Google-account selection question, not account-holder consent or
calendar-connection verification. No Google password or credential was requested.

A fresh exact-site staff-list check still shows one bookable Business Owner
profile. Its displayed staff email does **not** match the confirmed Google
address. The other address was omitted from the captured report. Different Wix
and Google emails do not by themselves prove incompatibility or identify who
owns the staff profile; Reza's correct staff mapping remains unverified.

Do not overwrite the existing owner profile, repurpose its paid-service
assignments, or start its Sync flow on this evidence. The proposed next step is
a separate Reza staff profile and a suitably limited Wix/calendar invitation,
subject to explicit authority for that access grant and outgoing invitation.
No staff profile, permission, invitation or calendar connection was changed.

### Authorised staff-profile creation follow-up

Omid's subsequent "go on" approved the separate staff profile and limited
booking-role invitation proposal. The following profile was created exactly
once and verified in the rendered dashboard:

- Name: Mohammad Reza Savadi.
- Email: `kitchen3dltd@gmail.com` (verified visually before creation and then in
  the saved profile's invitation destination).
- Staff ID in the dashboard URL: `ae2b0494-87a0-4bf3-84e4-27fbe22ccc0a`.
- Bookable: off. Phone, description and photo left blank.
- Dashboard access: **No access**. Not connected to a Wix account yet.
- Booking & availability and Connections tabs: disabled while non-bookable.
- No services were assigned, no working hours were changed, and no existing
  owner/profile or paid service was edited. Booking activation remains held.

At this checkpoint the invitation was staged, **not sent**. The UI had only Bookings Staff Member
checked; Admin (Co-Owner), Back Office Manager, Bookings Manager and Bookings
Admin are unchecked. The recipient is the confirmed Kitchen3D Gmail address.
No Send Invite or profile Save action was used to grant access after creation.

Current Wix guidance says the standard Bookings Staff Member role covers the
staff member's own sessions/client information, emailing their session
participants, blocking their calendar and marking their sessions paid. It is
not a calendar-sync-only role. An independent read-only subagent corroborated
this role choice; Manager/Admin roles were rejected as unnecessarily broad.
[Wix: Adding Staff Permissions](https://support.wix.com/en/article/adding-staff-permissions-in-wix-bookings).

The dashboard's detailed role popup unexpectedly displayed "0 permissions";
this does not establish that the documented session access is absent. Effective
access is not verified. Do not add broader permissions to compensate for that
display. Final access-grant confirmation was requested with the documented
role scope before sending the invitation. The browser was left on Reza's
Roles & permissions tab at the unsent invitation step.

Wix's documented flow requires Reza to accept the booking-role invitation before
the calendar-sync invitation/authorization stage. Non-bookable staging currently
disables Connections in this UI; do not silently turn Bookable on merely to
unlock it. No Google OAuth flow, invitation email, calendar sync or private-event
query was performed.

The initial browser text inspection did not expose the email input value;
visual verification showed it was present. The field was explicitly cleared and
typed once before creation. This was an inspection limitation, not a verified
Wix email-clearing defect. No duplicate profile was created during diagnosis.

### Confirmed invitation action and existing-account result

Omid explicitly confirmed the final Bookings Staff Member access scope and
recipient. The exact site/profile URL, recipient and selected role were checked
again. Only Bookings Staff Member was checked; the four broader visible roles
were unchecked. **Send Invite was clicked once.** It was not retried or resent.

Wix then changed the staff profile's Dashboard access from No access to
**Connected**, with the message that Mohammad Reza Savadi is connected to a Wix
account. It did not display a pending-invitation state. The role view unexpectedly
showed the broader booking roles checked and locked, so further writes stopped
and the exact site's Roles & Permissions list was inspected read-only.

That list shows the existing client account **Kitchen3d Ltd**, email
`kitchen3dltd@gmail.com`, role **Admin (Co-Owner)**, status **Active**, status date
**21 August 2026**. The other entry is the existing agency Owner. No pending
invitation is listed. This supports an existing active collaborator being linked
to the new staff profile, rather than a new collaborator waiting to accept an
invitation. The status date is not a separate audit of when each permission was
granted; no historical role-change log was inspected.

No Admin/Co-Owner/Manager checkbox was selected and no Save role changes action
was used. Existing client/agency access was not deliberately downgraded, removed
or broadened. The confirmed narrow invitation does not justify removing the
client's existing Co-Owner access. Effective least-privilege staff-only access
must not be claimed for an account whose site entry is Co-Owner.

**Verified result:** the separate Reza profile is connected to the existing Wix
account. **Not verified:** delivery of a new invitation email or recipient
inbox receipt; no new pending invitation appears. Do not tell Reza he must wait
for or accept a new invitation on this evidence. He can use his existing Wix
login. No new account/password setup was performed.

Reza remains non-bookable: Booking & availability and Connections remained
disabled after the action. No Google calendar authorization or sync took place,
and no booking/service assignment, customer record, live form, notification
automation, deployment or DNS setting was changed. Calendar setup remains a
later controlled step after actual visit availability/travel requirements and
the non-bookable staging gate are resolved.

### Remaining implementation sequence

1. Prepare the exact frontend/client/callback mapping against implemented routes
   and the eventual approved deployment URL. Existing client suitability must be
   established before reuse; no authentication or remote setting change is
   authorised by this audit alone.
2. Retain the local disabled enquiry drafts and endpoint. Resolve Forms connector
   request isolation independently, or verify a separately authorised exact-site
   management path that can create forms disabled from inception. Hidden or
   unshared is not the same as disabled. Do not use an enabled probe form.
3. Before scheduling activation, obtain only the missing operational decisions:
   Reza's account-holder calendar consent; actual visit windows,
   travel buffer and service-area boundary; notification destination; and
   retention/privacy instructions. Do not ask again about the already-confirmed
   free/no-obligation visit, duration, customer-property location or agreed scope.
4. Then prepare a separate free-visit service and controlled integration tests
   under the applicable activation authority, preserving paid services. Test
   cancellation, rescheduling, simultaneous attempts, Google busy/free/all-day
   cases, phone-entered appointments and notification behaviour before claiming
   booking readiness.

No source changes, package installation, build/test rerun, commit, push, live
release or publication were needed for this dashboard inspection. The prior
local test results in the stage-2 handover were not rerun or re-certified here.

Related local record:
[Inactive enquiry integration handover](ENQUIRY_INTEGRATION_STAGE_2_HANDOVER_2026-09-05.md).

## Resumption — local mapping and one-hour gap confirmed

After returning, Omid instructed the project to continue and confirmed **one hour
between Reza's visits**. Record this as a 60-minute gap from the end of one visit
to the start of the next, separate from the up-to-45-minute visit itself. Reserving
45 minutes for a 10:00 visit leaves the next visit no earlier than 11:45. This is
a scheduling interpretation/example, not published availability. Do not silently
double the gap by adding both a 60-minute before and a 60-minute after buffer.

Omid subsequently confirmed visits are possible **Monday through Saturday,
09:00-18:00; Sundays unavailable**. The initial "9 pm" wording was explicitly
clarified as **9 am** before recording these hours. Retain the existing
Europe/London time zone, not a fixed GMT offset. No holiday exceptions were
specified. The 60-minute gap remains unchanged. These are confirmed visit hours,
separate from public contact hours and the existing default staff configuration.
Omid subsequently relayed Reza's confirmation of **all Greater Manchester**,
including **Altrincham, Oldham, Bolton and Bury**, for the free initial visit.
These towns are examples within the confirmed coverage, not an exhaustive list
or a mileage radius. Do not infer coverage outside Greater Manchester or claim
that postcode/boundary validation has been implemented or tested.

Visit days, daily hours, gap and service area are now owner-confirmed. Google
authorisation and account connection were subsequently reported complete by Omid;
see the verification follow-up below. Notification destination and retention/
privacy decisions remain pending. This business confirmation does not activate booking availability
or establish calendar synchronisation or conflict prevention.
No calendar, staff, service or buffer setting
was changed in Wix during this resumption.

### Implemented frontend versus saved dashboard settings

A read-only subagent mapped the actual routes and server client. The main agent
retained the existing remote configuration. No secrets were inspected or used.

| Surface | Local implementation | Configuration decision now |
|---|---|---|
| `/`, `/blogs`, `/[slug]` | Server-rendered CMS routes; home has an offline-preview branch. `src/lib/wix.ts` uses server-side API-key Wix Data reads outside preview. Preview returns empty CMS results before credential validation/network; environment constants are still read at module load. | Browser OAuth redirects are not used by this access path. Preserve existing settings. |
| `/installation-enquiry`, `/plan-your-kitchen` | Local-only wizards; 404 without the explicit preview flag. No submission call. | No frontend-link or redirect addition for loopback. |
| `POST /api/enquiries` | Fixed disabled HTTP 503, without request/body reading. | Do not bind a live form or add an activation switch. |
| `/api/auth/callback`, `/api/auth/logout-callback`, login/logout | No such handlers, browser OAuth client, session flow or Wix SDK dependency exists. The single-segment CMS route cannot handle these callbacks. | Do not add port-3100 callbacks for nonexistent handlers. Implement/review an actually required auth flow before proposing exact URLs. |
| Headless client, frontend link, custom Login URL | Dashboard values come from the earlier saved inspection, not a fresh dashboard read. Current CMS code does not consume that client. | Client suitability remains unverified. Preserve the existing client; leave frontend link/login unchanged until there is an approved externally reachable frontend and a relevant implemented flow. |

The `4321` versus `3100` difference is not a defect in the intentionally offline
preview. No duplicate OAuth client, SDK install, redirect change or secret is
needed to complete the present local stage.

### Resumed local implementation and verification

The local native enquiry drafts now place a distinct navigation display field
at the end of each of their four pages. Both retain exactly 16 input fields,
explicit disabled state, no executor and no remote form IDs. No approved frontend
rendering, question, service option or public claim changed.

- Enquiry regression: **248 synthetic checks PASS**, independently rerun by the
  reviewer; network calls, request reads and application logs remain zero in the
  disabled-boundary tests. The scoped review found no navigation-change issues.
- Offline preview checks, lint and typecheck: **PASS**.
- Wix documentation article and API-schema tools responded successfully in this
  resumption. This supersedes the earlier docs-dispatch failure for these tools
  only. No site-context, Forms, Contacts or other business-data call was made.
- Forms/Contacts isolation is **not established** by documentation access; their
  hold remains. Do not repeat account reconnection as an assumed fix.
- Native API acceptance and Wix rendering remain **unverified**. No build,
  browser acceptance test, real submission, notification or calendar test was
  rerun; earlier results are historical, not newly certified here.

No packages, dependency fields, lockfiles, credentials, remote settings, paid
services, deployment or DNS were changed. Do not ask again for the confirmed
service area, days, daily hours or gap. Reza's Google authorisation/connection
has now been reported complete, and the supplied screenshot shows the intended
Google account as SYNCED; do not ask him to repeat the connection. Exact
staff-schedule linkage and operational behaviour still need verification;
notification destination and retention/privacy decisions are also outstanding.
Before remote creation, developer-side work requires a proven exact-site
disabled-form creation path, followed by saved-schema/render checks.

## Google connection update and read-only verification

Omid reported: **Reza authorised and connected his Google account**. This closes
the owner-reported authorisation/connection question. It is not yet an independent
verification of Google Calendar sync to the intended Kitchen3D staff schedule.
The previously confirmed intended account is `kitchen3dltd@gmail.com`; no Google
account email, connection ID or sync settings were returned in this check.

### Fresh observations

- Refreshed the exact Kitchen3D staff profile:
  `543768f5-be18-4f7c-bb3b-380f4b05c925` /
  `ae2b0494-87a0-4bf3-84e4-27fbe22ccc0a`.
- The profile still displays Mohammad Reza Savadi, **Bookable off**. Both
  Booking & availability and Connections tabs are disabled. The exact-site staff
  list corroborates Reza's confirmed business email and NOT BOOKABLE status.
  No Google connection state is visible on either inspected surface.
- The exact-site connector context lookup returned **No context found for the
  specified site**. This is not proof that the site or Google connection is absent.
- Current official documentation identifies a read-only alternative: Get Staff
  Member with `fields=RESOURCE_DETAILS` returns the staff event schedule ID;
  List Connections supports a `scheduleIds` filter. No event read is needed to
  inspect connection metadata. The request/response schemas were inspected.
- One site-scoped Get Staff Member request was attempted for Reza's exact ID,
  with `RESOURCE_DETAILS`. It failed with **UNAUTHORIZED / Reauthentication
  required** and returned no staff or schedule data. This is a Wix connector
  authentication result, not a Google Calendar rejection. It was not retried.
- Without a verified event schedule ID, no List Connections or Get Connection
  call was made. No broad connection query, calendar-event read, Forms or Contacts
  call was made. Forms/Contacts isolation remains unresolved.

### Outcome and next evidence

**Owner-reported:** Google authorisation and account connection completed.
**Independently verified:** correct staff profile remains non-bookable; connection
controls are disabled in the current dashboard session.
**Unverified:** actual Google account/schedule pairing, calendar sync direction
and status, and conflict prevention. Do not label the calendar disconnected or
failed merely because these checks could not expose its status.

Next evidence: Reza can share only the Kitchen3D Google Calendar connection
confirmation/settings panel, with calendar events and unrelated details excluded.
It should identify the staff/account and connected/sync status. Alternatively,
after Wix connector authentication is restored, repeat the exact staff metadata
read and then inspect connections filtered to the returned event schedule ID.
Do not request passwords/tokens, reconnect his Google account speculatively, or
enable Bookable solely to unlock the tab.

No settings, permissions, invitations, OAuth flows, services, working hours,
buffers, notifications, test bookings or calendar events were changed or created.
The user's browser was returned to Reza's original staff profile. Only these
local handover records were updated; prior code tests were not rerun.

Sources checked in this follow-up:

- [Wix staff calendar-sync guidance](https://support.wix.com/en/article/wix-bookings-syncing-staff-members-personal-calendars-with-the-bookings-calendar)
- [Get Staff Member](https://dev.wix.com/docs/api-reference/business-solutions/bookings/staff-members/staff-members/get-staff-member)
- [List Connections](https://dev.wix.com/docs/api-reference/business-solutions/bookings/calendar/external-calendar-v2/list-connections)

## Supplied Google Calendar sync confirmation

Omid supplied the requested screenshot. The visible **Manage calendar sync**
dialog states that the booking and personal calendars are synced and shows:

- Provider: **Google Calendar**.
- Account: **kitchen3dltd@gmail.com**, matching the confirmed intended account.
- Status: **SYNCED**, with a Manage control.

This is screenshot evidence of Wix reporting the intended Google account synced,
not merely a Google sign-in or a verbal report. The earlier request for this
confirmation screenshot is satisfied. Do not ask Reza to reconnect or to provide
the same screenshot again. No private calendar events are shown.

The crop does not show a site URL, staff name/ID, schedule ID or capture time.
Therefore the exact link to Reza's designated staff schedule is not independently
established by this image alone. It also does not prove sync direction, busy-time
blocking, cancellation/rescheduling propagation, duplicate prevention or delivery
of notifications. This limitation does not contradict the visible SYNCED status.

Evidence file: `C:/Users/omidm/AppData/Local/Temp/codex-clipboard-b4295842-a4c4-46b9-a312-36797a6ffa49.png`.
SHA-256: `39975767641821A7130150B301E13176E122E57897C484F77519E4C8363F1BDA`.
The supplied image was inspected as attached and its local file hash read. It was
not altered, uploaded or published; the temporary path may not persist.

Next developer step: establish the exact staff-schedule pairing through a safe
read-only path, then prepare the confirmed 45-minute free-visit configuration
and controlled tests while preserving existing paid services. Notification
destination, privacy/retention and activation controls remain outstanding.
Google reconnection is not the next step. No dashboard/API action, booking-setting
change, event access, live test or code change was performed in this follow-up.

## Free-visit preparation after GO ON

The next continuation prepares the free-visit policy and test plan locally:
[Free-visit setup and test plan](FREE_VISIT_SETUP_AND_TEST_PLAN_2026-09-05.md).
It preserves the approved customer journeys, existing paid services and inactive
endpoint. The model is not a native API request and cannot offer live bookings.

The displayed exact Reza profile was checked again without changing fields.
Bookable remains off; Connections and Booking & availability are disabled.
More Actions only exposed Delete staff member; that action was not selected.
The menu was closed and the original profile left unchanged. No private calendar
events, other staff calendars or broader account settings were opened.

The current Wix connector now rejects documentation calls with **UNAUTHORIZED /
Reauthentication required** (`oauth_token_invalid_grant`). No business-data API
call was retried. Omid was asked to reauthenticate the Codex Wix plugin, explicitly
leaving Reza's screenshot-confirmed Google connection untouched. This does not
invalidate the supplied SYNCED evidence or establish Forms/Contacts isolation.

Current public Wix guidance highlights that appointment buffers do not appear
as busy time in synced Google calendars. The free-visit plan therefore includes
an explicit test gate for appointments entered through Google or by phone.
[Wix buffer guidance](https://support.wix.com/en/article/wix-bookings-adding-a-time-buffer-after-appointments).

No remote service, staff assignment, working hours, calendar connection, test
appointment, outgoing notification, deployment or DNS change was performed.
Local policy tests are distinct from live booking/conflict tests; results and
limitations are recorded in the linked plan.

## User-directed dashboard deferral

Omid explicitly redirected work to frontend technical setup and will handle the
internal Wix dashboard manually later. Calendar/staff inspection and connector
reauthentication work have stopped. No repeat screenshot, reconnection or dashboard
approval request is pending from this task. Earlier dashboard next-actions are
superseded and must not block local frontend development.

The supplied Google SYNCED evidence is retained without further investigation.
The existing Forms/Contacts access hold is not waived, and nothing has been
activated, deployed or published. Resume remote integration only when placed
back in scope. Current work is recorded in
[Frontend continuation](FRONTEND_CONTINUATION_2026-09-05.md).
