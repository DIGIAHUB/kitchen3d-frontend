# Kitchen3D local productionisation and delivery checkpoint

17 September 2026. Branch `codex/k3d-owner-preview`, base `c3d2364`.
Status: LOCAL CANDIDATE VERIFIED; NOT DEPLOYED; LIVE COLLECTION DISABLED.

## Implemented

- Approved homepage and shared shell now render in normal mode. No design rewrite.
- Both enquiry routes return 200 with phone/email contact, no form controls and no
  suggestion that opening the page sends an enquiry or books a visit.
- Exact preview flag retains the accepted four-step, sixteen-question sample
  journeys. The wizard itself was not changed in this continuation.
- Branded missing-page fallback; noindex/nofollow and robots disallow-all remain.
- Independent `.next-candidate` build with `K3D_LOCAL_CANDIDATE=1` bypasses all CMS
  reads for offline testing. Neither local switch belongs in deployment settings.
- Isolated Wix transport: fixed Kitchen3D endpoint/site, validated binding and
  payload, explicit injected request and credentials, CAPTCHA token envelope,
  one attempt, bounded response body and deadline, strict receipt correlation.
- Separate coordinator requires a shared atomic admission/settlement store. It
  snapshots the payload before awaiting admission, uses an HMAC fingerprint,
  fences settlement by lease, and does not resend uncertain outcomes. No memory
  fallback or actual production storage adapter was added.
- Transport and coordinator are not imported by the UI or HTTP endpoint. The
  endpoint remains 503 and does not read submitted customer data.

## Verification

- Existing synthetic suites: 715 checks passed.
- Transport/coordinator: 80 checks passed, 52 intercepted attempts, zero real
  network calls. Fake-store concurrency tests do not prove production durability.
- Shell: 16 render checks plus four offline CMS operations passed.
- Total counted checks: 811, plus preview checker and four offline CMS operations.
- Lint, type-check, optimized preview and candidate builds passed.
- Final HTTP checks: both modes home and enquiry routes 200; robots disallow-all;
  candidate unknown route 404; synthetic empty enquiry POST 503.
- Browser: candidate fallback pages render approved shell and correct contact
  states; sample planning journey retains its four-step entry. Candidate console
  error inspection returned none. Earlier candidate homepage screenshot checked.
- Git diff whitespace check passed. Package and lockfile diff empty. No installs,
  remote changes, live submissions, uploads, notifications, deployment or DNS.

## Local review

- `http://127.0.0.1:3100/`: full offline sample preview.
- `http://127.0.0.1:3101/`: offline normal-view candidate.

Servers were left running on loopback at handover. Their continued availability
depends on the local processes. No background implementation is scheduled.

## Remaining dependencies and work

Real delivery needs the two intended native customer forms and verified exact
site/form/namespace/field bindings, secure server-side authorization, CAPTCHA
verification, a real shared atomic admission/quota store, and controlled receipt
tests. File uploads remain rejected until supported private association, type/
size validation, access controls and cleanup exist. No transport test proves
native Wix acceptance or appointment creation.

Dashboard/calendar setup remains user-managed and deferred. Do not request
Google reconnection or inspect Forms/Contacts without resolving the prior scope
isolation hold. New portfolio publication remains deferred until after launch.

The retained CMS page/article bodies, URL outcomes, consistent styling, metadata,
canonicals and sitemap still need completion/verification. Preview media notes
remain in this offline candidate and must not be published inadvertently. Release
also requires reproducibility/security review, a credential-backed build, staging
end-to-end checks, rollback preparation and separately authorized DNS cutover.

Next.js/React guidance informed server-component boundaries and client-safe
props. Public Wix API documentation informed the submission envelope; actual
authorized integration is not verified by documentation or synthetic tests.
