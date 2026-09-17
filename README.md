# Kitchen 3D — Next.js Headless Frontend

Vercel-hosted frontend for **kitchen3d.co.uk**, pulling live content from **Wix Headless CMS**.

## Current checkpoint — 17 September 2026

The accepted frontend has a protected Vercel Preview deployment; this is not
the public launch. Online enquiries and bookings remain disabled. Production,
DNS and live collection must not be changed by following historical setup notes.

- [Protected staging result](docs/PROTECTED_STAGING_RESULT_2026-09-17.md)
- [Saved native enquiry forms and remaining integration gates](docs/NATIVE_ENQUIRY_FORMS_2026-09-17.md)
- [Release security preflight](docs/RELEASE_SECURITY_PREFLIGHT_2026-09-18.md)
- Owner-confirmed public copy is hash-locked by `config/approved-public-claims.mjs`.
  `npm run check:content` returns a review-required pass only while exact reviewed
  files match; it does not approve ratings, credentials, testimonials, new media
  or future wording changes.
- [Latest responsive checks, verified 595-file continuity archive and remaining work](docs/MIGRATION_CONTINUITY_2026-09-17.md)
- Offline archive verification: `node scripts/check-asset-preservation.mjs`, then
  `node scripts/check-archive-receipt.mjs receipt-1789681835070.json`.
  Archived media is not publication-cleared and is excluded from deployment.

## Owner-direction preview — local only, 5 September 2026

Branch: `codex/k3d-owner-preview`, based on `c3d2364`. This is a separately gated,
offline homepage and two enquiry journeys, not a release or Wix configuration.
The historical architecture/setup notes below do not establish current deployment
or migration status.

With the already installed dependencies, run in PowerShell:

```powershell
$env:K3D_LOCAL_PREVIEW = '1'
$env:NEXT_TELEMETRY_DISABLED = '1'
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

Open `http://127.0.0.1:3100`. For editing, use `npm run dev -- --hostname 127.0.0.1 --port 3100`
instead of build/start; stop the existing preview server first. Do not build and
run a dev server against the same `.next-preview` directory simultaneously.

- Routes: `/`, `/installation-enquiry`, `/plan-your-kitchen`.
- The explicit flag short-circuits all Wix reads, even if credentials are present.
  No `.env.local`, credentials, installs, live forms or calendar access are needed.
- Build output is isolated in `.next-preview`. Pages are marked `noindex, nofollow`.
  This is not authentication: bind to loopback and do not deploy or share a tunnel.
- Sample inputs and file selections remain in page memory. Nothing is submitted,
  uploaded, stored in browser storage or booked; finishing clears the sample data.
- Without the preview flag, the approved homepage/layout is now the default.
  Both enquiry routes show an honest phone/email fallback without collecting
  customer inputs. Legacy CMS routes still require their credential-backed reader
  unless a local offline mode is selected.
- The authorised 17 September framework upgrade supersedes the original dependency freeze; see the current baseline below. Source exports remain byte-preserved.
- Run `node scripts/check-preview.mjs`, `npm run lint`, `npm run typecheck`,
  `npm run check:inventory` and `npm run check:content`. The older content checker
  intentionally remains unchanged and can flag owner-approved preview language;
  its publication hold is not bypassed or treated as a technical build failure.
- Asset provenance and review results are in `docs/LOCAL_PREVIEW_HANDOVER.md`.

Use a fresh PowerShell window for normal application commands, or clear the
process-only switch with `Remove-Item Env:K3D_LOCAL_PREVIEW`. Do not set this flag
on Vercel. The normal credential-backed production build has not been revalidated
by the offline preview build.

## Inactive enquiry integration — 5 September 2026

The reviewed four-step structure is preserved and still offline. Service choices
and Greater Manchester copy were completed in the frontend continuation. The
client-safe `src/lib/enquiries/options.ts` supplies the UI, contract and local
native-form drafts from one options list, without adding questions. The separate
`src/lib/enquiries/contract.ts` validates synthetic inputs and maps them to
proposed form targets. It is not a live Wix writer. `POST /api/enquiries` always
returns HTTP 503 with a static disabled message, without reading the request
body. No environment variable or client flag enables it.

Run `node scripts/check-enquiries.mjs` for the independent synthetic checks.
`scripts/lib/wix-enquiry-form-drafts.mjs` composes two local disabled-form drafts
from the contract's options; it does not execute API requests, store customer
information or contain remote form IDs. Both forms have now been saved through
the exact Kitchen3D dashboard; see the current checkpoint above. These historical
templates are not the saved API schemas. Native API validation and rendering
checks remain outstanding. File category constraints alone
do not enforce the approved MIME/signature/byte limits.

