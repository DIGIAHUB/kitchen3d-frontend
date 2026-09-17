# Protected staging preflight — awaiting key entry

Historical preflight: the credential blocker was subsequently cleared by user
entry and the first protected Preview deployment is READY. See
[verified staging result](PROTECTED_STAGING_RESULT_2026-09-17.md).

## Authority received in this continuation

The director approved protected non-production Vercel staging only, then
branch-scoped copying of the two existing Wix configuration variables, then
creation of the remote `codex/k3d-owner-preview` branch at exactly the original
recovery commit. No new local source push, production promotion, DNS, live
enquiry/booking, Forms/Contacts access or media publication was authorised.

## Verified

- Existing project `prj_LQVeZOIeNzDGaH53EfXq3MTb2AJl` in team
  `team_YgnXDewd0KfQCFzxN1TDIsjw` is Next.js, Node 24.x. No custom build,
  install, output-directory or root-directory override was returned.
- Dashboard: Require Log In enabled, Standard Protection, no displayed domain
  exceptions, no automation bypass secrets, no Preview custom domains.
  REST returned `ssoProtection.deploymentType=all_except_custom_domains`.
  A future deployment must still pass an unauthenticated access check before
  being called effectively protected; no staging runtime exists yet.
- CLI 59.20.0 authenticated as hello-26951171. Installed into npm's tool cache,
  not package.json or the project lockfile. Its dependency deprecation warnings
  are separate from the application's zero-known-vulnerability audit.
- GitHub branch created and `git ls-remote` verified:
  `1d66d0f5b924c00d05d47acf449771eac5fb4743 refs/heads/codex/k3d-owner-preview`.
  Local HEAD/dirty work were not pushed. Branch tracking may trigger platform
  activity; the immediate deployment-list check returned no new deployment.
- `WIX_SITE_ID` added as encrypted config to Preview, branch
  `codex/k3d-owner-preview`, with the known exact Kitchen3D ID.
  Metadata reread confirms this scope. Both original Production variables
  remain Production-only, sensitive/write-only and unchanged.
- `.vercel/project.json` links only this existing project and is Git-ignored.
  `.vercelignore` restricts uploads to source/config/public review assets and
  exact build manifests. Dry-run: 52 files, 2,005,412 bytes. Excludes all `.env`
  examples, raw exports, audit documents, scripts, Git, node_modules and builds.
  Sorted path/size/file-SHA manifest SHA256:
  `AD3278A117F40918910F419E28081971C05F50D1D4669C9B6D802D68400FC94E`.
  Regenerate and compare before upload if source changes.

## Actual blocker

`WIX_API_KEY` exists only as a saved write-only Production Secret. The supported
dashboard disables copy/reveal and scope editing; no key value was retrieved,
displayed, placed in a file or committed. The Production editor was cancelled.
The approval to copy cannot make that stored value recoverable.

The director must enter the original Kitchen3D key directly in the prepared
Vercel dialog (or supply an appropriately scoped replacement through Vercel).
The draft form has key WIX_API_KEY, type Secret, and only the exact preview
branch selected. The default all-Preview selection was explicitly unchecked.
Value is blank, Save has not been pressed, and the tab is left for user entry.
Do not ask for the key in chat. A new/replacement Wix credential is not created
under this preflight; any needed permission change requires its own authority.

An initial site-variable attempt was rejected because the remote branch did
not exist. After the explicit branch-creation approval and readback, the single
successful site-variable creation was verified. No broad Preview fallback was
used, and no Production scope was expanded.

## Resume after user confirms Save

1. Read only variable metadata to verify the exact key/branch/Preview scope;
   verify protection still applies and local preview flags are absent remotely.
2. Revalidate upload allowlist and current branch. Deploy explicitly to Preview
   using the linked existing project; no --prod, push, promotion or DNS change.
3. Inspect only this deployment's status and, if required, bounded build errors.
   Remote normal-mode build uses CMS reads; Forms/Contacts remain held.
4. Verify unauthenticated denial separately from authorised browser rendering,
   noindex, retained routes/redirects and disabled customer collection. Do not
   create bypass links, broaden access or submit live customer data.
5. Record exact deployment ID/source manifest and results. Local tests and
   protection configuration are not substitutes for this staging verification.

References: [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
and [environment creation API](https://vercel.com/docs/rest-api/projects/create-one-or-more-environment-variables).
