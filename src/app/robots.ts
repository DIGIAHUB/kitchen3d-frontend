import type { MetadataRoute } from "next";
import { releaseIndexingEnabled } from "@/lib/release-metadata";

// Pre-launch safeguard, not access control. Only an exact server-side release
// gate can allow crawling; preview/candidate modes remain disallowed.
export default function robots(): MetadataRoute.Robots {
  if (!releaseIndexingEnabled()) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://kitchen3d.co.uk/sitemap.xml" };
}
