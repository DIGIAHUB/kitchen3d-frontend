# Authorised local framework upgrade

Scope: local framework/dependency installation and lockfile only, plus required
compatibility changes. No deployment, DNS, push, remote CMS write or customer
submission. Accepted UI and both four-step journeys preserved.

## Implementation

- Next.js 14.2.35 to intermediate 15.5.25, then target 16.3.5; React 19.3.0.
- Official async-request codemod changed the dynamic route to await params.
- New flat ESLint configuration; TypeScript configuration updated by Next.js.
- React date snapshot uses useSyncExternalStore, with an empty server snapshot
  and minute refresh. No extra enquiry field or live scheduling introduced.
- Exact package versions and package-lock.json; installs used ignore-scripts.
- Historical pages directory moved to data/source-pages. All 18 file hashes
  matched before/after. Inventory and route checks now read the new location.
- Selected pre-upgrade files backed up in ../recovery/framework-upgrade-ba1cf15c1c3c447fa453d090574483d6.
  This is not a whole-repository backup. Existing dirty work was preserved.

## Verification

- Intermediate 15 build failed on generated route paths; clean build reproduced
  it. Version 16 identified the conflicting root pages/source app directories.
  Moving immutable exports resolved it; no type checking bypass was used.
- Final optimized candidate and sample-preview builds: PASS.
- Lint and standalone typecheck: PASS. npm ls --depth=0: no peer errors.
- npm audit: zero known vulnerabilities at this checkpoint, not a security guarantee.
- 931 numbered synthetic/parser/route/render checks PASS, plus preview checks,
  four offline CMS operations and inventory structural checks.
- Original content gate remains FAIL/HOLD (74 findings), including claims since
  confirmed by the owner. It was not weakened to manufacture a green release.
- Browser: candidate article and home rendered; sample journey advanced to step
  two after hydration. No errors on the fresh sample tab. Candidate log retained
  pre-upgrade fetch failures while its old server was stopped; these are not new
  target-version failures. Full live journeys remain untested and disabled.

## Exception and remaining gates

ESLint 9.39.5 is registry-deprecated/unsupported but remains compatible with the
installed React/JSX lint plugins; their peers do not accept ESLint 10. Do not force
incompatible peers or claim that every development dependency is supported.
Review that tooling exception before release. No production credentials or real
Wix/Google/Hostinger changes were used. Framework completion does not establish
content, privacy, integration, staging or cutover readiness.

Official upgrade references checked during implementation:
https://nextjs.org/docs/app/guides/upgrading/version-15
https://nextjs.org/docs/app/guides/upgrading/version-16
