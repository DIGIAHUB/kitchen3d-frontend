# Public-claim review — 18 September 2026

## Outcome

The local public-source checker now passes for the exact Kitchen3D business,
service, contact, geographic and visit wording already confirmed in the owner
brief. This removes the prior false hold that treated every mention of Kitchen3D,
Greater Manchester or a confirmed service as unverified.

It is a **review-required** pass, not release approval, indexing activation or
evidence for new claims.

## Control used

`config/approved-public-claims.mjs` pins the SHA-256 of each reviewed source
file and only permits these four scanner categories when the corresponding file
is byte-for-byte unchanged:

- Kitchen3D identity/contact facts;
- Greater Manchester coverage;
- the confirmed no-obligation/free-quote wording;
- direct and coordinated service scope.

The exact supplier-choice configuration is also pinned, solely as an input
selector: it does not establish a supplier partnership or endorsement.

Any source edit changes its hash and causes the claim scanner to hold the file
again. Ratings, testimonials, credentials, insurance, years of experience,
supplier partnerships, addresses and new portfolio/media claims remain outside
this approval and continue to be rejected when detected.

Evidence is limited to the confirmed brief recorded in:

- `SERVICE_CONTENT_COVERAGE_2026-09-05.md`
- `ENQUIRY_INTEGRATION_STAGE_2_HANDOVER_2026-09-05.md`
- `NATIVE_ENQUIRY_FORMS_2026-09-17.md`

## Verification

`node scripts/check-content.mjs` reported:

```text
PUBLIC_SOURCE_FILES_SCANNED=36
HASH_LOCKED_OWNER_CLAIMS=130
CONTENT_SAFETY_STATUS=PASS
PUBLICATION_STATUS=REVIEW_REQUIRED
ERRORS=0
```

`npm run validate:local` also passed lint, TypeScript, structural inventory and
the revised content check. Inventory intentionally still reports publication
HOLD for media: 80 assets lack alt text, 11 require name review, five records
have descriptive-field differences, and the original inventory has a 123/124
count conflict. This continuation did not publish, alter or clear media.

## Launch consequence

Claim wording is no longer the local content blocker. Media outcomes, secure
live enquiry delivery, protected release-candidate validation, source identity,
backup/rollback evidence and separately authorised DNS cutover still remain.
No production, staging, Wix CMS, Forms/Contacts, notification, calendar, media
or DNS setting was changed.