Each draft retains 16 input fields and now includes navigation on every page.
The latest handover records the confirmed 60-minute gap between visits; this is
not configured availability or calendar activation.

See `docs/ENQUIRY_INTEGRATION_STAGE_2_HANDOVER_2026-09-05.md` for implemented scope,
the Wix identity-check hold, notification drafts and activation prerequisites.
Do not use this stage's checks as evidence of successful live receipt or booking.

## Inactive free-visit scheduling — 5 September 2026

Run `node scripts/check-free-visit.mjs` to check the separate offline policy:
45-minute reservations, Monday-Saturday 09:00-18:00 Europe/London, and a single
60-minute gap between visits. The Greater Manchester coverage description is
recorded, not geographically validated. Every result keeps `liveBookingAllowed`
false; it is not an available slot, a reservation or a Wix API request.

See `docs/FREE_VISIT_SETUP_AND_TEST_PLAN_2026-09-05.md` for the draft service,
calendar/notification test gates. Internal Wix dashboard setup is **user-managed
and deferred**, not a blocker to local frontend work. Do not retry plugin
reauthentication or calendar inspection unless the user resumes that work.
Wix's buffer does not appear as busy time in synced Google calendars; do not
claim that syncing alone protects the travel gap for Google/phone-entered visits.

## Current frontend continuation

See `docs/FRONTEND_CONTINUATION_2026-09-05.md` for the service-coverage and
shared-options checkpoint. Earlier dashboard next-actions
are superseded by the user's instruction to focus on frontend technical setup.
Live collection, bookings, deployment and DNS remain inactive/separately gated.

## Technical integration checkpoint — 7 September 2026

The owner-reviewed UI is unchanged. The existing CMS reader now checks the exact
Kitchen3D site/collection, validates responses and uses bounded pagination and
10-second request deadlines. This is locally tested, not a live CMS verification.

Two isolated enquiry helpers prepare bounded request parsing and native
submission-object mapping/receipt classification. Neither is imported by the
UI or the disabled endpoint. Remote form bindings remain empty; files cannot
be sent as local metadata, and an enquiry receipt cannot confirm an appointment.

Run the new synthetic checks with the already installed dependencies:

```powershell
node scripts/check-wix-cms.mjs
node scripts/check-enquiry-request.mjs
node scripts/check-wix-submission-adapter.mjs
```

See [Technical integration handover](docs/TECHNICAL_INTEGRATION_2026-09-07.md)
for verification and the remaining delivery work. Internal dashboard work and
the consolidated media/publication review remain deferred by the user.

## Local candidate checkpoint — 17 September 2026

The approved shell is no longer preview-only. The complete sample journeys remain
available only with `K3D_LOCAL_PREVIEW=1`; normal mode deliberately has no enquiry
form until delivery is verified. All modes retain noindex/nofollow and robots
disallow-all pending release. These are indexing hints, not access control.

To inspect the normal-view candidate without credentials or Wix calls, use a
separate PowerShell process with the existing dependencies:

```powershell
$env:K3D_LOCAL_PREVIEW = '0'
$env:K3D_LOCAL_CANDIDATE = '1'
$env:NEXT_TELEMETRY_DISABLED = '1'
npm run build
npm run start -- --hostname 127.0.0.1 --port 3101
```

This uses `.next-candidate`, separate from `.next-preview` and `.next`. Do not set
either local flag on Vercel or treat an offline artifact as a production build.
Use a fresh shell or remove both process flags before credential-backed work.
Legacy CMS records are intentionally absent in either offline mode.

`node scripts/check-production-shell.mjs` verifies the normal/sample distinction.
`node scripts/check-wix-transport.mjs` checks the isolated single-attempt transport
and duplicate-delivery coordinator using intercepted requests and a fake store.
Neither helper is connected to the UI or the always-disabled HTTP endpoint.
Real native form bindings, secure server configuration, CAPTCHA, shared durable
admission/quota storage, uploads and controlled receipt tests are still required.

See [17 September handover](docs/PRODUCTIONISATION_AND_DELIVERY_2026-09-17.md).

The subsequent [CMS route checkpoint](docs/CMS_ROUTE_CHECKPOINT_2026-09-17.md)
adds canonical metadata and route-collision validation. Run
`node scripts/check-migration-routes.mjs` for 70 local checks and the explicit
article-body completeness warning. Passing route tests does not clear that
content hold or activate indexing.

