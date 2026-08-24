# Kitchen3D Frontend

WordPress site content scraped from kitchen3d.co.uk and structured for Vercel frontend deployment.

## Architecture

This is a **headless setup**:
- **Backend / CMS**: Wix (MetaSite ID: `543768f5-be18-4f7c-bb3b-380f4b05c925`)
- **Frontend**: Served from Vercel (this repo)
- **Source site**: kitchen3d.co.uk (WordPress)

DNS is NOT changed as part of this repo. The frontend will be deployed to Vercel and DNS pointed once the build is approved.

## Repo Structure

```
/pages/          One JSON file per WordPress page (slug-named)
/posts/          One JSON file per blog post (slug-named)
/media/          media-index.json — full media library catalogue with source URLs
/data/           Raw REST API responses (pages-raw.json, posts-raw.json, media-raw.json)
README.md        This file
```

## Site Inventory

### Pages (18)

| Slug | Title | URL |
|------|-------|-----|
| home | Home | https://kitchen3d.co.uk/ |
| services | Services | https://kitchen3d.co.uk/services/ |
| about | About | https://kitchen3d.co.uk/about/ |
| contact | Contact | https://kitchen3d.co.uk/contact/ |
| projects | Projects | https://kitchen3d.co.uk/projects/ |
| testimonials | Testimonials | https://kitchen3d.co.uk/testimonials/ |
| faqs | FAQ's | https://kitchen3d.co.uk/faqs/ |
| blogs | Blogs | https://kitchen3d.co.uk/blogs/ |
| kitchen-fitting-installation | Kitchen Fitting & Installation | https://kitchen3d.co.uk/kitchen-fitting-installation/ |
| worktop-installation | Worktop Installation | https://kitchen3d.co.uk/worktop-installation/ |
| sink-hob-fitting | Sink & Hob Fitting | https://kitchen3d.co.uk/sink-hob-fitting/ |
| door-fitting | Door Fitting | https://kitchen3d.co.uk/door-fitting/ |
| flooring-installation | Flooring Installation | https://kitchen3d.co.uk/flooring-installation/ |
| bedroom-furniture-installation-assembly | Bedroom Furniture Installation & Assembly | https://kitchen3d.co.uk/bedroom-furniture-installation-assembly/ |
| wall-floor-tiling | Wall & Floor Tiling | https://kitchen3d.co.uk/wall-floor-tiling/ |
| plumbing-works | Plumbing Works | https://kitchen3d.co.uk/plumbing-works/ |
| electrical-works | Electrical Works | https://kitchen3d.co.uk/electrical-works/ |
| thank-you | Thank You | https://kitchen3d.co.uk/thank-you/ |

### Blog Posts (7)

| Slug | Title | Date |
|------|-------|------|
| flooring-installation-in-manchester-transform-your-home | Flooring Installation in Manchester: Transform Your Home from the Ground Up | 2026-03-20 |
| thinking-about-wardrobe-installation-in-manchester | Thinking About Wardrobe Installation in Manchester? Here's What You Should Know | 2026-03-16 |
| ready-to-transform-your-space-with-kitchen-renovation-in-manchester | Ready to Transform Your Space with a Kitchen Renovation in Manchester? | 2026-03-11 |
| kitchen-installation-in-stockport-create-the-heart-of-your-home-with-confidence | Kitchen Installation in Stockport: Create the Heart of Your Home with Confidence | 2026-02-25 |
| kitchen-fitters-in-manchester-everything-you-need-to-know | Kitchen Fitters in Manchester: Everything You Need to Know Before Installing Your Dream Kitchen | 2026-02-23 |
| door-fitting-in-manchester-doors-be-damaging-your-home | Door Fitting in Manchester: Could Your Doors Be Damaging Your Home Without You Realising? | 2026-02-19 |
| expert-kitchen-fitting-installation-services | Expert Kitchen Fitting & Installation Services | 2025-12-02 |

### Media Library

124 items. All source URLs catalogued in `/media/media-index.json`. Full downloads available via the `source_url` field in each entry.

## Business NAP (critical for local SEO — must be identical everywhere)

- **Name**: Kitchen 3D Limited
- **Address**: 43 Manley Road, Manchester, England, M16 8HN
- **Phone**: 07882116895
- **Email**: kitchen3dltd@gmail.com
- **WhatsApp**: 07882116895

## Wix CMS Connection

- **MetaSite ID**: `543768f5-be18-4f7c-bb3b-380f4b05c925`
- **Current Wix staging URL**: https://h6s-c56c1d0cdc998e-hubcms.wix-site-host.com/
- **Target domain**: kitchen3d.co.uk

## Next Steps for Vercel Deployment

1. Connect this repo to a new Vercel project
2. Choose your frontend framework (Next.js recommended for Wix headless)
3. Configure Wix Headless SDK with the MetaSite ID above
4. Build page routes matching slugs in `/pages/` (preserve exact slugs for SEO)
5. Deploy preview build and review all 25 content items
6. Point DNS to Vercel once approved (A record and CNAME — see migration blueprint)
7. **Do NOT change DNS until Vercel build is verified end-to-end**

## SEO Notes

- All slugs must be preserved exactly as listed above — existing Google index entries depend on them
- No SEO title/meta descriptions are set on the current WordPress pages (Yoast fields are empty); these will be applied during Month-1 SEO deployment
- 109 Google reviews on Google Business Profile — preserve NAP consistency
- Blog posts currently live at root path (e.g. /flooring-installation-in-manchester-...), not under /blog/; preserve this or add 301 redirects

## Content Flags

The following placeholder/template content exists in the current WordPress site and should be corrected during rebuild:
- **About page**: lorem ipsum text, fake team member "Lenny Jhonson — CEO HUNIART", stat counters showing 0
- **Services page**: stray "WELCOME TO HUNIART" heading
- **Multiple pages**: `elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-mobile` elements are hidden theme artifacts — safe to omit

## Scraped

Scraped: 2026-08-24 via WordPress REST API (public endpoints only). No WordPress login was used.
