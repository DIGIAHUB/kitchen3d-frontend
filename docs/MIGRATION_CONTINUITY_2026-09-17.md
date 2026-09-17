# Migration continuity and staging follow-through

17 September 2026. Local preparation; not a production release.

## Protected staging verification

The accepted user story was checked on the existing protected deployment:
an authenticated reviewer can navigate from the homepage to services and a
specific service, with clear phone/email contact instead of unconnected forms.

- At 375 px viewport width, homepage, service index and plumbing page each had
  document width 375 px, with no horizontal overflow in those checks.
- All eight service cards measured approximately 335 px and stacked in one column.
- Homepage logo and three photographs finished loading successfully. Initial
  image readiness was transient; subsequent complete/naturalWidth checks passed.
- Mobile menu opened with Enter, closed with Escape and returned focus to its
  button. Footer-to-services and services-to-plumbing keyboard navigation passed.
- The checked pages retained noindex/nofollow. Plumbing had no customer input
  controls. Viewport emulation was cleared after testing.
- This is targeted keyboard/responsive verification, not a complete accessibility
  audit, touch-device test or measured performance score.
- Remote robots.txt remains UNVERIFIED: the browser client blocked navigation;
  the authenticated connector alternative returned a Vercel SSO redirect rather
  than its body. No bypass was followed or protection changed. Local robots
  tests remain the evidence for the intended disallow-all content.

See [deployed candidate details](PROTECTED_STAGING_RESULT_2026-09-17.md) for the
immutable deployment and uploaded source identity. This continuation did not
alter application rendering or deploy another candidate.

## Existing asset continuity — archive repaired

This is preservation of existing URLs, not new portfolio publication.

The read-only original-file audit found 107 local files against 123 enumerated
WordPress records. Recovered missing JPEGs with attachment IDs 43, 42, 41, 40,
39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 24 and 23 from their exact recorded
public URLs. No existing file was overwritten.

- Original-file archive: 123 files, 39,088,543 bytes; signature and SHA-256 checks.
- Original manifest SHA-256:
  `51d7eac959dff5bcac0ded0cb7ab5ad377710fa32c6e1cd8e6570c1592a3c54f`.
- Fresh public WordPress metadata: 123 enumerated records with exactly the same
  IDs and source URLs as the recovery inventory. Both response headers still
  report 124. The historical 124-versus-123 conflict therefore remains unresolved;
  do not invent a missing asset or claim full WordPress backup coverage.
- Metadata listed 588 size entries and 11 pre-scaled original filenames. Combined
  with the 123 source URLs and deduplicated, this is 595 unique asset URLs.
- The additional 472 unique files were downloaded into `media/continuity-files`,
  leaving the original-file archive intact. No failed downloads, no redirects,
  no credentials, only public GETs to kitchen3d.co.uk.
- Combined archive: 595 files, 78,981,056 bytes. Offline re-read verified every
  recorded size and SHA-256 after download.
- Combined manifest SHA-256:
  `780719b1bfcf12796c48fe6a6d49ba18c0e1a28900c05ae7d538623d6e9a9df0`.
- Receipt: `media/continuity-files/receipt-1789681835070.json`.

SVG files remain untrusted, unsanitized archival originals. Signature checks
are not malware scans, rights clearance or image authenticity checks. Metadata
does not enumerate every possible plugin-generated file, historic orphan,
database record or WordPress/theme asset. This is not a full site backup.

Both archive folders are outside `public` and excluded by the existing Vercel
upload allowlist. No old asset route or attachment redirect was activated and
no file was sent to Wix/Vercel. A deployment-safe preservation mechanism and
explicit attachment-page outcomes still need implementation and release testing.

## Reproducible local checks

```text
node scripts/check-asset-preservation.mjs
node scripts/check-archive-receipt.mjs receipt-1789681835070.json
npm run lint
npm run typecheck
git diff --check
```

All passed in this continuation. The original-file checker intentionally covers
only its 123-source-file inventory; derivative evidence comes from the separate
595-file receipt checker. Existing content-publication holds remain unchanged.

Recovery tool (not a build step):
`node scripts/archive-wordpress-variants.mjs --recover-public-variants`.
It performs bounded public GETs, refuses inventory/source drift, checks image
signatures, never overwrites existing files, and writes only local archive
artifacts. Rerunning contacts WordPress again; offline receipt verification does
not. No dependencies were installed or changed.

## Remaining critical path

### 18 September claim-gate update

The broad local claim scanner has been replaced by a hash-locked review of the
owner-confirmed wording. `CONTENT_SAFETY_STATUS=PASS` now means only that those
exact reviewed source files have not changed; publication remains review-required.
See `CONTENT_CLAIM_REVIEW_2026-09-18.md`. The media hold below is unchanged.

1. Finish existing URL outcomes, launch-safe asset delivery, removal/omission of
   internal review-only notes and unresolved portfolio sections; maintain the
   accepted design. New portfolio publication stays deferred.
2. The two customer enquiry forms are now saved in the exact-site dashboard;
   see `NATIVE_ENQUIRY_FORMS_2026-09-17.md`. Exact REST field bindings and
   site-isolated access remain unverified. Forms/Contacts connector hold remains.
   Existing email and Symphony/Orion app automations need an effects audit before
   any test submission. Native endpoints show Active; frontend stays disabled.
3. Implement and prove real admission/quota storage, spam protection, native
   receipt handling, private uploads/access/deletion and the 90-day unsuccessful
   enquiry policy from first receipt. Current helpers are disconnected; no live
   request or booking can be claimed from synthetic tests.
4. Controlled enquiry/notification and calendar conflict tests, including the
   confirmed 45-minute visits with 60-minute travel gaps. Do not reconnect Google.
5. Final source identity/release review, full WordPress/host backup and restore
   evidence, verified DNS/mail snapshot, launch indexing policy and rollback.
6. Separately authorised production deployment/DNS cutover, then live validation.

Production, DNS, credentials, source push, CMS content, customer submissions,
bookings and media publication were unchanged. The separately authorised native
form creation is recorded above. No unattended/background implementation has
been scheduled.
