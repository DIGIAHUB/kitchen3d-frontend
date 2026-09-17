import { getAllPages as getCmsPages, getPageBySlug as getCmsPage, type WixPage } from "./wix";

// Director-authorised editorial revisions. Preserve existing URLs without
// carrying unsupported legacy promises into the new website.
const services = [
  ["kitchen-fitting-installation", "Kitchen fitting and installation", "Kitchen fitting across Greater Manchester, for a kitchen you have already bought or a complete project agreed with Kitchen3D.",
    "Share your supplier layout, delivery details and appliance list if you have already bought your kitchen.",
    "Discuss removal, preparation, worktops and finishing before agreeing the installation scope.",
    "For a complete project, materials and agreed additional items are supplied according to the quotation and contract accepted by both parties."],
  ["worktop-installation", "Kitchen worktop installation", "Discuss worktops as part of your Greater Manchester kitchen project, including materials, measurements and installation responsibilities.",
    "Tell Reza which worktop product you have chosen, or share your preferences if the choice is still open.",
    "Discuss layout, joints, edges and the positions of sinks and appliances before ordering or agreeing installation.",
    "Material suitability, preparation, specialist fabrication and supply responsibilities need to be assessed for the particular project."],
  ["flooring-installation", "Flooring for your kitchen project", "Plan flooring alongside your kitchen installation, with preparation, materials and finishing included in the agreed scope.",
    "Share the proposed flooring product, supplier requirements and photographs of the existing floor.",
    "Discuss removal, preparation, levels and adjoining rooms before the work is priced.",
    "Agree the installation sequence around cabinets and appliances; materials and additional work are included only where specified."],
  ["door-fitting", "Internal wooden door fitting", "Internal wooden door fitting across Greater Manchester, with the doors, frames, hardware and finishing discussed before work is agreed.",
    "Tell Reza how many internal wooden doors need fitting and whether you already have them.",
    "Share details of existing frames, hinges, handles and any removal or finishing work required.",
    "External doors and specialist door systems are outside this confirmed offer; do not assume they are covered by a standard fitting quotation."],
  ["plumbing-works", "Kitchen plumbing coordination", "Coordinate plumbing requirements with the right specialist as part of your agreed Kitchen3D kitchen project.",
    "Identify proposed sink, tap and appliance positions, including any changes to the current layout.",
    "Plumbing work is coordinated with specialists, with responsibilities and the scope agreed before work begins.",
    "Connections, pipe changes and any additional work must be assessed and included in the quotation where required. This is not an emergency plumbing service offer."],
  ["electrical-works", "Kitchen electrical-work coordination", "Plan specialist electrical work alongside your kitchen project, with clear responsibilities and an agreed scope.",
    "Share the appliance specification and proposed lighting, socket and layout requirements.",
    "Electrical work is coordinated with specialists; agree who will assess and carry it out before installation starts.",
    "Required work and any applicable documentation must be agreed with the responsible specialist. No electrical qualification or certification is claimed for Kitchen3D here."],
  ["wall-floor-tiling", "Kitchen tiling coordination", "Discuss coordinated wall and floor tiling as part of your kitchen project in Greater Manchester.",
    "Share the areas to be tiled, your chosen products or inspiration, and the existing surface condition.",
    "Tiling and any related plastering requirements can be coordinated, with preparation and finishing responsibilities agreed beforehand.",
    "Confirm who supplies materials and whether removal, preparation and finishing are included in the accepted quotation."],
  ["sink-hob-fitting", "Sink and hob installation coordination", "Plan sink and hob fitting with your kitchen worktops, appliances and specialist connections.",
    "Provide the sink and hob product details, worktop choice and intended positions.",
    "Agree fitting responsibilities and any specialist plumbing, electrical or gas connections before work starts.",
    "Specialist connections are coordinated where required. They are not automatically included in every kitchen fitting price."],
] as const;

export const revisedServicePages: WixPage[] = services.map(([slug, title, description, ...items]) => ({
  id: `editorial-${slug}`, slug, title, wpId: 0, link: `https://kitchen3d.co.uk/${slug}/`,
  modified: "", seoTitle: title, metaDescription: description, heroSubtitle: description, note: "",
  bodyJson: JSON.stringify({service_includes: {plan_your_project: items, agree_the_details: [
    "Free initial site visits last up to 45 minutes and cover Greater Manchester by arrangement. Visits are Monday–Saturday, 9 am–6 pm UK time, with an hour between visits.",
    "The final scope, materials, responsibilities and price are governed by the quotation and contract agreed by both parties. An enquiry is not a confirmed appointment.",
  ]}}),
}));

export async function getAllPages(): Promise<WixPage[]> {
  const cms = await getCmsPages();
  const revised = new Set(revisedServicePages.map(page => page.slug));
  return [...revisedServicePages, ...cms.filter(page => !revised.has(page.slug))];
}

export async function getPageBySlug(slug: string): Promise<WixPage | null> {
  return revisedServicePages.find(page => page.slug === slug) ?? await getCmsPage(slug);
}
