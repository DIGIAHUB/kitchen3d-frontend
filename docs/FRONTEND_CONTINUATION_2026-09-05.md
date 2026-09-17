# Kitchen3D frontend continuation

Date: 5 September 2026.
Status: **LOCAL FRONTEND PASS COMPLETE — DASHBOARD USER-MANAGED / DEFERRED — NOT LIVE**.
Branch: `codex/k3d-owner-preview`. Changes remain local and uncommitted.

## Current instruction

Omid instructed the team to stop spending time on internal Wix dashboard,
calendar and plugin reauthentication work. The team will configure the dashboard
manually later. This supersedes earlier dashboard next-actions: no reconnection,
repeat screenshot or dashboard approval is requested by this frontend task.
Dashboard setup is not a blocker to local technical development.

## Applied frontend changes

- Homepage explicitly includes appliance installation, qualifying any specialist
  connections as coordinated work. Plumbing, electrical work, gas, tiling and
  plastering are clearly coordinated services, not claims of direct trade
  qualifications. Existing three service groups, images and design are preserved.
- Greater Manchester coverage is explicit on the homepage and enquiry guidance.
  Altrincham, Oldham, Bolton and Bury are examples, not the coverage limit.
  The older Cheshire mention was removed from this preview's FAQ in favour of
  the latest confirmed Greater Manchester boundary.
- Both enquiry journeys now offer appliance installation plus five separate
  coordination choices inside the existing help-needed checkbox question.
  Existing options remain, including Specialist trades and Help me decide.
  There are thirteen choices, **not thirteen new questions**. Each journey still
  has sixteen answer fields over four steps.
- `src/lib/enquiries/options.ts` is the client-safe single source of choices for
  the wizard and inactive contract. The offline native draft builder receives
  that same list. The wizard does not import the full validation/mapping module.
- Visit copy reflects Monday-Saturday, 09:00-18:00 UK time, up to 45 minutes,
  all Greater Manchester and an hour between visits. Date/time fields remain
  preferences, not reservations or live availability. No booking engine is wired.
- No plasterboard/drylining, structural extensions, broad bespoke carpentry,
  certifications or additional public project claims were introduced.

## Verification from this continuation

| Check | Result |
|---|---|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `node scripts/check-enquiries.mjs` | 269 synthetic checks PASS; network 0, request reads 0, enquiry logs 0; both native drafts remain local-only |
| `node scripts/check-preview.mjs` | PASS; offline CMS, file/phone checks, route guards, no-submit/no-storage and shared-choice checks |
| `K3D_LOCAL_PREVIEW=1 npm run build` | PASS with installed Next.js 14.2.35; home and each enquiry approximately 102 kB first-load JS |
| Loopback HTTP | Home and both journeys 200, preview notice and noindex present |
| Synthetic `POST /api/enquiries` | 503, fixed `ENQUIRY_COLLECTION_DISABLED`, `no-store`, `noindex, nofollow` |
| Independent read-only review | No actionable findings; reran 269 enquiry and preview checks |
| `node scripts/check-free-visit.mjs` | 116 synthetic checks PASS; earlier standalone policy only, not used for frontend availability |
| Dependency / lockfile diff | Empty; no installation, upgrade or package-script change in this continuation |
| `git diff --check` | PASS for tracked diff; existing Windows CRLF notices only |

Browser verification used the integrated browser because agent-browser is not
installed. No browser dependency was installed. The offline production-format
preview was started on loopback `127.0.0.1:3100`; no existing listener needed
stopping. The browser received this build, not an older development bundle.

Browser receipts:

- Desktop homepage renders with the updated service/coverage copy; installation
  navigation works. Empty required fields block Continue.
- Installation journey completed with all six newly explicit choices and
  phone-only synthetic contact details. Review preserves those choices and
  qualifiers; Finish preview shows no-send/no-booking completion and clears data.
  Try again resets the supplier choice.
- Complete-kitchen journey completed at mobile width with plumbing and plastering
  choices and email-only synthetic details; phone is optional in that mode.
  Back preserves entered details (email confirmed visually and on the subsequent
  review). Finish clears the sample data.
- Thirteen service choices render as a single-column mobile list. Screenshots
  show readable labels, controls and qualification copy. Narrow homepage and
  mobile menu checked; the menu closes after navigating to the complete journey.
- No horizontal overflow in measured desktop/mobile states: document client and
  scroll widths match. Browser overrides of 390 and 320 produced CSS viewport
  widths of 434 and 356 with the browser's existing scale; these are responsive
  checks, not claims of testing named physical devices. Override reset afterward.
- No captured warning/error logs or framework error overlay. The verification tab
  was left on the homepage as the local preview deliverable. User-owned dashboard
  tabs were not changed. No real files were uploaded or enquiries submitted.

## Remaining limits — not a frontend failure

The unchanged `check:content` gate reports **43 findings / FAIL / publication
HOLD**. Its historical broad rules flag approved business/service/area wording
and supplier choices as well as older source. No suppression was added. This
local build is not a clearance of that publication gate.

`check:inventory` remains structural PASS / publication HOLD: 80 missing media
alt texts, 11 review-required names, six descriptive differences across five media
IDs and the documented 124-versus-123 count conflict remain unresolved.

Live Wix receipt, private uploads, spam controls, notifications, calendar conflicts
and production hosting are not verified or enabled. Existing remote services,
staff settings, Google connection, Forms/Contacts access holds, deployment and DNS
are untouched by this frontend continuation.

## Next work boundary

The frontend checkpoint is ready for continued local development without waiting
for the dashboard. Next content work is to incorporate Reza's additional approved
project photographs/captions when supplied and reconcile the remaining public
content/media findings against the owner-approved material. Keep existing images
labelled as preview material until that work is complete. Do not invent missing
project details. Dashboard setup can proceed independently with Omid's team.
Live collection and launch remain separate later steps, not automatic outcomes
of a technical PASS.
