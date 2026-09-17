import Image from "next/image";
import Link from "next/link";
import { Arrow } from "./site-shell";
import { ProjectComparison } from "./project-comparison";

const faqs = [
  ["Can you fit a kitchen I’ve already bought?", "Yes. Share your supplier, plans, delivery date and the work you need. Reza can discuss installation and whether any additional trades need to be coordinated. Supplier names in our enquiry form identify your kitchen; they do not imply a partnership or endorsement."],
  ["What is included in a complete kitchen project?", "Kitchen3D supplies the materials and agreed additional items included in your project. Work is carried out or coordinated according to the quotation and contract, with the scope and final price agreed by both parties before work proceeds."],
  ["Is the initial site visit really free?", "Yes. The initial visit is free and without obligation, and takes up to 45 minutes. It is an opportunity to discuss your plans, measure the space and explore your options. Arrange a visit by phone or request one online. In this local preview, no request is sent and no appointment is booked."],
  ["Which areas do you cover?", "We cover all of Greater Manchester, including Altrincham, Oldham, Bolton and Bury. These are examples, not the limit of our coverage. Share your project postcode and address so Reza can plan the visit with you."],
  ["Can you coordinate other trades?", "Kitchen fitting, removal, worktops, flooring and internal wooden doors are part of our direct service offering. Plumbing, electrical work, gas work, tiling and plastering are coordinated with specialists where needed. Tell us which appliances need installing too; any specialist connections and responsibilities will be included in your agreed project scope."],
];

