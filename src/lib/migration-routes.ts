import type { Metadata } from "next";

// Fixed project origin: never derive canonicals from request headers or CMS links.
export const SITE_ORIGIN = "https://kitchen3d.co.uk";
const RESERVED = new Set(["home", "blogs", "services", "about", "contact", "faqs", "thank-you", "installation-enquiry", "plan-your-kitchen", "api", "_next"]);
// Owner-directed launch hold: source body is unrelated kitchen-renovation copy.
export function isHeldArticle(slug: string): boolean {
  return slug === "thinking-about-wardrobe-installation-in-manchester";
}

// No fabricated replacements for unconfirmed capability, template reviews or
// portfolio evidence deferred by the director. Sources remain preserved.
export function isHeldPage(slug: string): boolean {
  return ["bedroom-furniture-installation-assembly", "testimonials", "projects"].includes(slug);
}

export function isCmsSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 180 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && !RESERVED.has(value);
}

export function migrationParams(pages: { slug: string }[], posts: { slug: string }[]) {
  const seen = new Set<string>();
  const result: { slug: string }[] = [];
  for (const item of [...pages, ...posts]) {
    // Explicit static routes own these paths, not the catch-all CMS renderer.
    if (RESERVED.has(item.slug) || isHeldArticle(item.slug) || isHeldPage(item.slug)) continue;
    if (!isCmsSlug(item.slug)) throw new Error("Invalid CMS migration slug");
    if (seen.has(item.slug)) throw new Error("Conflicting CMS migration slug");
    seen.add(item.slug);
    result.push({ slug: item.slug });
  }
  return result;
}

function plainMetadata(value: unknown, maximum: number): string | undefined {
  if (typeof value !== "string" || /[<>\u0000-\u001f\u007f]/.test(value)) return undefined;
  const text = value.trim().replace(/\s+/g, " ");
  return text && text.length <= maximum ? text : undefined;
}

export function cmsMetadata(item: { slug: string; title: string; seoTitle?: string; metaDescription?: string }): Metadata {
  if (!isCmsSlug(item.slug)) return { robots: { index: false, follow: false } };
  const title = plainMetadata(item.seoTitle, 200) ?? plainMetadata(item.title, 200) ?? "Kitchen3D";
  const description = plainMetadata(item.metaDescription, 500);
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: `${SITE_ORIGIN}/${item.slug}` },
    // Metadata preparation does not authorize indexing or clear content claims.
    robots: { index: false, follow: false },
  };
}
