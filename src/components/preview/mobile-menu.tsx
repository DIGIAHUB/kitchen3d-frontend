"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return <div className="mobile-menu" onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); event.currentTarget.querySelector("button")?.focus(); } }}>
    <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? "Close ×" : "Menu ☰"}</button>
    <nav id="mobile-navigation" aria-label="Mobile navigation" hidden={!open}>
      {[["/#your-kitchen", "Your kitchen"], ["/#services", "What we do"], ["/#projects", "Projects"], ["/#questions", "FAQs"], ["/plan-your-kitchen", "Book a Free Site Visit"]].map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
    </nav>
  </div>;
}
