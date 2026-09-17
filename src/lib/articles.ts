import { getAllPosts as getCmsPosts, type WixPost } from "./wix";
import { isCmsSlug, isHeldArticle } from "./migration-routes";

// Editorial migration revisions under the director's SEO/content authority.
// No certifications, fixed prices, completion guarantees or invented project proof.
const guides = [
  ["expert-kitchen-fitting-installation-services", "Kitchen installation: fitting only or a complete project?", "Compare installation-only and complete kitchen projects with Kitchen3D in Greater Manchester. Understand materials, trade coordination and the agreed scope.",
    "Choose the right starting point", "If you have already bought a kitchen, start with an installation discussion. If you need a complete kitchen project, discuss your space, preferred layout and materials before settling the specification.",
    "Already bought your kitchen?", "Have your supplier details, layout, delivery information and appliance list ready. Tell Reza whether the old kitchen needs removing and whether flooring, worktops or other finishing work should be included.",
    "Planning a complete project", "Kitchen3D supplies the materials and agreed additional items included in the contracted project. The quotation and contract define what is included, who is responsible for each part and the final price accepted by both parties.",
    "Specialist work", "Plumbing, electrical and gas work are coordinated with specialists where required. Discuss those requirements before work starts; they are not automatically included in every fitting quotation.",
    "Your next step", "Arrange a free, no-obligation site visit of up to 45 minutes across Greater Manchester. Call 07882 116 895 or email kitchen3dltd@gmail.com to discuss your project. A conversation or enquiry is not a confirmed appointment."],
  ["door-fitting-in-manchester-doors-be-damaging-your-home", "Internal door fitting in Manchester: what to discuss", "Plan internal wooden door fitting in Manchester: door supply, existing frames, hardware, finishing and the scope to agree with Kitchen3D.",
    "Start with the doors and rooms", "Kitchen3D's confirmed door-fitting scope covers internal wooden doors. Tell Reza how many doors you want fitted, which rooms they serve and whether you have already purchased them.",
    "Check the existing frames", "Share photographs of the openings, frames and current doors. Frame condition, door dimensions, hinges and handles can affect the work needed. Final requirements should be assessed before the scope and price are agreed.",
    "Agree supply and finishing", "Clarify who supplies the doors and hardware, what removal or preparation is needed, and whether decoration or other finishing is included. Do not assume those items are part of every installation price.",
    "Work outside the confirmed scope", "External doors, specialist fire-door requirements and unusual systems need a separate assessment. This guide does not promise that every door type is covered by Kitchen3D's service.",
    "Discuss your installation", "Call Reza on 07882 116 895 or email kitchen3dltd@gmail.com with your requirements. If door fitting is part of a kitchen project, include it when agreeing the overall scope."],
  ["flooring-installation-in-manchester-transform-your-home", "Kitchen flooring in Manchester: planning the installation", "Plan flooring as part of your Manchester kitchen project. Discuss materials, preparation, appliances and finishing before agreeing the installation scope.",
    "Plan flooring with the kitchen", "Flooring affects the finished look and how the room is used. Discuss it alongside the kitchen layout rather than treating it as an unplanned extra after installation has started.",
    "Explain your material choice", "Share the flooring product details and any supplier installation instructions. If you have not chosen a product, explain your preferences and ask what needs checking for your space before buying.",
    "Assess preparation", "Existing surfaces, levels and the condition of the floor can affect preparation. Photographs help start the discussion, but they do not replace checking the property before agreeing the work.",
    "Coordinate the sequence", "Discuss how flooring relates to cabinets, appliances, thresholds and adjoining rooms. Agree the sequence and responsibilities with the people carrying out the work, following the chosen product's requirements.",
    "Get a clear scope", "Ask whether the quotation includes removal, preparation, materials and finishing details. Kitchen3D's materials and work are governed by the quotation and contract agreed by both parties."],
  ["kitchen-fitters-in-manchester-everything-you-need-to-know", "Choosing kitchen fitters in Manchester: a practical checklist", "Prepare for a kitchen-fitting conversation in Manchester with a checklist covering plans, materials, specialist trades, quotations and site visits.",
    "Bring the information you have", "You do not need every decision finalised to start. Supplier plans, approximate room details, appliance choices and a few photographs help explain what you want from the project.",
    "Explain what needs doing", "Separate kitchen fitting from removal, worktops, flooring and other finishing work. Identify plumbing, electrical or gas requirements so specialist responsibilities can be discussed at the outset.",
    "Compare scope, not just totals", "Check what each quotation includes, what you will supply and how additional work will be agreed. A lower headline figure is not a like-for-like comparison if important work or materials are excluded.",
    "Discuss timing realistically", "Share preferred dates and delivery information. The programme depends on the agreed work, property conditions, materials and coordination; do not treat an initial enquiry as a fixed start date.",
    "Meet at your property", "Kitchen3D offers a free initial site visit of up to 45 minutes across Greater Manchester, by arrangement. Visits can be discussed for Monday to Saturday, 9 am to 6 pm UK time, with an hour between visits."],
  ["kitchen-installation-in-stockport-create-the-heart-of-your-home-with-confidence", "Kitchen installation in Stockport: preparing your project", "Prepare a Stockport kitchen installation with clear plans, supply responsibilities and an agreed scope. Kitchen3D covers Greater Manchester by arrangement.",
    "Start with your Stockport property", "Stockport is within Greater Manchester, Kitchen3D's confirmed service area. Explain your address, access arrangements and the room you want to change when discussing a visit.",
    "Choose your journey", "If your kitchen is already purchased, provide the supplier layout and delivery details. For a complete project, start with the space, your priorities and any inspiration you want to discuss.",
    "Include the surrounding work", "Tell Reza about removal, worktops, flooring and finishing requirements. Plumbing, electrical and gas work are coordinated with specialists according to the agreed project responsibilities.",
    "Confirm materials and price", "For complete projects, Kitchen3D supplies the materials and agreed additional items included in the contract. Confirm inclusions and the final price before work proceeds.",
    "Arrange a conversation", "Call 07882 116 895 or email kitchen3dltd@gmail.com. The free initial site visit is up to 45 minutes and arranged for your property; it is not a walk-in showroom appointment."],
  ["ready-to-transform-your-space-with-kitchen-renovation-in-manchester", "Kitchen renovation in Manchester: from ideas to agreed scope", "Plan a Manchester kitchen renovation around your space, priorities, materials and agreed responsibilities, without fixed-price or completion-time promises.",
    "Set your priorities", "Think about what works in the current kitchen and what you want to change. Storage, room layout, appliance positions and the way your household uses the space are useful starting points.",
    "Share ideas without needing a finished design", "Bring inspiration, photographs or existing plans to the discussion. Kitchen3D's complete-project journey starts with your requirements and develops the materials and work to be included in the quotation.",
    "Agree the work around the kitchen", "Removal, flooring, worktops, tiling or plastering may need to be considered alongside the kitchen itself. Specialist trades and any additional requirements must be assessed and included in the agreed scope where appropriate.",
    "Plan cost and timing together", "Budget and programme depend on the final specification, supply arrangements and conditions at the property. Agree the scope and final price before work starts, and discuss how changes will be handled.",
    "Take the first step", "Contact Reza to discuss a free, no-obligation site visit of up to 45 minutes in Greater Manchester. Phone 07882 116 895 or email kitchen3dltd@gmail.com. Online enquiries and booking availability should only be relied on when the website confirms they are active."],
] as const;

export const revisedArticles: WixPost[] = guides.map(([slug, title, description, ...copy]) => ({
  id: `editorial-${slug}`, slug, title, wpId: 0, link: `https://kitchen3d.co.uk/${slug}/`,
  date: "", modified: "", seoTitle: title, metaDescription: description, excerpt: description,
  bodyJson: JSON.stringify({version:1,reviewState:"approved",blocks:copy.map((text,index)=>({type:index%2===0?"heading":"paragraph",text}))}),
}));

export async function getAllPosts(): Promise<WixPost[]> {
  const cms = await getCmsPosts();
  const revised = new Set(revisedArticles.map(post => post.slug));
  return [...revisedArticles, ...cms.filter(post => isCmsSlug(post.slug) && !isHeldArticle(post.slug) && !revised.has(post.slug))];
}

export async function getPostBySlug(slug: string): Promise<WixPost | null> {
  return (await getAllPosts()).find(post => post.slug === slug) ?? null;
}
