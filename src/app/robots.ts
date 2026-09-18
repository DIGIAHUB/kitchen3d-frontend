import type { MetadataRoute } from "next";
import { releaseIndexingEnabled } from "@/lib/release-metadata";

// Preview and candidate deployments remain unavailable to crawlers. The public
// production deployment exposes its sitemap for normal discovery.
export default function robots(): MetadataRoute.Robots {
  if (!releaseIndexingEnabled()) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://kitchen3d.co.uk/sitemap.xml" };
}
