# Kitchen3D owner-direction preview

Date: 5 September 2026. Status: **USER REVIEW ACCEPTED — WIX INTEGRATION PREPARATION — NOT RELEASE READY**.

## Review acceptance — 5 September 2026

Omid reported: “we have done the review and both journey and we found it excellent
and ready to proceed next steps”. The homepage and both local enquiry journeys
are accepted for progressing to integration. This records the user's review;
it does not independently assert another signature or a new direct owner message.
No further broad design approval or discovery questionnaire is needed.

The next-stage configuration inventory and field mapping are recorded in
`WIX_INTEGRATION_STAGE_2_PLAN_2026-09-05.md`. Live submissions, calendar changes,
customer notifications, publication and DNS remain outside this acceptance.

## Authority and baseline

Implemented the local homepage and two enquiry-journey preview after Omid's
“you can move forward and procced”, following the confirmed implementation
sequence in `../../docs/K3D_CONFIRMED_DIRECTION_AND_EXECUTION_BRIEF_2026-09-05.md`.
This does not approve publication, deployment, DNS, live calendar configuration,
customer submissions or payment services.

- Branch: `codex/k3d-owner-preview`.
- Base: `c3d2364` (`fix: contain held public claims`).
- Preview edits are uncommitted. No commit, push or pull request was created.
- Existing untracked `media/files/` was present before work and is preserved.
- The separate Digia Booster Persian owner form and its submission were untouched.

## Delivered

1. English-UK homepage with the supplied brand direction, existing logo, warm
   muted turquoise/cream palette, two prominent customer paths, services,
   before/after controls, FAQs and contact links.
2. `/installation-enquiry`: supplier, removal, dates, services, trade coordination,
   optional plans/photos, preferred visit and contact details.
3. `/plan-your-kitchen`: planning stage, style, budget guide, timing, services,
   optional plans/photos, preferred visit and contact details.
4. Four short steps per journey with native required-field checks, review/back,
   local-only completion, file selection/removal and a clear reset on completion.
5. Responsive mobile navigation, labelled controls, keyboard focus on step
   changes, a skip link and reduced-motion styling.

The preview UI has no connected form handler, database, analytics, marketing
consent, email automation, availability inventory, booking confirmation or calendar
connection. The later inactive stage adds a separate HTTP endpoint that always
returns 503; the preview does not call it.
The form does not use browser storage, include entered details in URLs, or send
file contents anywhere. Use fictional details only for this review.

The 45-minute visit is a preferred-time enquiry, not a live slot reservation.
Full-project materials and additional items are explicitly limited to the agreed
quotation, scope, contract and final price. Supplier names are plain selection
options, not logos or partnership claims. No reviews, ratings, years of experience,
insurance, warranty or professional-registration assertions were invented.

## Isolation

`K3D_LOCAL_PREVIEW=1` is an explicit process-only switch. In this mode all four
Wix CMS read functions short-circuit to empty results before any request. Legacy
CMS pages therefore have no local fixture records. The new homepage does not
depend on those records.

The preview uses `.next-preview`, not `.next`, and marks its routes noindex and
nofollow. Noindex is not access control: run only on `127.0.0.1`, not a public
interface or tunnel. Do not configure the preview flag on Vercel.

Without the flag, the original homepage/layout and missing-credential error
remain; the new enquiry pages are guarded with `notFound()`. Normal credential-
backed production rendering and SEO migration have not been revalidated here.

## Source changes

- Existing files: `.gitignore`, `README.md`, `next.config.mjs`, `tsconfig.json`,
  `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/wix.ts`.
- `next-env.d.ts`: Next.js itself added its navigation compatibility type reference
  during the build; retained as generated framework output.
- Added: `src/app/preview.css`, two enquiry route files, five components under
  `src/components/preview/`, `src/lib/preview-validation.ts`,
  `scripts/check-preview.mjs`, this document and six preview asset copies.
- `package.json`, dependency fields, versions, lockfiles, existing content/inventory
  checkers and the historical data/page/post/media evidence files are unchanged.

## Image provenance

These are review assets, not a publication-clearance determination. Original
media files were copied, not edited, moved or deleted.

