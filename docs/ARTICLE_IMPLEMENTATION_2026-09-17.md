# Article implementation and editorial migration

Local candidate only. No deployment, DNS, remote CMS changes or publication.

## Director decisions implemented

- Wardrobe article held out pending correction: omitted from static generation,
  blog and related lists; direct route fails before a CMS read.
- Standalone design-only/3D offer removed from generated text-review-v2 drafts.
- Subsequent editorial authority used to rewrite six guides from confirmed
  business scope. Unsupported qualification, legal, guaranteed timing, property
  value and fixed-price promises were not carried forward. No new credentials,
  testimonials, projects or business capabilities invented.

## Implementation

`src/lib/articles.ts` contains six source-controlled editorial revisions with
distinct headings, descriptions and practical customer steps. Their old slugs
are preserved. Revisions override same-slug CMS posts; other CMS posts are merged
subject to route/hold filters. No Wix records were updated. Future dashboard
editing of these six requires deliberate removal/reconciliation of the overrides.
Dates are blank rather than inventing publication/update timestamps.

`article-body.ts` accepts bounded versioned text blocks only. Raw HTML, unknown
attributes and pending bodies are rejected. JSX escapes text. `approved` here
records editorial readiness under the director's delegated content authority;
it does not establish deployment or release permission. Recovered raw artifacts
remain separate and pending. Regex text extraction is for review, not a general
HTML sanitizer or proof of source-layout fidelity.

Article styles use the accepted palette and server rendering, guided by Next.js
and React skills. Customer next steps point back to the two accepted journeys.
No raw export, attachment record, comment or author metadata is imported into UI.

## Evidence

- Article parser/render tests: 44 PASS, including escaped HTML and hold behavior.
- Route checks: 76 PASS. Their old source-body warning applies to preserved
  metadata-only exports, not the six new editorial revisions.
- Shell: 16 PASS plus four offline CMS operations.
- CMS: 104 synthetic cases PASS. Transport: 80 checks PASS.
- Lint/type-check and optimized offline candidate build PASS.
- HTTP: six guides and blog index 200/noindex; held wardrobe URL 404.
- Browser: blog-to-article navigation, full body and next-step CTA verified;
  screenshot inspected, no console errors observed.
- Local candidate running at http://127.0.0.1:3101/; sample preview at 3100 was
  not rebuilt in this stage. Indexing and live enquiry collection remain held.

## Remaining work / real authorization boundary

Installed Next.js is 14.2.35 and React 18.3.1. The official support policy lists
14.x unsupported: https://nextjs.org/support-policy (checked this session).
Dependency/version/install/lockfile changes were explicitly prohibited earlier.
The content/SEO authority does not unambiguously revoke that specific freeze.
Obtain permission for a controlled local framework/dependency upgrade and
lockfile before proceeding with that modernization; no production upgrade is
implied. This is not a claim that a vulnerability scan has been completed.

Retained service pages, schema/sitemap, mobile article verification, privacy and
upload handling, live forms/storage/CAPTCHA, production configuration and staging
still require completion. Full migration is not complete. No background task is
scheduled. Preserve the original WordPress export and recovery hash manifest.
