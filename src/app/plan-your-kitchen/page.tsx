import type { Metadata } from "next";
import { EnquiryWizard } from "@/components/preview/enquiry-wizard";
import { EnquiryUnavailable } from "@/components/enquiry-unavailable";

export const metadata: Metadata = { title: "Plan your complete kitchen", robots: { index: false, follow: false } };
export default function PlanYourKitchen() {
  return process.env.K3D_LOCAL_PREVIEW === "1"
    ? <EnquiryWizard journey="complete" />
    : <EnquiryUnavailable journey="complete" />;
}