export function PreviewHome({ preview = true }: { preview?: boolean }) {
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy entrance">
          <p className="eyebrow"><span /> KITCHENS, WITH YOU IN MIND</p>
          <h1>A kitchen that<br />feels like <em>home.</em></h1>
          <p className="hero-description">From fitting the kitchen you’ve chosen to bringing a whole new space to life. Let’s make your next step a simple one.</p>
          <div className="hero-actions"><Link href="#your-kitchen" className="button button-dark">Let’s start your kitchen <Arrow /></Link><Link href="#projects" className="text-link">Explore the possibilities <Arrow diagonal /></Link></div>
          <div className="hero-location"><span aria-hidden="true">⌖</span> Across Greater Manchester <span className="location-line" /></div>
        </div>
        <figure className="hero-image entrance">
          <Image src="/preview/kitchen-inspiration.webp" alt="A light kitchen with warm wooden worktops and a central island" fill sizes="(max-width: 760px) 100vw, 55vw" priority />
          <figcaption>Design inspiration · Existing-site image, not a project claim</figcaption>
          <div className="image-note"><span className="note-symbol" aria-hidden="true">↗</span><span>A fresh start.<br /><strong>A space that’s yours.</strong></span></div>
        </figure>
      </div>
    </section>
    <div className="values-strip"><div className="container"><span>Installation or a complete project</span><span>Free initial site visit</span><span>Scope &amp; price agreed together</span></div></div>

    <section id="your-kitchen" className="section container">
      <div className="section-heading"><div><p className="eyebrow">TWO WAYS TO GET STARTED</p><h2>Where are you<br /><em>with your kitchen?</em></h2></div><p>You don’t need to have every detail worked out.<br />Just choose the path that sounds like you.</p></div>
      <div className="journey-grid">
        <Link href="/installation-enquiry" className="journey-card installation-card"><div className="card-top"><span className="card-number">01 / READY TO FIT</span><span className="circle-arrow" aria-hidden="true">↗</span></div><h3>I’ve bought<br />my kitchen.</h3><p>You’ve chosen your kitchen. Now let’s talk about fitting it, the finishing touches and any extra work you need.</p><div className="journey-tags"><span>Your supplier</span><span>Your plans</span><span>Your dates</span></div><div className="card-link">Tell us about your installation <Arrow /></div></Link>
        <Link href="/plan-your-kitchen" className="journey-card complete-card"><div className="card-top"><span className="card-number">02 / FROM THE BEGINNING</span><span className="circle-arrow" aria-hidden="true">↗</span></div><h3>I need a<br />complete kitchen.</h3><p>From first ideas and measuring to materials and installation. We’ll help you define a project that works for your home.</p><div className="journey-tags"><span>Design guidance</span><span>Supply</span><span>Installation</span></div><div className="card-link">Book a Free Site Visit <Arrow /></div></Link>
      </div>
    </section>

    <section id="services" className="services-section">
      <div className="container services-grid"><div><p className="eyebrow">THE DETAILS MAKE THE DIFFERENCE</p><h2>More than cabinets.<br /><em>The whole space.</em></h2><p className="section-copy">A kitchen project brings different jobs together. We’ll help you understand what’s needed, who will do it and what’s included.</p><Link href="/#your-kitchen" className="text-link">Talk through your project <Arrow /></Link></div>
        <div className="service-list">
          <div><span>01</span><div><h3>Remove &amp; prepare</h3><p>Existing kitchen removal and preparation for your new layout.</p></div></div>
          <div><span>02</span><div><h3>Fit &amp; finish</h3><p>Kitchen fitting, worktops, flooring and internal wooden doors. Appliance installation can also be included, with any specialist connections coordinated as part of the agreed work.</p></div></div>
          <div><span>03</span><div><h3>Coordinate the specialists</h3><p>Plumbing, electrical work and gas work are coordinated with specialists. We can also coordinate tiling and plastering for your kitchen project, with responsibilities agreed before work begins.</p></div></div>
          <p className="small-note">Materials, additional items and specialist work are subject to your agreed quotation, project scope and contract.</p>
        </div>
      </div>
    </section>

    <section id="projects" className="section container">
      <div className="section-heading"><div><p className="eyebrow">A CHANGE YOU CAN SEE</p><h2>Room for a<br /><em>new beginning.</em></h2></div><p>Explore the before-and-after layout.<br />More project stories are on their way.</p></div>
      <div className="project-grid"><ProjectComparison /><figure className="project-secondary"><div className="project-image"><Image src="/preview/dark-kitchen-after.webp" alt="Dark kitchen cabinets with a light worktop in an existing-site project photograph" fill sizes="(max-width: 760px) 100vw, 35vw" /></div><figcaption><span>Dark &amp; contemporary</span><span>Portfolio preview</span></figcaption></figure></div>
      <p className="asset-note">Internal review: these photographs come from the existing site. Final project selection, captions and publication clearance are pending the owner’s additional materials.</p>
    </section>

    <section id="approach" className="approach-section"><div className="container"><p className="eyebrow">FROM FIRST HELLO TO FINAL DETAILS</p><h2>A clear path to<br /><em>your new kitchen.</em></h2><div className="steps-grid">
      {[["01", "Tell us what you have in mind", "A few details, a plan or even just an idea. Start online or speak with Reza."], ["02", "Walk through the possibilities", "Arrange a free, no-obligation site visit of up to 45 minutes to discuss your space."], ["03", "Agree the work together", "Your project scope, materials, responsibilities and final price are agreed before work proceeds."]].map(([n, title, body]) => <article key={n}><span className="step-number">{n}</span><h3>{title}</h3><p>{body}</p></article>)}
    </div></div></section>

    <section id="questions" className="section container faq-grid"><div><p className="eyebrow">GOOD QUESTIONS</p><h2>A little clarity,<br /><em>before you start.</em></h2><p className="section-copy">Something else on your mind?<br /><a className="text-link" href="tel:07882116895">Speak with Reza <Arrow diagonal /></a></p></div><div className="faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true" className="faq-plus">+</span></summary><p>{!preview && q === "Is the initial site visit really free?" ? "Yes. The initial visit is free and without obligation, and takes up to 45 minutes. Call or email Reza to arrange a visit. Online enquiries and booking are not available yet." : a}</p></details>)}</div></section>

    <section className="contact-band"><div className="container"><div><p className="eyebrow">LET’S MAKE A START</p><h2>Your new kitchen<br />starts with a conversation.</h2></div><div className="contact-actions"><Link href="/plan-your-kitchen" className="button button-cream">Book a Free Site Visit <Arrow /></Link><a href="tel:07882116895">Or call Reza on 07882 116 895 <Arrow diagonal /></a><p>Free · No obligation · Up to 45 minutes</p></div></div></section>
  </>;
}
