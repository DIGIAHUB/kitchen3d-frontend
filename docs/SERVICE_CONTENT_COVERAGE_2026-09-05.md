# Kitchen3D service content coverage

Date: 5 September 2026.
Status: **LOCAL FRONTEND CONTENT PASS — NOT PUBLISHED**.

## Finding

Reza's plumbing and plastering services have not been dropped. The homepage's
existing **Coordinate the specialists** group and trade-coordination FAQ now
explicitly describe plumbing, electrical work, gas work, tiling and plastering
as coordinated services. **Fit & finish** now includes appliance installation,
with specialist connections coordinated as part of the agreed work.

The companion enquiry change adds appliance installation and five individually
labelled coordination choices to the existing service checkbox question in both
journeys. It retains **Specialist trades** and **Help me decide**, without adding
questions. Root-level technical checks cover the wizard, shared options, staged
validation and offline native-form draft together; this document is not a claim
that any live Wix schema has changed.

Carpentry remains represented narrowly by internal wooden doors, not by a broad
carpentry promise. The accepted three-group service layout, two journeys and
images remain intact. No dedicated service-detail pages are introduced.

The homepage hero and coverage FAQ now say **Greater Manchester**, including
Altrincham, Oldham, Bolton and Bury as non-exhaustive examples. This follows the
later explicit conversation instruction confirming all Greater Manchester.
Cheshire appeared in the historical owner audit but is not carried into this
current frontend coverage promise. The original audit remains unchanged.

**Plastering is confirmed. Plasterboard installation/drylining is not separately
confirmed by the source records.** Do not silently change the approved service
label to plasterboard or infer a complete drylining service from plastering.

## Evidence and scope

This content pass uses the following existing local files; it does not re-query
the owner's submission, inspect customer records or audit the live website:

- [Owner submission audit](../../docs/K3D_OWNER_SUBMISSION_AUDIT_2026-09-05.md),
  particularly Direct work, Coordinated work, Wider service selections and
  Customer journeys. Its later-superseded direction/materials/visit questions are
  not reopened here.
- [Confirmed direction and execution brief](../../docs/K3D_CONFIRMED_DIRECTION_AND_EXECUTION_BRIEF_2026-09-05.md),
  which records implementation direction, materials/agreed additional items and
  the up-to-45-minute free initial visit clarification.
- [Accepted preview handover](LOCAL_PREVIEW_HANDOVER.md).
- [Preview homepage source](../src/components/preview/home.tsx), sections
  `#your-kitchen`, `#services`, `#approach` and the FAQ.
- [Shared enquiry wizard source](../src/components/preview/enquiry-wizard.tsx),
  used by both local journey routes.

The coverage below concerns the accepted new preview only. Inherited CMS/service
pages are a separate migration and public-claim review; their presence is not proof
that their old claims are approved for the new website. This pass changes local
homepage copy and documents the coordinated enquiry-option work. It makes no
navigation, remote form-schema or other remote change. Internal Wix dashboard
setup is user-managed and deferred, not a blocker to frontend work.

## Approved service coverage

The 13 category selections are interpreted alongside Reza's more specific
direct-versus-coordinated narrative, not as permission to claim every trade is
performed in-house.

| Owner-selected category | Current homepage coverage | Current journey coverage | Remaining content detail |
|---|---|---|---|
| Full kitchen installation | Complete-project path; Fit & finish; complete-project FAQ | Complete journey; Cabinets & fitting | Covered at overview level; keep the agreed-scope qualification nearby. |
| Installation only | I've bought my kitchen path; installation FAQ | Dedicated installation journey | Covered; supplier choice does not imply an installer partnership. |
| Kitchen design/planning | Design guidance tag; ideas, measuring and agreed project approach | Planning stage, style, budget guide, optional plans/inspiration | Covered as guidance and planning; do not imply architectural or technical certification. |
| Kitchen supply | Supply tag; materials in complete-project FAQ | Complete-journey review explains materials and agreed additional items | Covered; avoid an unconditional all-materials/all-extras statement. |
| Worktops | Explicitly named in Fit & finish and FAQ | Individual Worktops choice | Covered at overview level; no unsupported material/brand/range claims. |
| Plumbing | Explicitly described as coordinated work in service group and FAQ | Individual Plumbing coordination choice in the companion enquiry pass | Keep responsibilities and included work subject to agreement. |
| Electrical work | Explicitly described as coordinated electrical work in service group and FAQ | Individual Electrical-work coordination choice in the companion enquiry pass | No Kitchen3D accreditation assertion. |
| Tiling | Explicitly described as coordinated work in service group and FAQ | Individual Tiling coordination choice in the companion enquiry pass | No unsupported material, range or specialist-credential promise. |
| Flooring | Explicitly named in Fit & finish and FAQ | Individual Flooring choice | Covered at overview level; no unsupported flooring-type/range promises. |
| Plastering | Explicitly described as coordinated work in service group and FAQ | Individual Plastering coordination choice in the companion enquiry pass | Plasterboard/drylining remains distinct and unconfirmed. |
| Carpentry | Internal wooden doors explicitly named | Individual Internal wooden doors choice | Narrow, evidence-backed coverage. Broader bespoke joinery/carpentry scope is not established. |
| Appliance installation | Explicitly included in Fit & finish and trade-coordination FAQ | Individual Appliance installation choice in the companion enquiry pass | Specialist connections are coordinated as appropriate; not a promise of direct gas/electrical work. |
| Renovation/project coordination | Complete-project path, specialist coordination and agreed-work approach | Both journeys collect work required and trade arrangements | Covered within kitchen projects; not a general structural renovation or building-extension promise. |