See [article implementation](docs/ARTICLE_IMPLEMENTATION_2026-09-17.md) for six
rewritten guides now available in the local candidate, the owner-directed
wardrobe hold. The dependency-upgrade authorization boundary was subsequently cleared.
Run `node scripts/check-article-body.mjs` for structured-text and rendering tests.

## Current local framework baseline — 17 September 2026

Next.js 16.3.5 / React 19.3.0, with exact dependency versions and
`package-lock.json`. Use Node 24.18.x (below 25) and npm 11.16.x (below 12),
consistent with `engines`; the recorded package manager is npm 11.16.0.
For a fresh local install use `npm ci --ignore-scripts --no-fund`, not an
uncontrolled dependency refresh. No credentials are needed for either offline mode.
ESLint uses `eslint.config.mjs`; the old `.eslintrc.json` is historical.
Run lint separately: Next.js 16 builds do not run it.

The immutable 18 page exports moved from `pages/` to `data/source-pages/` because
Next.js interprets the former as a competing router. All 18 hashes were preserved.
See [framework upgrade evidence](docs/FRAMEWORK_UPGRADE_2026-09-17.md), including
the ESLint 9 development-tool support exception. This is not a live release.

Eight retained service routes now use confirmed-scope editorial revisions in
`src/lib/service-pages.ts`, including specialist plumbing/electrical/tiling
coordination. Like the article revisions, these override matching CMS records
until deliberately reconciled with future dashboard editing. Source exports are
unchanged. The legacy body renderer validates bounded text and does not render
embedded forms or imply a successful submission. Run
`node scripts/check-page-body.mjs` (60 checks). See
[service-page checkpoint](docs/SERVICE_PAGE_CHECKPOINT_2026-09-17.md).

The retained `/services`, `/about`, `/contact` and `/faqs` URLs now have dedicated
server-rendered pages and global footer links. See
[core pages continuation](docs/CORE_PAGES_CONTINUATION_2026-09-17.md).
With both offline servers running, verify their rendered navigation using
`node scripts/check-local-http.mjs http://127.0.0.1:3101` and the equivalent
`:3100` command. The checker permits only these loopback origins, performs GETs
only and never submits data. Without an origin it skips explicitly.

`node scripts/check-retention.mjs` checks the inactive 90-day unsuccessful-enquiry
policy, timed from first receipt. This is not a deletion job or deployed storage
policy; accepted projects and active enquiries are excluded.

See [SEO and redirect continuation](docs/SEO_REDIRECT_CONTINUATION_2026-09-17.md)
for the 11 exact local redirects, safe thank-you page, held legacy routes,
inert sitemap/schema preparation and read-only hosting evidence. Run
`node scripts/check-redirects.mjs` and `node scripts/check-seo-preparation.mjs`;
the local HTTP checker also verifies the built redirects. No sitemap or indexing
activation is included in this checkpoint.
`node scripts/check-legacy-inventory.mjs http://127.0.0.1:3101` audits all 63
recorded non-media URLs, including old query strings and slash normalization;
use `:3100` for the sample mode. The 246 media URLs are explicitly excluded and
remain a cutover dependency. A separate clean `npm ci --ignore-scripts` install,
candidate build, lint and typecheck also passed; see the same checkpoint.

Protected staging was subsequently approved. See
[staging preflight](docs/PROTECTED_STAGING_PREFLIGHT_2026-09-17.md): protection and
upload scope checked; remote branch and branch-only site ID prepared; deployment
was initially held for user entry of the write-only Wix API key in Vercel.
The user subsequently saved it and the first protected Preview is now READY:
see [staging result](docs/PROTECTED_STAGING_RESULT_2026-09-17.md). Production/DNS
remain untouched; this is not a live release or completed integration.

## Historical architecture details

```
WordPress (retired source)  →  Wix CMS (backend)  →  Next.js on Vercel (frontend)
```

- **Wix Site**: MetaSite ID `543768f5-be18-4f7c-bb3b-380f4b05c925`
- **CMS Collections**: `Kitchen3DPages` (18 items) · `Kitchen3DBlogPosts` (7 items)
- **Frontend**: Next.js 14 App Router, deployed on Vercel
- **Styling**: Tailwind CSS

## Environment Variables

Set these in Vercel project settings (Settings → Environment Variables):

| Variable | Description | Example |
|---|---|---|
| `WIX_SITE_ID` | Wix MetaSite ID | `543768f5-be18-4f7c-bb3b-380f4b05c925` |
| `WIX_API_KEY` | Wix API key with Wix Data read access | Set only in a server-side environment variable; never commit, paste or display its value. |

