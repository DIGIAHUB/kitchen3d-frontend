# WordPress source recovery inspection

Status: authenticated inspection complete; export file receipt UNVERIFIED.

## Subsequent supplied-export recovery: verified

The user supplied `kitchen3dltd.WordPress.2026-09-17.xml`. SHA256:
`0059db1dde59fd063e25d7ec500f4bb0b27716c992b7dec5c40c9a75a0f144b3`.
The earlier download dependency below is now resolved.

All seven expected published article slugs have non-empty `content:encoded`
bodies. Twelve attachment records were excluded. The source XML was parsed with
DTD prohibited and no external resolver; no HTML or embedded scripts executed.
Only article identity/title/URL/body fields were extracted, not author contact
details, comments or plugin metadata.

Generated artifacts are outside the frontend at
`../recovery/wordpress-posts-0059db1dde59/`, with per-file SHA256 manifest and
`publicationAllowed=false`. Original source JSON files were not overwritten.
Use `scripts/recover-wordpress-posts.ps1 -ExportPath <path>` for reproducible
extraction into a new hash-named directory; an existing target is never overwritten.
Recovery is not content approval or HTML sanitisation. Next work remains safe
body conversion, claim reconciliation and local renderer verification.

The user made Kitchen3D WordPress and Hostinger sessions available for migration.
Only Kitchen3D WordPress was inspected. Hostinger settings were not accessed.
No source content, plugin, account, hosting, DNS or publication setting changed.
The first article editor was opened for inspection only and left without saving.

## Verified observations

- WordPress Posts lists seven total posts, all published.
- Published IDs observed: 4898 flooring, 4841 wardrobe, 4831 renovation,
  4802 Stockport, 4720 kitchen fitters, 4704 door fitting, 288 expert fitting.
- The saved expert-fitting JSON has ID 3500, but the current dashboard links to
  ID 288 for the same slug. Preserve the original record; reconcile by slug and
  source provenance rather than silently replacing the historical ID.
- The current logged-in public expert-fitting page showed its title, contact
  section and footer, but no article body in both accessibility and DOM views.
  Earlier indexed web text included a body. This discrepancy is unresolved;
  neither deletion nor a cause has been established.
- Native Tools > Export was scoped to Posts and Published, not All content.
  Download was requested in the in-app browser, then the existing Chrome session
  after the in-app browser offered no verifiable file. No export receipt or XML
  artifact was obtained. Do not claim recovery or backup completion.
- In-app tab content export is unsupported. Browser policy blocks access to the
  Chrome downloads page; no workaround was attempted after that policy result.

## Single owner dependency

Attach the published-post WordPress XML export from Tools > Export > Posts >
Status: Published > Download Export File. Keep it outside public website assets.
It can contain author metadata, comments and custom fields; inspect locally and
extract only required article content, never publish the raw export.

Next: verify XML identity and seven slugs, examine normal body and Elementor
content without executing HTML/scripts, hash and preserve recovery evidence,
then prepare safe reviewed content for the existing Next.js renderer. Do not
import into WordPress/Wix or restore/overwrite the original site.
