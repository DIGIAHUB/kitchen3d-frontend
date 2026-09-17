# Release security preflight — 18 September 2026

## Source boundary

The deployable source/configuration allowlist was scanned for common API-key,
Google-key and GitHub-token patterns. Result:

```text
DEPLOYABLE_SOURCE_SECRET_SCAN=PASS
```

`WIX_SITE_ID` and `WIX_API_KEY` are referenced only in `src/lib/wix.ts`; neither
has a `NEXT_PUBLIC_` variant or client-side source reference. The CMS reader is
server-side and rejects a missing or non-Kitchen3D site ID.

The README no longer contains a historical API-key example. It now states that
the key must be supplied only as a server-side environment value and never
committed or displayed.

## Deployment boundary

`.vercelignore` is a deny-by-default allowlist. It permits only project
configuration, `src`, `config` and `public`; it excludes documentation,
archives, local build output, local environment files and Vercel state.

The local `.next-preview` and `.next-candidate` caches were not used as source
evidence or altered. Pattern matches inside dependency/build cache must not be
treated as a deployable credential finding because that material is excluded by
the Vercel allowlist. No cache was uploaded or deployed.

## Enquiry boundary

Local checks passed:

- `check-production-shell.mjs`: 36 render checks plus four offline CMS operations.
- `check-enquiry-request.mjs`: 147 checks; zero network/logs; endpoint disabled.
- `check-retention.mjs`: 25 checks; 90 days from first receipt, unsuccessful only.
- `check-wix-transport.mjs`: 80 checks; 52 intercepted attempts; zero real network.

`POST /api/enquiries` still has no request parsing, credential lookup, remote
write or activation flag. It returns fixed HTTP 503. This preflight does not
prove Wix credentials, protected staging runtime, native form schema acceptance,
receipt delivery, notification effects, upload safety or live bookings.

## Status

No environment, Vercel setting, deployment, source push, Wix record, form,
notification, calendar or DNS record was changed. This narrows the local source
exposure risk; it is not production-release authorisation.