Two additional activities are explicit in the narrative, even though they are
not separate entries in the 13-category selection list:

- **Existing kitchen removal:** directly offered; already present in Remove &
  prepare, the service choices and the installation removal question.
- **Gas work:** coordinated with specialists; present in the homepage and
  journey hints, with an individual Gas-work coordination choice in the companion
  enquiry pass. This is not evidence that Kitchen3D itself is Gas Safe registered.

## Optional longer service-copy reference

These longer UK-English drafts remain a reference, not a verbatim record of the
rendered homepage. The applied homepage keeps the existing compact three-group
layout instead of adding a long service list. The drafts do not establish separate
service commitments or credentials and do not require 13 new pages.

| Service label | Draft description |
|---|---|
| Complete kitchen projects | From initial ideas and measuring to supply and installation, we help bring your kitchen project together. The work, materials, agreed additional items and final price are set out in your agreed quotation and contract. |
| Kitchen installation | Already chosen your kitchen? Share your supplier, plans and delivery date so Reza can discuss the fitting and any additional work your project needs. |
| Design and planning guidance | Talk through your layout, style, needs and budget with Reza, and explore the next steps for your kitchen. |
| Kitchen supply | Kitchen3D supplies the materials and agreed additional items included in your complete kitchen project. Inclusions and final price are agreed by both parties before work proceeds. |
| Worktops | Include worktop fitting in your kitchen plans. Reza will discuss the work required and what is included in your quotation. |
| Plumbing coordination | Plumbing work can be coordinated with the specialists needed for your kitchen project. The responsibilities and included work are agreed before work proceeds. |
| Electrical-work coordination | Where your kitchen project needs electrical work, we coordinate it with specialists and agree the responsibilities and scope with you. |
| Tiling coordination | Tiling can be coordinated as part of your kitchen project, with the required work and inclusions set out in the agreed scope. |
| Flooring | Flooring can form part of the agreed work for your kitchen project. Share what you have in mind so Reza can discuss the requirements. |
| Plastering coordination | Where your kitchen project needs plastering, we coordinate the work with specialists as part of the agreed project scope. |
| Internal wooden doors | Internal wooden-door work can be included alongside your kitchen project. Reza will discuss the requirements and agree the scope with you. |
| Appliance installation | Tell Reza which appliances need installing as part of your kitchen project. The quotation will set out the work and any specialist trade coordination required. |
| Kitchen-project coordination | We help bring the work and specialist trades together around your agreed kitchen project, with the responsibilities, inclusions and final price made clear before work proceeds. |
| Existing kitchen removal | Need your existing kitchen removed? Include this in your enquiry so removal can be considered in the agreed work. |
| Gas-work coordination | Any gas work needed for your kitchen project is coordinated with specialists, with responsibilities and scope agreed for the project. |

Suggested shared qualification, where space permits:

> Kitchen fitting, removal, worktops, flooring and internal wooden doors are part
> of Kitchen3D's direct service offering. Plumbing, electrical work, gas work,
> tiling and plastering are coordinated with specialists where required. All
> work, materials and agreed additional items are subject to your agreed project
> scope, quotation, contract and final price.

Do not attach registration badges, insurance claims, guarantees, supplier logos
or numeric experience claims to these descriptions without their specific
evidence checks. A mention of a requested service is not a fixed-price offer or
a promise that every project includes it.

## Applied scope and verification handoff

The homepage change is limited to:

1. Replacing the hero's broad surrounding-area wording with Across Greater Manchester.
2. Replacing the area FAQ with all Greater Manchester and four non-exhaustive examples.
3. Adding appliance installation and the specialist-connection qualification to Fit & finish.
4. Clarifying the five coordinated trades in the existing specialist group and FAQ.

The companion wizard pass extends the existing optional **What would you like
help with?** multi-selection; it does not add questions. UI selection values,
staged validation, offline Wix targets/allowed values and synthetic tests must
agree. The four-step, 16-field journeys and no-live-submission state are preserved.
Full combined lint, type-check and browser verification are recorded by the main
frontend pass rather than inferred from this copy-only change.

No broad re-approval of Reza's business identity or already confirmed services is
needed. Only seek a targeted clarification if we intend to advertise plasterboard/
drylining, broader carpentry, structural extensions or another unconfirmed scope.
Those unresolved additions do not block integrating the approved services.