Use `.env.example` as the current blank template. Copy it to `.env.local` only for an explicitly authorised Wix read session, then supply process-appropriate values without committing them. The existing `.env.local.example` is retained as historical repository evidence.

### Generating a Wix API Key

1. Go to [manage.wix.com/account/api-keys](https://manage.wix.com/account/api-keys)
2. Click **Generate API Key**
3. Name it: `kitchen3d-vercel-frontend`
4. Permission required: **Wix Data** → Read
5. Copy the generated token (starts with `IST.`) — it is only shown once
6. Add it as `WIX_API_KEY` in Vercel Environment Variables

## Wix CMS Collections

### `Kitchen3DPages`

Holds all 18 site pages. Fields:

| Field | Type | Description |
|---|---|---|
| `slug` | TEXT | URL slug (e.g. `kitchen-fitting-installation`) |
| `title` | TEXT | Page display title |
| `wpId` | NUMBER | Original WordPress page ID |
| `link` | TEXT | Original WordPress URL |
| `modified` | TEXT | Last modified date |
| `seoTitle` | TEXT | SEO title tag (Month-1 SEO deployment fills this) |
| `metaDescription` | TEXT | Meta description |
| `heroSubtitle` | TEXT | Hero section subtitle (service pages) |
| `bodyJson` | TEXT | JSON-encoded structured content |
| `note` | TEXT | Editor notes (not shown to visitors) |

### `Kitchen3DBlogPosts`

Holds all 7 blog posts. Fields:

| Field | Type | Description |
|---|---|---|
| `slug` | TEXT | URL slug (original WP slug preserved) |
| `title` | TEXT | Post title |
| `wpId` | NUMBER | Original WordPress post ID |
| `link` | TEXT | Original WordPress URL |
| `date` | TEXT | Published date (YYYY-MM-DD) |
| `modified` | TEXT | Last modified |
| `seoTitle` | TEXT | SEO title tag |
| `metaDescription` | TEXT | Meta description |
| `excerpt` | TEXT | Post excerpt/summary |
| `bodyJson` | TEXT | JSON-encoded body content |

## URL Structure

All slugs match the original WordPress URLs exactly (for SEO):

| Route | Maps to |
|---|---|
| `/` | Homepage (`home` page from Wix CMS) |
| `/[slug]` | Any of the 18 pages (e.g. `/kitchen-fitting-installation`) |
| `/[slug]` | Any of the 7 blog posts (e.g. `/flooring-installation-in-manchester-transform-your-home`) |
| `/blogs` | Blog index (lists all 7 posts) |

## Local Development

```bash
cp .env.example .env.local
# Fill in WIX_API_KEY in .env.local
npm install
npm run dev
```

Opens at `http://localhost:3000`.

PowerShell equivalent for the template copy:

```powershell
Copy-Item -LiteralPath .env.example -Destination .env.local
```

The historical instructions above are not the current offline setup. Use the
pinned baseline and local-mode commands above; do not create credentials or
change Vercel settings as part of local development.

## Local Validation

The hygiene checks are intentionally non-mutating:

```bash
npm run lint
npm run typecheck
npm run check:inventory
npm run check:content
npm run validate:local
```

- `check:inventory` verifies the controlled 18-page, 7-post and 123-enumerated-media evidence while retaining the unresolved 124-versus-123 media-count conflict.
- `check:content` scans public rendering source and exits non-zero when it finds editor-note rendering, known placeholders, or claims held by the K3D-001 evidence gate. It reports locations only and never rewrites content.
- `validate:local` combines lint, type-check, inventory and content gates. It may remain red until a separately approved content-containment change set resolves existing public-source findings.
- A credential-backed production build is not included in `validate:local`. It requires separate approval for process-scoped, least-privilege Wix read credentials.

## Deployment to Vercel — use the current release gates

The existing project is already linked. Do not create a duplicate project or
overwrite its Production configuration. The authorised staging variables are
Preview-only and scoped to `codex/k3d-owner-preview`; never expose the Wix key to
client code or commit it. Follow the protected staging evidence above, not a
generic deploy command. Production promotion, source push and DNS cutover remain
separately gated.

## Historical SEO notes — not current completion evidence

- All 18 page slugs and 7 blog post slugs match the original WordPress URLs exactly
- SEO titles and meta descriptions are populated from Wix CMS (`seoTitle`, `metaDescription` fields)
- Month-1 SEO deployment will fill in `seoTitle` and `metaDescription` in the CMS via the Wix API
- NAP (Name/Address/Phone) is identical across all pages per local SEO requirements

## Content Last Scraped

Scraped from kitchen3d.co.uk WordPress REST API: 24 August 2026.
