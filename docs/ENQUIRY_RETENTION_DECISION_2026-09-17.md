# Enquiry retention decision

The director answered **90 DAYS** to the question: “For the later live enquiry
setup, how long should unsuccessful enquiries and their uploaded plans/photos
be kept before deletion?”

Applies to unsuccessful enquiries and associated uploaded plans/photos.
This records the business decision, not a deployed deletion policy. No existing
records were accessed or deleted; live collection remains disabled.

The director subsequently confirmed **from first receipt** as the starting point.
Do not restart the period when the enquiry is later marked unsuccessful.
Only enquiries classified unsuccessful are eligible under this rule. Active
enquiries and accepted projects must not be automatically deleted under it.
An enquiry marked unsuccessful after its 90-day deadline is already due at the
next authorised retention run; do not backdate a deletion or invent a receipt.

Implementation must still define and document the unsuccessful/closed status,
linked file cleanup, access checks,
failure handling and processor backup behavior before activation. The answer
does not establish a retention rule for accepted projects, contracts or invoices.
No broader retention period or marketing permission is inferred.

`src/lib/enquiries/retention.ts` is a pure local eligibility calculation using
the immutable first-receipt timestamp plus 90 24-hour days in UTC. It handles
no customer records and performs no deletion. Actual deployment requires a
verified storage/file association, access controls and deletion workflow.
