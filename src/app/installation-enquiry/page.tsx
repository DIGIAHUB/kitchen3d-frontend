import type { Metadata } from "next";
import { EnquiryWizard } from "@/components/preview/enquiry-wizard";

export const metadata: Metadata = { title: "Your kitchen installation", robots: { index: false, follow: false } };
export default function InstallationEnquiry() {
  return <EnquiryWizard journey="installation" live={process.env.K3D_LOCAL_PREVIEW !== "1"} />;
}
