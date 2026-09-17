# Kitchen3D: remaining route to full migration

Prepared 7 September 2026 for the next working session. Planning only; no live
action is authorised or performed by this roadmap.

## Current checkpoint

**Latest 17 September continuation:** protected staging is READY; targeted mobile
checks passed. All 123 enumerated original assets and 595 unique metadata-listed
asset URLs are now archived locally and hash-verified. The archive is not
deployed or publication-cleared. Production/DNS/live collection remain held.
See [current continuation and critical path](MIGRATION_CONTINUITY_2026-09-17.md)
and [protected deployment evidence](PROTECTED_STAGING_RESULT_2026-09-17.md).
The earlier checkpoint and stage descriptions below are historical planning;
they must not be read as instructions to repeat completed setup.

**17 September update:** the approved shell is now the normal-mode default and
both enquiry routes return a non-collecting phone/email fallback instead of 404.
The full sample journeys remain preview-only. Single-attempt delivery and durable
admission coordination are implemented as disconnected, locally tested helpers;
there is no production store or real form binding yet. The endpoint still returns
503. See [latest implementation evidence](PRODUCTIONISATION_AND_DELIVERY_2026-09-17.md).
Stages 1 and 2 have progressed; neither live integration nor launch is complete.

### Historical 7 September baseline (superseded where noted above)

The homepage/design and both four-step, sixteen-question journeys are accepted.
The latest local technical checkpoint passed 715 synthetic checks, preview
checks, lint, type-check, optimized offline build and browser checks. See
[technical handover](TECHNICAL_INTEGRATION_2026-09-07.md).

The reviewed frontend is still selected only by `K3D_LOCAL_PREVIEW=1`.
Without it, the application uses its legacy homepage/layout and both new enquiry
routes return 404. The preview switch must not simply be enabled on Vercel.
The enquiry endpoint always returns 503; form bindings are null; uploads and
booking creation are not connected. Local acceptance is not live migration.

The approved Option A architecture remains Next.js on Vercel with Wix as the
business/CMS backend. The domain must serve that frontend, not be pointed to Wix
solely because Wix supplies the backend. Revalidate the actual deployment/domain
configuration before cutover. No new platform or frontend rewrite is proposed.

## Ordered work packages

| Stage | Remaining work | Completion evidence | Lead |
| --- | --- | --- | --- |
| 1. Production-ready accepted UI | Preserve the reviewed design; separate local preview from the real site; make both journeys available in the production build; replace sample-only completion with honest delivery states; keep unfinished integrations inactive. | Normal-mode build serves the accepted UI without the local-preview switch; route and UI regression tests pass. | Codex |
| 2. Enquiry delivery | Implement scoped server-side transport, native request envelope, exact form bindings and receipt correlation; integrate existing validation; add duplicate protection, safe retry/reconciliation, rate limits and spam protection. | Both journeys reach the intended form once; pending/failure/timeout cases never show false success. Initial development remains local and disabled. | Codex; dashboard prerequisites later with Omid |
| 3. Customer uploads and privacy | Implement supported private file association, actual type/size checks, access controls and failure cleanup; settle retention/deletion, information-use notice and privacy link. | Controlled files reach only the intended enquiry; unauthorized access and disallowed files fail; handling is documented. | Codex; only missing business/data-handling choices to Omid |
| 4. Existing site/CMS and SEO continuity | Reconcile existing pages/blogs and the recorded URL migration map; complete retained page/article bodies; apply consistent accepted styling; preserve needed asset URLs; implement redirects, canonicals, sitemap, robots, metadata, navigation and useful 404s. | Each in-scope old URL has a tested retained page or intended redirect/retirement outcome; no accidental missing articles or legacy-host dependencies. | Codex |
| 5. Operational Wix and visits | When the user-managed dashboard setup resumes, connect the two native forms, contact handling and agreed notifications; connect the free-visit flow and test calendar/phone conflicts, rescheduling and cancellation. Preserve unrelated paid services. | Enquiries arrive at the correct business destination; genuine booking receipts and notification delivery are proven separately from enquiry receipt. | Omid/team: dashboard; Codex: integration and tests |
| 6. Release candidate | Review/version the exact local diff; verify runtime/dependency security and reproducibility; verify server-only configuration and access; build normal production mode; test a controlled staging candidate for mobile, accessibility, speed, failures, privacy and information exposure. Prepare backups and rollback. | A specific tested candidate is ready for release; production configuration is verified; rollback steps and restore sources are recorded. | Codex; access/plan decisions only if genuinely needed |
| 7. Deployment and domain cutover | At the separately authorised launch, deploy the tested candidate, verify the production URL, preserve the DNS zone and mail/verification records, connect apex/www to the frontend host, verify HTTPS and canonical routing, then switch traffic. | Correct site and both real journeys work on the domain; redirects and email-related DNS remain intact; rollback remains available. | Codex; Omid supplies final cutover decision/access if required |
| 8. Stabilise and hand over | Recheck live receipts, notifications, booking conflicts, crawl/indexing and errors; document how Reza manages enquiries/content/appointments; retain the old host/backup until the agreed rollback window closes. | End-to-end operational acceptance and a usable owner handover, not merely a changed DNS record. | Codex + Omid/Reza for operational receipt confirmation |

