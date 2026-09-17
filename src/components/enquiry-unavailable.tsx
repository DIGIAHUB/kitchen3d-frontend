import Link from "next/link";

/** Server-rendered fallback: no input fields, customer data or network writes.
 * Replace only after the real delivery flow passes its activation checks.
 */
export function EnquiryUnavailable({ journey }: { journey: "installation" | "complete" }) {
  const installation = journey === "installation";
  return <section className="enquiry-section container">
    <Link href="/#your-kitchen" className="back-link">← Back to your kitchen options</Link>
    <div className="enquiry-layout">
      <aside className="enquiry-aside">
        <p className="eyebrow">{installation ? "01 / READY TO FIT" : "02 / FROM THE BEGINNING"}</p>
        <h1>{installation ? <>Your kitchen.<br /><em>Let’s get it fitted.</em></> : <>Your ideas.<br /><em>A fresh beginning.</em></>}</h1>
        <p>{installation ? "Discuss your supplier, plans, fitting and any finishing touches with Reza." : "You don’t need a finished design. Start with a conversation about your space."}</p>
        <div className="visit-card"><h2>Let’s see the possibilities.</h2><p>A free, no-obligation site visit.<br />Up to 45 minutes at your property.</p><span>Discuss · Measure · Explore</span></div>
      </aside>
      <div className="wizard-panel"><div className="wizard-heading">
        <p className="eyebrow">SPEAK WITH REZA</p>
        <h2>Let’s talk about your kitchen.</h2>
        <p>Online enquiries and bookings are not available yet. Please call or email Reza to discuss your project or arrange a free site visit.</p>
        <div className="complete-actions"><a className="button button-dark" href="tel:07882116895">Call 07882 116 895</a><a className="text-link" href="mailto:kitchen3dltd@gmail.com">Email Reza →</a></div>
        <p>No enquiry has been sent and no appointment has been booked by opening this page.</p>
        <p>Visits cover Greater Manchester, Monday–Saturday, 9 am–6 pm UK time, by arrangement. Reza allows an hour between visits.</p>
      </div></div>
    </div>
  </section>;
}
