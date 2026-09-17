import Link from "next/link";

export type InformationSection = { heading: string; text: string };

export function InformationPage({ title, intro, sections, children }: {
  title: string;
  intro: string;
  sections: readonly InformationSection[];
  children?: React.ReactNode;
}) {
  return <article className="information-page container">
    <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true"> / </span><span aria-current="page">{title}</span></nav>
    <header><p className="eyebrow">KITCHEN3D · GREATER MANCHESTER</p><h1>{title}</h1><p>{intro}</p></header>
    <div className="information-sections">{sections.map(section => <section key={section.heading}>
      <h2>{section.heading}</h2><p>{section.text}</p>
    </section>)}</div>
    {children}
    <section className="article-next-step">
      <h2>Let’s talk about your kitchen</h2>
      <p>Call <a href="tel:07882116895">07882 116 895</a> or <a href="mailto:kitchen3dltd@gmail.com">email Reza</a> to discuss your project. Online enquiries and bookings are not yet available.</p>
      <Link className="button button-dark" href="/#your-kitchen">Explore your two starting points →</Link>
    </section>
  </article>;
}