| Preview file | Existing source | Treatment |
|---|---|---|
| `public/preview/logo.png` | `media/files/2025/12/kitchen-3d-logo-without-bg.png` | Existing transparent logo, unmodified |
| `public/preview/owner-logo.png` | Owner-submitted Wix form asset `f2306a_cbc27873afd1473aa96d241b63645956~mv2.png` | Downloaded public asset; visual palette reference, not rendered on homepage |
| `public/preview/kitchen-inspiration.webp` | `media/files/2025/12/a-large-kitchen-with-white-cabinets-and-a-wooden.webp` | Hero labelled design inspiration; not represented as completed Kitchen3D work |
| `public/preview/light-kitchen-before.webp` | `media/files/2026/01/Light-modern-kitchen-before.webp` | Existing-site portfolio, labelled internal review |
| `public/preview/light-kitchen-after.webp` | `media/files/2026/01/Light-modern-kitchen-after.webp` | Existing-site portfolio, labelled internal review |
| `public/preview/dark-kitchen-after.webp` | `media/files/2026/01/Dark-Contemporary-after.webp` | Existing-site portfolio, labelled internal review |

The turquoise is a screen-based interpretation of the supplied logo background,
not a claimed official print/Pantone value. The original logo was not recoloured.
Final project images, context, captions and clearance remain to follow from Reza.

## Verification

- `npm run lint`: PASS, no warnings after final corrections.
- `npm run typecheck`: PASS.
- `node scripts/check-preview.mjs`: PASS. Uses isolated synthetic environment
  values and a stubbed network function: zero Wix requests for all four CMS reads.
  Also checks the original missing-credential gate, file type/count/size limits,
  phone syntax, source-level route guards and absence of submission/storage APIs.
- `K3D_LOCAL_PREVIEW=1 npm run build`: PASS, seven static pages generated. This is
  an offline-mode production-format build, not proof of the live Wix integration.
- Browser: homepage renders with noindex/nofollow; no missing loaded images or
  framework error overlay; no captured console errors/warnings during tested flows.
- Browser: before/after toggle, FAQ expansion, navigation, mandatory-field blocking,
  installation journey with a local image selection, retained values on Back,
  phone contact, complete-project journey with email-only contact, review wording,
  completion and sample-data clearing verified.
- Responsive browser review: desktop and mobile layouts inspected. At the mobile
  override used, the browser reported a 417 CSS-pixel document width; body width
  matched, with no horizontal overflow. Mobile navigation opened and navigated.
- `git diff --check`: PASS.

### Holds and warnings deliberately retained

- `check:content`: FAIL / PUBLICATION HOLD. It reports 40 matches under the old
  K3D-001 rules, including unchanged legacy copy and newly owner-confirmed brand,
  service, contact and supplier-selector wording. No blanket suppression was added.
  Reconcile individual claims against the owner evidence before release; do not
  interpret the regex result as either disproving owner confirmation or approving
  all legacy claims. The inherited bedroom-furniture service remains unresolved
  and is not included in the new preview navigation.
- `check:inventory`: structural PASS; publication HOLD. Existing warnings remain:
  80 missing alt texts, 11 review-required names, descriptive field differences,
  and the documented 124 versus enumerated 123 media conflict.
- Next.js logs its existing optional `sharp` recommendation when optimising images.
  Images render using the existing fallback. No package was installed or upgraded.
- No live availability, concurrent-booking, cancellation, Google-sync, notification,
  payment, credentials or external deployment tests were performed.

## Next action

The local homepage and both journeys have been reviewed and accepted. Omid has
authorised the inactive-form/local-adapter stage; do not request that approval
again. The local contract, disabled endpoint and form drafts are implemented;
remote form creation is held at the site-isolation check. See
`ENQUIRY_INTEGRATION_STAGE_2_HANDOVER_2026-09-05.md` for current results and next
action. Before live booking setup, resolve Reza's calendar, staff record, actual
availability, travel allowance and outer service boundary.
The agreed design direction does not need another broad questionnaire.

Local run instructions are in the README. Stop the preview server with Ctrl+C in
its terminal when no longer needed. No live website or remote setting was changed.
