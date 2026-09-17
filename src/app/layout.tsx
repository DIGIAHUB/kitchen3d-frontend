import type { Metadata } from "next";
import "./globals.css";
import "./preview.css";
import { PreviewShell } from "@/components/preview/site-shell";

const preview = process.env.K3D_LOCAL_PREVIEW === "1";
export const metadata: Metadata = {
  title: { default: "Kitchen3D | A kitchen that feels like home", template: preview ? "%s | Kitchen3D preview" : "%s | Kitchen3D" },
  description: "Kitchen fitting and complete kitchen projects across Greater Manchester. Discuss your plans with Reza at Kitchen3D Ltd.",
  // Release/indexing remains a separate gate; neither local mode enables it.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en-GB"><body><PreviewShell preview={preview}>{children}</PreviewShell></body></html>;
}
