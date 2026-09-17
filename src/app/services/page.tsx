import type { Metadata } from "next";
import Link from "next/link";
import { InformationPage } from "@/components/information-page";
import { revisedServicePages } from "@/lib/service-pages";

export const metadata: Metadata = {
  title: "Kitchen services in Greater Manchester",
  description: "Explore Kitchen3D kitchen fitting, worktops, flooring, internal wooden doors and coordinated specialist trades. Scope and price are agreed for your project.",
  alternates: { canonical: "https://kitchen3d.co.uk/services" },
  robots: { index: false, follow: false },
};

export default function ServicesPage() {
  return <InformationPage title="The work around your kitchen" intro="From fitting cabinets to coordinating the specialists, see how the different parts of your project can come together." sections={[
    {heading:"A clear scope, agreed together",text:"Kitchen fitting, removal, worktops, flooring and internal wooden doors are direct services. Plumbing, electrical work, gas work, tiling and plastering are coordinated with specialists where needed. Your quotation and contract define the materials, responsibilities and final price."},
  ]}>
    <nav className="service-directory" aria-label="Kitchen services">{revisedServicePages.map(page => <Link href={`/${page.slug}`} key={page.slug}>
      <h2>{page.title}</h2><p>{page.heroSubtitle}</p><span>Explore this service →</span>
    </Link>)}</nav>
  </InformationPage>;
}
