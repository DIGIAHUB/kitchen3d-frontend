"use client";

import Image from "next/image";
import { useState } from "react";

export function ProjectComparison() {
  const [before, setBefore] = useState(false);
  return <figure className="project-comparison"><div className="project-image"><Image src={before ? "/preview/light-kitchen-before.webp" : "/preview/light-kitchen-after.webp"} alt={before ? "The kitchen before renovation, from the existing-site portfolio" : "Light kitchen cabinets and marble-effect surfaces, from the existing-site portfolio"} fill sizes="(max-width: 760px) 100vw, 60vw" /><div className="comparison-toggle" role="group" aria-label="Compare kitchen photographs"><button type="button" aria-pressed={before} onClick={() => setBefore(true)}>Before</button><button type="button" aria-pressed={!before} onClick={() => setBefore(false)}>After</button></div></div><figcaption><span>Light &amp; modern</span><span aria-live="polite">{before ? "Before" : "After"} · Portfolio preview</span></figcaption></figure>;
}
