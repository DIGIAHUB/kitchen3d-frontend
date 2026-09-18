import type { Metadata } from "next";
import { EnquiryWizard } from "@/components/preview/enquiry-wizard";

export const metadata: Metadata = { title: "Your kitchen installation" };
export default function InstallationEnquiry() {
  return <EnquiryWizard journey="installation" live={process.env.K3D_LOCAL_PREVIEW !== "1"} />;
}
