import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";

export const metadata: Metadata = {
  title: "Check your enquiry status",
  description: "Contact Reza if you need to check whether your Kitchen3D enquiry was received.",
  robots: {index:false,follow:false},
};
// Never treat an accessible URL as a delivery receipt. A future success screen
// must be driven by a verified submission result, not by arrival on this page.
export default function ThankYouPage() {
  return <InformationPage title="Need to check your enquiry?" intro="This page does not confirm that a message was received or an appointment booked." sections={[
    {heading:"Speak with Reza",text:"Online enquiries and bookings are not active yet. If you need to confirm a previous conversation or appointment, contact Reza using the phone or email links below."},
  ]}/>;
}
