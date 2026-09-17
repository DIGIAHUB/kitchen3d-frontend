import Link from "next/link";

export default function NotFound() {
  return <section className="section container">
    <p className="eyebrow">PAGE NOT FOUND</p>
    <h1>Let’s find your next step.</h1>
    <p>This page is not available. You can return to the homepage or speak with Reza about your kitchen.</p>
    <div className="complete-actions">
      <Link className="button button-dark" href="/">Back to the homepage →</Link>
      <a className="text-link" href="tel:07882116895">Call Reza · 07882 116 895</a>
    </div>
  </section>;
}
