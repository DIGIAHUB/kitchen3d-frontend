# CMS and URL migration: first implementation checkpoint

Local only; no deployment, DNS, dashboard, CMS write or publication.

## Implemented and verified

- `src/lib/migration-routes.ts` owns safe single-segment CMS slugs, static-route
  exclusions, collision detection and fixed-origin canonical metadata.
- The dynamic route rejects invalid/reserved slugs before querying Wix, checks
  page/post collisions rather than silently choosing one, and uses CMS SEO title
  and description when valid. Missing values retain safe title fallback.
- Noindex/nofollow remains explicit. Canonicals are preparation only, not proof
  of release approval, claim accuracy or crawl readiness.
- 75 new checks passed against all 18 page and 7 post source records. Two static
  paths (home and blogs) are excluded, leaving 23 potential dynamic paths.
- Existing CMS regression: 104 synthetic cases passed with no network access.
- Lint, type-check and diff whitespace checks passed. No new optimized build or
  browser verification was run for this metadata-only checkpoint; running local
  preview servers still use the preceding built checkpoint.

## Content gaps found

All seven saved post JSON files contain metadata only: no body, content or
bodyJson. The legacy renderer displays an excerpt and old-site link rather than
article text. It must not be described as a completed article migration.

A read-only public lookup located the full first article at:
https://kitchen3d.co.uk/expert-kitchen-fitting-installation-services/
This is a recovery lead, not content imported or approved for publication. It
contains historical claims and contact details that require reconciliation with
the accepted owner direction. No source export was changed.

The preliminary URL map remains unchanged: no redirects, consolidation or
retirement decisions were silently activated. The next implementation work is
read-only recovery of retained article text into separate review artifacts,
typed safe body rendering, and mapping content gaps/claims before live inclusion.
Follow with shared page styling, route tests, sitemap and full candidate build.

Dashboard, new portfolio updates and live activation remain deferred. No user
action is currently required for read-only public article recovery.
