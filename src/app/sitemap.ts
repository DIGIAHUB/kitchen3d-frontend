import type { MetadataRoute } from "next";
import { revisedArticles } from "@/lib/articles";
import { releaseIndexingEnabled } from "@/lib/release-metadata";
import { prepareSitemapCandidates } from "@/lib/seo-preparation";
import { revisedServicePages } from "@/lib/service-pages";

// An empty sitemap is deliberate until the separately authorised indexing gate.
export default function sitemap(): MetadataRoute.Sitemap {
  if (!releaseIndexingEnabled()) return [];
  return prepareSitemapCandidates(revisedServicePages, revisedArticles);
}
