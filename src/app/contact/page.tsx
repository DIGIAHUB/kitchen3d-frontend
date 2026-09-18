import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";

export const metadata: Metadata = {
  title: "Contact Reza at Kitchen3D",
  description: "Speak to Reza about kitchen fitting or a complete kitchen project in Greater Manchester. Arrange a free initial site visit of up to 45 minutes.",
  alternates: { canonical: "https://kitchen3d.co.uk/contact" },
};
export default function ContactPage() {
  return <InformationPage title="Start with a conversation" intro="You do not need every detail worked out. Tell Reza what you have in mind, whether your kitchen is already purchased or you are starting from the beginning." sections={[
    {heading:"When to get in touch",text:"Business contact hours are Monday–Friday, 8 am–6 pm UK time. Use the phone or email links below; online enquiry collection is not active yet."},
    {heading:"Arrange a free visit",text:"Initial visits are free and without obligation, lasting up to 45 minutes. Visit hours are Monday–Saturday, 9 am–6 pm UK time, by arrangement, with an hour between visits. A preferred date is not a confirmed appointment."},
    {heading:"Across Greater Manchester",text:"Reza covers all Greater Manchester, including Altrincham, Oldham, Bolton and Bury. These examples are not the boundary of the service area. Visits take place at your property; there is no walk-in showroom service."},
  ]}/>;
}
