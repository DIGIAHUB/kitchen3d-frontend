import type { Metadata } from "next";
import "./globals.css";
import "./preview.css";
import { PreviewShell } from "@/components/preview/site-shell";
import { releaseIndexingEnabled } from "@/lib/release-metadata";
import { prepareOrganisationData, serializeStructuredData } from "@/lib/seo-preparation";

const preview = process.env.K3D_LOCAL_PREVIEW === "1";
export const metadata: Metadata = {
  title: { default: "Kitchen3D | A kitchen that feels like home", template: preview ? "%s | Kitchen3D preview" : "%s | Kitchen3D" },
  description: "Kitchen fitting and complete kitchen projects across Greater Manchester. Discuss your plans with Reza at Kitchen3D Ltd.",
  // Release/indexing remains a separate gate; neither local mode enables it.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = releaseIndexingEnabled() ? serializeStructuredData(prepareOrganisationData()) : null;
  return <html lang="en-GB"><body>{structuredData ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} /> : null}<PreviewShell preview={preview}>{children}</PreviewShell></body></html>;
}
