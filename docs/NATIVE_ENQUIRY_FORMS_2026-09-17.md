# Native enquiry form checkpoint — 17 September 2026

## Saved dashboard records

Exact Kitchen3D site: `543768f5-be18-4f7c-bb3b-380f4b05c925`.
Created and saved using only that site's dashboard, under explicit approval to
create unpublished, unshared forms whose native endpoint may be enabled.

| Journey | Saved name | Form ID |
| --- | --- | --- |
| installation | Kitchen3D — Installation Enquiry | `d1cd3c08-6d65-4000-9ef0-d65081a506fe` |
| complete | Kitchen3D — Complete Kitchen Enquiry | `0d5b3e9d-085a-4c62-90b1-07c4794382d8` |

Final dashboard list showed both as Website / Active / 0 submissions.
**Active is not disabled:** no assertion is made that their native submission
endpoints are inaccessible. No share link, site placement, publication, actual
submission, credential change or frontend connection was performed.
Forms/Contacts connector remains held; dashboard context does not prove
connector-wide isolation.

## Observed field setup

Each form has 16 input fields. Shared keys:

```text
k3d_services
k3d_trade_arrangement
k3d_project_files
k3d_visit_date
k3d_visit_time_preference
k3d_project_notes
k3d_contact_name
k3d_project_postcode
k3d_preferred_contact
k3d_project_address
k3d_contact_phone
k3d_contact_email
```

Installation-only keys: `k3d_supplier`, `k3d_removal`, `k3d_delivery_date`,
`k3d_install_start`. Complete-only keys: `k3d_planning_stage`, `k3d_style`,
`k3d_budget_guide`, `k3d_project_timing`.

Name, postcode, address and preferred contact are required. Installation supplier
and removal, and complete planning stage, are also required. Both saved forms
have conditional rules requiring phone for Phone preference and email for Email
preference. Other inputs are optional. Keys and choices were inspected in the
builder; this is UI evidence, **not** verification of REST field input types,
submission values, authenticated site scope or API acceptance.

Uploads are hidden, with Image/Document categories and a five-file native limit.
This is not private-file storage, malware/signature validation or deletion proof.
Do not expose them until the safe-upload workflow is established.

Installation native layout has Your enquiry and Before you send pages. Complete
native layout has one page; copied shared fields precede its four project fields.
These native layouts are not the accepted frontend four-step wizard, which is
unchanged. Native layout parity remains open if a native embedded form is used.

## Notices and confirmation

Both forms have the saved display notice:

> An enquiry is not a confirmed appointment. Work, materials, agreed additions
> and final price are subject to the agreed quotation and contract. Reza covers
> Greater Manchester. Free site visits can take up to 45 minutes; your preferred
> date is a request, not live availability.

Both confirmation settings were saved with Always display and:

> Your enquiry has been received. Reza will contact you to discuss the next step.
> Any preferred visit time is a request, not a confirmed appointment.

No receipt or notification delivery was tested. Existing Spam filter was Advanced
and reCAPTCHA; autofill, expiration and submission limits were off. No change to
those settings or Google Calendar was made.

## Automation observation — do not submit yet

Both settings pages displayed a native New submission received / Send an email
automation and Contact Form Lead Response / Trigger Orion Pulse. They were not
created, edited, enabled or disabled by this continuation. Recipient, activation
state, scope and external effects have not been independently verified. The
creation workflow may provision native defaults; do not interpret this report
as "notifications disabled". Audit these before any controlled submission.

Read-only follow-up opened Contact Form Lead Response. The editor identifies it
as an App automation, with a VIEW ONLY Wix Forms / Form submitted trigger and a
Symphony / Trigger Orion Pulse action. Trigger selection exposed no configuration;
the action panel exposed no recipient or endpoint settings. No View data, Test,
Apply or Publish Changes was used. It was closed with Cancel / Exit, unchanged.
The UI therefore does not establish its exact form scope or downstream effects.

## Local verification

After saving the forms and recording this checkpoint:

- `node scripts/check-enquiries.mjs`: 269 synthetic checks passed.
- `node scripts/check-wix-submission-adapter.mjs`: 79 synthetic checks passed.
- `node scripts/check-wix-transport.mjs`: 80 checks passed, real network zero.
- `git diff --check`: passed (existing CRLF conversion warnings only).

Their REMOTE_FORM_IDS=NONE output refers to disconnected runtime bindings and
offline templates, not the dashboard inventory. These tests do not prove live
delivery or the native form schemas. No dependencies or application rendering
were changed in this continuation.

`config/native-enquiry-form-evidence.mjs` now preserves the two dashboard IDs,
observed required fields and conditional contact rules as **evidence only**.
`npm run check:form-evidence` compares those observations to the local logical
target contract while asserting that runtime bindings are still null. It neither
reads Wix nor establishes REST schema, permission, site isolation or activation.

## Next technical gates

1. Obtain the saved form schemas through an independently site-isolated,
   authorised read path; validate all 16 targets, REST input types, enum values
   and conditional rules. Do not retry the held connector to obtain them.
2. Audit the existing notification/Orion automations before any submission test.
3. Keep `inactiveEnquiryBindings` null and `POST /api/enquiries` disabled until
   schema proof, server-only least-privilege authentication, CAPTCHA verification,
   shared durable admission/quota storage and reconciliation are implemented.
4. Implement private uploads and unsuccessful-enquiry deletion at 90 days from
   first receipt, with evidence and bounded failure handling.
5. Only then perform separately authorised controlled receipt/notification and
   calendar-conflict tests. No production or DNS cutover in this checkpoint.

The two form-creation tasks are complete; live enquiry integration is not.
