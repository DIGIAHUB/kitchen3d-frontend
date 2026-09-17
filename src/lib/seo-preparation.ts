import { SITE_ORIGIN, isCmsSlug, isHeldArticle } from "./migration-routes";

const corePaths = ["/", "/about", "/contact", "/services", "/faqs", "/blogs"] as const;
const excluded = new Set(["projects", "testimonials", "bedroom-furniture-installation-assembly", "thank-you"]);

// Inert preparation only: not imported by app/sitemap.ts, robots or a route.
// Inputs must be the reviewed editorial records, never an unfiltered CMS dump.
export function prepareSitemapCandidates(services: readonly {slug:string}[], articles: readonly {slug:string}[]) {
  const paths: string[] = [...corePaths];
  const seen = new Set(paths);
  for (const item of [...services, ...articles]) {
    if (!isCmsSlug(item.slug) || isHeldArticle(item.slug) || excluded.has(item.slug)) throw new Error("Unreviewed sitemap candidate");
    const path = `/${item.slug}`;
    if (seen.has(path)) throw new Error("Duplicate sitemap candidate");
    seen.add(path);
    paths.push(path);
  }
  return paths.map(path => ({url:SITE_ORIGIN + path}));
}

// No fabricated modification dates, ratings, author biographies or credentials.
// Useful for draft review; release must reconcile these with the indexable pages.
export function prepareOrganisationData() {
  return {
    "@context":"https://schema.org",
    "@type":"Organization",
    "@id":`${SITE_ORIGIN}/#organisation`,
    name:"Kitchen3D Ltd",
    url:SITE_ORIGIN + "/",
    telephone:"+447882116895",
    email:"kitchen3dltd@gmail.com",
    areaServed:{"@type":"AdministrativeArea",name:"Greater Manchester"},
  };
}

export function serializeStructuredData(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error("Structured data must be serializable");
  return serialized.replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
}