Stages 1-4 can progress locally while dashboard work stays deferred. Stage 5
must be verified before claiming a fully integrated booking system. If a staged
launch is later chosen, unverified instant booking must remain unavailable and
date/time inputs must explicitly remain requests; that is not full booking
completion. Stages 6-7 require the chosen launch scope to pass its checks first.

## Decisions already settled: do not ask again

- Preserve the accepted design, service direction and two customer journeys.
- Free visit: up to 45 minutes, Monday-Saturday 09:00-18:00 Europe/London,
  Sundays unavailable, 60 minutes between visits, all Greater Manchester.
- Google account connection was screenshot-confirmed. Do not repeat consent,
  reconnect requests or dashboard inspection now. Sync behavior still needs
  eventual end-to-end testing; a synced badge is not a conflict test.
- Internal dashboard work is user-managed and deferred, not a blocker to local
  productionisation or delivery-layer work.

## Deferred package, not the immediate critical path

Reza's additional project photographs, artwork, captions and expanded portfolio
publication are a later consolidated update after launch/DNS, as requested.
This roadmap does not restart that work. Customer attachments in stage 3 are a
different feature and do need safe handling before uploads are enabled.

Preserving existing asset URLs, providing usable alt text for anything actually
launched, and excluding unresolved public claims/internal preview notes remain
part of the launch candidate. Additional portfolio work need not block launch:
use only cleared material, or omit unresolved sections from the launch package.
That does not silently clear historical content/media findings.

Online deposits/payments, a Wix-managed frontend rewrite, new services and new
business claims are not added to the migration scope by this roadmap.

## What may eventually need Omid

Only actual access/consent steps we cannot perform, missing operational choices
(for example a notification destination if not already settled), the team's
deferred dashboard setup, controlled live-test coordination, and the final
deployment/DNS cutover decision. No repeat design approval or broad questionnaire.
Required dependency changes or plan costs, if discovered, will be presented as
specific decisions rather than applied under the existing no-upgrade/no-spend
boundary.

No action is needed before resting. On return, start stage 1 and continue stage 2
in parallel, with dashboard, media and live collection untouched. No overnight
automation or background implementation was started by this planning request.

## Evidence and hosting references

The route guards and inactive endpoint were inspected directly in this turn;
completed-test results are the recorded checkpoint, not tests rerun for this
roadmap. Current remote infrastructure/DNS were not inspected.

The approved Option A is recorded in
`../../docs/K3D-001_RECOVERY_REPORT.md` and the subsequent execution brief.
[Wix self-managed headless documentation](https://dev.wix.com/docs/go-headless/self-managed-headless/about-self-managed-headless)
confirms that a custom frontend uses Wix's backend while its hosting and
configuration are managed separately.
[Vercel DNS guidance](https://vercel.com/docs/domains/working-with-dns)
distinguishes web, mail and verification records; the cutover plan must preserve
the unrelated records and account for cached DNS changes. Exact live DNS values
will be obtained for the actual project at release time, not copied from examples.
