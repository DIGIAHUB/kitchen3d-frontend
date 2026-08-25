# Kitchen 3D — Next.js Headless Frontend

Vercel-hosted frontend for **kitchen3d.co.uk**, pulling live content from **Wix Headless CMS**.

## Architecture

```
WordPress (retired source)  →  Wix CMS (backend)  →  Next.js on Vercel (frontend)
```

- **Wix Site**: MetaSite ID `543768f5-be18-4f7c-bb3b-380f4b05c925`
- **CMS Collections**: `Kitchen3DPages` (18 items) · `Kitchen3DBlogPosts` (7 items)
- **Frontend**: Next.js 14 App Router, deployed on Vercel
- **Styling**: Tailwind CSS

## Environment Variables

Set these in Vercel project settings (Settings → Environment Variables):

| Variable | Description | Example |
|---|---|---|
| `WIX_SITE_ID` | Wix MetaSite ID | `543768f5-be18-4f7c-bb3b-380f4b05c925` |
| `WIX_API_KEY` | Wix API key (IST. token with Wix Data read access) | `IST.eyJl...` |

Copy `.env.local.example` to `.env.local` for local development and fill in `WIX_API_KEY`.

### Generating a Wix API Key

1. Go to [manage.wix.com/account/api-keys](https://manage.wix.com/account/api-keys)
2. Click **Generate API Key**
3. Name it: `kitchen3d-vercel-frontend`
4. Permission required: **Wix Data** → Read
5. Copy the generated token (starts with `IST.`) — it is only shown once
6. Add it as `WIX_API_KEY` in Vercel Environment Variables

## Wix CMS Collections

### `Kitchen3DPages`

Holds all 18 site pages. Fields:

| Field | Type | Description |
|---|---|---|
| `slug` | TEXT | URL slug (e.g. `kitchen-fitting-installation`) |
| `title` | TEXT | Page display title |
| `wpId` | NUMBER | Original WordPress page ID |
| `link` | TEXT | Original WordPress URL |
| `modified` | TEXT | Last modified date |
| `seoTitle` | TEXT | SEO title tag (Month-1 SEO deployment fills this) |
| `metaDescription` | TEXT | Meta description |
| `heroSubtitle` | TEXT | Hero section subtitle (service pages) |
| `bodyJson` | TEXT | JSON-encoded structured content |
| `note` | TEXT | Editor notes (not shown to visitors) |

### `Kitchen3DBlogPosts`

Holds all 7 blog posts. Fields:

| Field | Type | Description |
|---|---|---|
| `slug` | TEXT | URL slug (original WP slug preserved) |
| `title` | TEXT | Post title |
| `wpId` | NUMBER | Original WordPress post ID |
| `link` | TEXT | Original WordPress URL |
| `date` | TEXT | Published date (YYYY-MM-DD) |
| `modified` | TEXT | Last modified |
| `seoTitle` | TEXT | SEO title tag |
| `metaDescription` | TEXT | Meta description |
| `excerpt` | TEXT | Post excerpt/summary |
| `bodyJson` | TEXT | JSON-encoded body content |

## URL Structure

All slugs match the original WordPress URLs exactly (for SEO):

| Route | Maps to |
|---|---|
| `/` | Homepage (`home` page from Wix CMS) |
| `/[slug]` | Any of the 18 pages (e.g. `/kitchen-fitting-installation`) |
| `/[slug]` | Any of the 7 blog posts (e.g. `/flooring-installation-in-manchester-transform-your-home`) |
| `/blogs` | Blog index (lists all 7 posts) |

## Local Development

```bash
cp .env.local.example .env.local
# Fill in WIX_API_KEY in .env.local
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Deployment to Vercel

1. Connect this repo (`DIGIAHUB/kitchen3d-frontend`) to a Vercel project
2. Set `WIX_SITE_ID` and `WIX_API_KEY` in Vercel Environment Variables
3. Deploy — Vercel auto-detects Next.js

## SEO Notes

- All 18 page slugs and 7 blog post slugs match the original WordPress URLs exactly
- SEO titles and meta descriptions are populated from Wix CMS (`seoTitle`, `metaDescription` fields)
- Month-1 SEO deployment will fill in `seoTitle` and `metaDescription` in the CMS via the Wix API
- NAP (Name/Address/Phone) is identical across all pages per local SEO requirements

## Content Last Scraped

Scraped from kitchen3d.co.uk WordPress REST API: 24 August 2026.
