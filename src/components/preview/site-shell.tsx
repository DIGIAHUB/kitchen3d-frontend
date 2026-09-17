import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./mobile-menu";

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? "↗" : "→"}</span>;
}

export function PreviewShell({ children, preview = true }: { children: React.ReactNode; preview?: boolean }) {
  return (
    <div className="k3d-preview">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="preview-notice"><span className="status-dot" /> {preview ? "Local design preview" : "Website preparation"} <span className="notice-detail">· {preview ? "No enquiries sent or appointments booked" : "Online enquiries and bookings not yet available"}</span></div>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" aria-label="Kitchen3D home" className="brand-link"><Image src="/preview/logo.png" alt="Kitchen3D" width={840} height={646} priority className="brand-logo" /></Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/#your-kitchen">Your kitchen</Link><Link href="/#services">What we do</Link><Link href="/#projects">Projects</Link><Link href="/#questions">FAQs</Link>
          </nav>
          <Link href="/#your-kitchen" className="button button-dark header-cta">Get a Free Quote <Arrow /></Link>
          <MobileMenu />
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div><p className="footer-brand">Kitchen3D<span> Ltd</span></p><p>Kitchens made for living.<br />Manchester &amp; surrounding areas.</p></div>
          <div><h2>Let’s talk kitchens</h2><a href="tel:07882116895">07882 116 895</a><a href="mailto:kitchen3dltd@gmail.com">kitchen3dltd@gmail.com</a><p>Office contact hours · Monday–Friday, 8am–6pm<br />Site visits by arrangement, Monday–Saturday, 9am–6pm.</p></div>
          <nav aria-label="Footer navigation"><h2>Find your next step</h2><Link href="/installation-enquiry">I’ve bought my kitchen</Link><Link href="/plan-your-kitchen">I need a complete kitchen</Link><Link href="/services">Explore all services</Link><Link href="/blogs">Kitchen planning guides</Link><Link href="/about">About Kitchen3D</Link><Link href="/contact">Contact Reza</Link><Link href="/faqs">Kitchen questions</Link><Link href="/#projects">View Our Projects</Link></nav>
        </div>
        <div className="container footer-bottom"><span>KITCHEN3D LTD</span><span>{preview ? "Internal preview · Not a live booking service" : "Visits by arrangement · Online booking not yet available"}</span></div>
      </footer>
    </div>
  );
}
