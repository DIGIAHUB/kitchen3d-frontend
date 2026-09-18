import type { Metadata } from "next";
import { EnquiryWizard } from "@/components/preview/enquiry-wizard";

export const metadata: Metadata = { title: "Plan your complete kitchen", robots: { index: false, follow: false } };
export default function PlanYourKitchen() {
  return <EnquiryWizard journey="complete" live={process.env.K3D_LOCAL_PREVIEW !== "1"} />;
}
