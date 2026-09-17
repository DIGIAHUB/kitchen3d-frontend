# Protected staging result — READY, not a live release

## Deployment

- URL: https://kitchen3d-frontend-gvu0ug8bg-hello-26951171s-projects.vercel.app
- ID: `dpl_8SNJNcpdGVzDrs9HdbAMs3odmVTr`
- Existing Kitchen3D project: `prj_LQVeZOIeNzDGaH53EfXq3MTb2AJl`
- Explicit CLI target: Preview; API target field null (not production).
- Status: READY. Remote build interval approximately 30 seconds.
- Next.js source uploaded directly, no Git push. Metadata records local base
  `c3d23644e7371b78fbaaed8e4371f5c9f60b7865`, branch
  `codex/k3d-owner-preview`, gitDirty=1. The base commit alone does not identify
  this candidate: the authoritative uploaded-source manifest is
  `AD3278A117F40918910F419E28081971C05F50D1D4669C9B6D802D68400FC94E`.
- All 52 upload files / 2,005,412 bytes matched the previously tested dry-run.
  No source change between that manifest and upload. Remote build selected
  normal mode; neither local-mode flag is present in project configuration.

## Credential boundary

User confirmed saving the staging key. A metadata-only read verified
`WIX_API_KEY` is sensitive and `WIX_SITE_ID` encrypted, both Preview-only for
`codex/k3d-owner-preview`. Production entries remain separately Production-only.
No secret was printed, downloaded, committed or copied into source.

Earlier wording describing the original key as read-only was not established:
the user's screenshots showed both old Wix keys with All sites / Wix Data
management access. User was directed to create a Kitchen3D-only staging key.
Vercel metadata verifies storage scope, not the new key's Wix permission scope.
Do not claim that permission scope was independently audited by this deployment.
Only CMS reads are wired into this candidate; no Forms/Contacts operations.

## Protection and checks

- Project authentication remains `all_except_custom_domains`; preflight found
  no Preview custom domains, bypass secrets or displayed exceptions.
- Anonymous GETs to homepage, planning journey and enquiry API redirect to
  Vercel login (302); no authenticated cookies or bypass headers supplied.
- Signed-in browser renders the accepted homepage with correct images. No
  captured warning/error was reported during the checked-page navigation.
- Homepage-to-Services keyboard navigation works. Services and plumbing,
  blog index and retained kitchen-fitting guide render meaningful content.
- Both enquiry pages have zero main-content input/form controls and remain
  honest contact fallbacks. No customer submission or booking test was made.
- Checked pages retain noindex/nofollow; content routes retain expected
  kitchen3d.co.uk canonical metadata.
- Thank-you renders the safe non-receipt page; the held wardrobe route renders
  the branded missing-page state. The kitchen-unit-assembly URL redirects to
  kitchen-fitting-installation, verified by settled browser URL and content.
- Direct browser navigation to robots.txt was blocked by the browser client.
  Remote robots content was not independently verified in this cycle; the
  previous local robots tests passed. Do not conflate this with a server error.
- Post-deployment project read confirms Production still points to
  `dpl_Ex52Rx4Ma1o4ybC4XBHZv4f7s4bw`. No promotion, DNS, production alias change,
  CMS content write, notification, live enquiry, booking or new media package.

## Remaining

This completes the approved first protected staging deployment, not migration
or launch acceptance. Broader staging route/mobile/accessibility/performance
coverage, live CMS content reconciliation, privacy and secure delivery/storage,
the deferred operational Wix setup and controlled receipt/calendar tests remain.
Existing asset URL preservation and launch-only removal of internal preview
notes must precede a separately approved public release. Indexing remains held.
No background implementation is scheduled; the protected review URL is retained.
