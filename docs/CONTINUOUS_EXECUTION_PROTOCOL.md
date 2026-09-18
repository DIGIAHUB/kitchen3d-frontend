# Kitchen3D continuous execution protocol

## Default operating rule

Continue through the next authorised technical task without turning ordinary
checkpoints into reports, handoffs or pauses. A completed build, test, Preview
deployment, route check or dashboard inspection is evidence for choosing the
next safe task, not a reason to stop.

## Execution loop

1. Inspect the current state and preserve user-owned files and existing
   Production settings.
2. Perform the next safe, authorised implementation, verification or repair.
3. If it succeeds, immediately continue to the next item in the release path.
4. If it fails, diagnose and apply the safest in-scope repair before reporting.
5. Verify the repair and continue.

## Communication rule

Do not ask for routine approval after an already authorised action. Send a
short progress update only while work is running. End a work cycle only when
the authorised technical work is complete or an owner-only hard gate is real.

## Owner-only hard gates

Pause only when one of these is required:

- entering, creating or recovering a secret that is unavailable to the agent;
- accepting a contract, payment, legal consent or third-party account terms;
- publishing to Production, changing DNS, releasing public content, enabling
  customer enquiry collection or booking, or changing a live service;
- an irreversible action whose exact target cannot be verified.

At a hard gate, prepare the exact screen and fields where possible, state one
plain-language action for the owner, then resume immediately after confirmation.

## Kitchen3D release guardrails

- Keep `codex/k3d-owner-preview` scoped to protected Preview until a separate
  Production release instruction is given.
- Never substitute a Forms credential for the CMS `WIX_API_KEY`.
- Keep online enquiries, uploads and booking disabled until their separately
  reviewed live implementation is approved.
- Do not deploy, merge, alter DNS or publish media merely because a local or
  Preview check passes.
