# Kitchen3D technical integration checkpoint

Date: 7 September 2026.
Status: LOCAL TECHNICAL PASS; LIVE DELIVERY NOT ENABLED OR VERIFIED.
Branch: `codex/k3d-owner-preview`, existing base `c3d2364`.

## Current direction

Omid accepted the reviewed frontend and instructed autonomous technical progress,
asking for input only when a necessary action genuinely needs him. The accepted
homepage and two four-step, sixteen-question journeys are preserved.

Internal Wix dashboard, calendar and plugin-authentication work remains
user-managed and deferred. The media/publication package is also deferred for
a later consolidated review; it was not worked on in this pass. These deferrals
do not prevent local integration work and do not themselves activate a release.

## Implemented in this pass

| File | Result |
| --- | --- |
| `src/lib/wix.ts` | Existing CMS reader hardened: exact Kitchen3D site and collection checks, validated native items/fields, sanitized failures, rejected redirects, 10-second fetch/body deadline and abort, bounded pagination. |
| `src/lib/enquiries/request-boundary.ts` | Isolated POST/JSON parser: explicit trusted origin, strict streamed UTF-8, 32 KiB actual-byte cap, one 10-second deadline, fixed errors and bounded cleanup. |
| `src/lib/enquiries/wix-submission-adapter.ts` | Isolated native submission-object preparation and receipt classification for both journeys, reusing existing semantic validation. No transport or credentials. |
| `scripts/check-wix-cms.mjs` | Synthetic CMS response, scope, paging and failure tests. |
| `scripts/check-enquiry-request.mjs` | Synthetic request/header/stream/deadline tests. |
| `scripts/check-wix-submission-adapter.mjs` | Synthetic mapping, binding, receipt and composed parser-to-preparation tests. |

The CMS reader retains its four public functions and existing interfaces/sort
behavior. Lists use at most 100 items per request, 1,000 items and 20 requests.
An unproven terminal state at the cap throws; it does not silently truncate.
The explicit offline-preview gate still makes no Wix requests.

The adapter requires a future server-owned, independently verified Kitchen3D
form binding. Current bindings are null. Shape checking is not proof of site
isolation, native field rules, permissions or successful API acceptance. The
customer cannot supply a target form/site through the accepted input contract.

Only selected native target values are prepared; blank optional values are
omitted, and full names are preserved without guessed splitting. Selected files
return `UPLOADS_NOT_READY`; local metadata is never passed off as an uploaded
Wix file reference. This is a submission object, not an implemented full REST
envelope or authenticated HTTP transport.

Matching native ID, form, namespace and `CONFIRMED` status are required by the
receipt helper. Pending, payment, mismatched and malformed results remain
unconfirmed. All outcomes deny appointment confirmation and automatic retry.
Receipt authenticity and request-to-receipt correlation belong to the future
trusted transport; the pure classifier cannot establish those on its own.

The request parser is not authentication, CAPTCHA, rate limiting or semantic
enquiry validation. Neither new enquiry helper is imported into the UI or
`POST /api/enquiries`. That endpoint still unconditionally returns 503 without
reading the request, customer data or environment toggles.

## Verification completed

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `node scripts/check-wix-cms.mjs` | PASS: 104 cases, 134 intercepted requests, no real requests |
| `node scripts/check-enquiry-request.mjs` | PASS: 147 cases; fake deadlines, no real timer waits |
| `node scripts/check-wix-submission-adapter.mjs` | PASS: 79 cases, including both composed request paths |
| `node scripts/check-enquiries.mjs` | PASS: 269 existing cases |
| `node scripts/check-free-visit.mjs` | PASS: 116 existing policy cases |
| `node scripts/check-preview.mjs` | PASS; offline and disabled-route guarantees retained |
| Offline optimized build | PASS, Next.js 14.2.35, `.next-preview` |
| Local HTTP smoke checks | All three reviewed routes return 200 with preview/noindex markers; enquiry POST returns fixed 503/no-store |
| Fresh browser checks | Homepage and both journey entry pages render; navigation works; no new captured console errors or visible error overlay |
| Independent review | No concrete P1/P2 application findings in the three reviewed modules; all three new suites independently rerun |

Five counted suites total 715 synthetic checks, plus the separate preview
checks. The composition harness normalizes objects crossing its separate VM
realms; production plain-object guards were not weakened for the tests.

The prior preview server was stopped before rebuilding the same output
directory. The fresh build is running at `http://127.0.0.1:3100`, loopback only,
with `K3D_LOCAL_PREVIEW=1` and telemetry disabled. The in-app review tab was left
on the homepage. Existing optional `sharp` production-optimization warning is
not a build failure; no dependency was installed.

No UI/stylesheet, contract, options, source content, media, package, version or
lockfile change was made in this pass. Pre-existing working-tree changes were
preserved. No commit, push, PR, credential-backed request, Forms/Contacts query,
upload, live submission, notification, dashboard change, deployment or DNS change
was performed. The normal credential-backed build and live Wix behavior remain
unverified; local results are not launch acceptance.

## Next technical work

1. Prepare the server-side delivery/abuse-control layer, including timeout and
   duplicate-request recovery, while keeping live collection disabled.
2. When the deferred setup is resumed and verified target form schemas are
   available, bind exact Kitchen3D form targets and complete the real request/
   response contract. Add controlled integration tests for receipt, private
   uploads, CAPTCHA/rate limits and notification behavior before activation.
3. Complete release-environment, rollback, routing and DNS-cutover checks as a
   separate launch stage. Do not treat this local pass as a deployment.

No action is required from Omid for the completed local checkpoint. Do not
reopen dashboard reauthentication or media questions merely to continue local
technical work.

## Primary technical references

Native item shape and paging were checked against Wix's
[Query Data Items](https://dev.wix.com/docs/api-reference/business-solutions/cms/data-items/query-data-items)
and [Data Item Object](https://dev.wix.com/docs/api-reference/business-solutions/cms/data-items/data-item-object).
Submission target/value and status handling follow the
[Form Submissions introduction](https://dev.wix.com/docs/api-reference/crm/forms/form-submissions/introduction),
[Submission Object](https://dev.wix.com/docs/api-reference/crm/forms/form-submissions/submission-object)
and [About Submission Values](https://dev.wix.com/docs/api-reference/crm/forms/form-submissions/about-submission-values).
The full create-submission transport envelope was not verified or implemented.
Next.js server/client-boundary guidance kept the new integration helpers out of
the approved client UI; browser-verification guidance prompted a fresh-build
visual check using the available in-app browser instead of installing a CLI.
