import type { MetadataRoute } from "next";

// Pre-launch safeguard, not access control. Change only with the release gate.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
