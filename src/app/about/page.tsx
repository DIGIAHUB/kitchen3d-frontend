import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";

export const metadata: Metadata = {
  title: "About Kitchen3D",
  description: "Meet the approach behind Kitchen3D: kitchen installation and complete projects across Greater Manchester, with Reza and a clearly agreed scope.",
  alternates: { canonical: "https://kitchen3d.co.uk/about" },
  robots: { index: false, follow: false },
};
export default function AboutPage() {
  return <InformationPage title="A kitchen that works for you" intro="Kitchen3D Ltd helps customers across Greater Manchester take the next step with their kitchen. Start with Reza, your space and what you want to change." sections={[
    {heading:"Two ways to begin",text:"If you have already bought your kitchen, discuss installation, delivery and the finishing work. If you need a complete project, start with your ideas, priorities and space before agreeing the specification."},
    {heading:"Know what is included",text:"For complete projects, Kitchen3D supplies the materials and agreed additional items specified in the project. Work is carried out or coordinated according to the quotation and contract, with responsibilities and the final price agreed by both parties."},
    {heading:"Start at your property",text:"The free, no-obligation initial site visit lasts up to 45 minutes. Reza covers Greater Manchester, including Altrincham, Oldham, Bolton and Bury. Visits are by arrangement at your property, not walk-in showroom appointments."},
  ]}/>;
}
