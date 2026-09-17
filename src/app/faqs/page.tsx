import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";

export const metadata: Metadata = {
  title: "Kitchen project questions",
  description: "Answers about Kitchen3D installation, complete projects, materials, specialist trades, free visits and Greater Manchester coverage.",
  alternates: { canonical: "https://kitchen3d.co.uk/faqs" },
  robots: { index: false, follow: false },
};
export default function FaqsPage() {
  return <InformationPage title="A little clarity before you start" intro="Practical answers to help you prepare for a conversation about your kitchen." sections={[
    {heading:"Can you fit a kitchen I have already bought?",text:"Yes. Share the supplier plans, delivery information and appliance details with Reza. Discuss removal, fitting, finishing work and any specialist trades before agreeing the scope."},
    {heading:"Who supplies materials for a complete project?",text:"Kitchen3D supplies the materials and agreed additional items included in the contracted project. Your quotation and contract set out the inclusions, responsibilities and final price accepted by both parties."},
    {heading:"Can other trades be coordinated?",text:"Plumbing, electrical and gas work are coordinated with specialists where required. Tiling and plastering can also be coordinated. These are not automatically included in every fitting price; agree them as part of your project."},
    {heading:"Is the first site visit free?",text:"Yes. The initial site visit is free and without obligation and lasts up to 45 minutes. Visits can be arranged Monday–Saturday, 9 am–6 pm UK time, with an hour between visits."},
    {heading:"Where do you work?",text:"All Greater Manchester, including Altrincham, Oldham, Bolton and Bury. Visits take place at your property by arrangement, not at a walk-in showroom."},
    {heading:"Does an enquiry book an appointment?",text:"No. An enquiry or preferred date is a request, not a confirmed appointment. Online enquiries and booking are not yet available on this website; please contact Reza by phone or email."},
  ]}/>;
}
