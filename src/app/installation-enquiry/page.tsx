import type { Metadata } from "next";
import { EnquiryWizard } from "@/components/preview/enquiry-wizard";
import { EnquiryUnavailable } from "@/components/enquiry-unavailable";

export const metadata: Metadata = { title: "Your kitchen installation", robots: { index: false, follow: false } };
export default function InstallationEnquiry() {
  return process.env.K3D_LOCAL_PREVIEW === "1"
    ? <EnquiryWizard journey="installation" />
    : <EnquiryUnavailable journey="installation" />;
}
