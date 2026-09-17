import assert from "node:assert/strict";
import {migrationRedirects} from "../config/migration-redirects.mjs";

// Opt-in and loopback-only. Never crawl the live domain, follow redirects,
// submit a form or read credentials. No customer data is used.
const origin = process.argv[2];
if (!origin) {
  console.log("LOCAL_HTTP_CHECKS=SKIPPED (pass http://127.0.0.1:3100 or :3101 after starting the matching offline server)");
  process.exit(0);
}
assert.ok(["http://127.0.0.1:3100", "http://127.0.0.1:3101"].includes(origin), "Only the two authorised loopback origins are allowed");
const sample = origin.endsWith(":3100");
const pages = ["/", "/services", "/about", "/contact", "/faqs", "/blogs", "/installation-enquiry", "/plan-your-kitchen",
  "/kitchen-fitting-installation", "/worktop-installation", "/flooring-installation", "/door-fitting", "/plumbing-works", "/electrical-works", "/wall-floor-tiling", "/sink-hob-fitting",
  "/expert-kitchen-fitting-installation-services", "/door-fitting-in-manchester-doors-be-damaging-your-home", "/flooring-installation-in-manchester-transform-your-home", "/kitchen-fitters-in-manchester-everything-you-need-to-know", "/kitchen-installation-in-stockport-create-the-heart-of-your-home-with-confidence", "/ready-to-transform-your-space-with-kitchen-renovation-in-manchester"];
const documents = new Map();
let checks = 0;
const check = fn => { fn(); checks++; };
for (const route of pages) {
  const reply = await fetch(origin + route, {redirect:"manual",signal:AbortSignal.timeout(10_000)});
  check(()=>assert.equal(reply.status,200,route));
  const html = await reply.text();
  documents.set(route,html);
  check(()=>assert.match(html, /<meta name="robots" content="[^"]*noindex/, route));
  check(()=>assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) ?? []).length,1,route));
  check(()=>assert.doesNotMatch(html, /Internal Server Error|NEXT_NOT_FOUND|Application error:/,route));
  const journey = ["/installation-enquiry","/plan-your-kitchen"].includes(route);
  if (!sample || !journey) check(()=>assert.doesNotMatch(html,/<(?:input|textarea|select|form)\b/,route));
  else check(()=>assert.match(html,/<form\b/,route));
  if (!journey && route !== "/") check(()=>assert.ok(html.includes(`rel="canonical" href="https://kitchen3d.co.uk${route}"`),route+" canonical"));
}
// Check rendered navigation and fragments, not arbitrary CMS/source URL strings.
for (const [route, html] of documents) {
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith("/") && !href.startsWith("#")) continue;
    const target = new URL(href, origin + route);
    check(()=>assert.equal(target.origin,origin,"Unexpected external navigation"));
    check(()=>assert.ok(documents.has(target.pathname), `${route} links to unmigrated ${target.pathname}`));
    if (target.hash) check(()=>assert.ok(documents.get(target.pathname).includes(`id="${target.hash.slice(1)}"`), `${route} broken fragment ${href}`));
  }
}
for (const path of ["/thinking-about-wardrobe-installation-in-manchester","/projects","/testimonials","/bedroom-furniture-installation-assembly"]) {
  const held = await fetch(origin + path, {redirect:"manual",signal:AbortSignal.timeout(10_000)});
  check(()=>assert.equal(held.status,404,"Held route "+path));
}
const receipt = await fetch(origin + "/thank-you", {redirect:"manual",signal:AbortSignal.timeout(10_000)});
check(()=>assert.equal(receipt.status,200));
const receiptText=await receipt.text();
check(()=>assert.match(receiptText,/does not confirm that a message was received/));
check(()=>assert.match(receiptText,/<meta name="robots" content="[^"]*noindex/));
const robots = await fetch(origin + "/robots.txt", {redirect:"manual",signal:AbortSignal.timeout(10_000)});
for (const row of migrationRedirects) {
  const redirect=await fetch(origin+row.source,{redirect:"manual",signal:AbortSignal.timeout(10_000)});
  check(()=>assert.equal(redirect.status,308,row.source));
  const destination=new URL(redirect.headers.get("location"),origin);
  check(()=>assert.equal(destination.origin,origin));
  check(()=>assert.equal(destination.pathname,row.destination));
  check(()=>assert.ok(documents.has(destination.pathname)));
}
check(()=>assert.equal(robots.status,200));
const robotsText = await robots.text();
check(()=>assert.match(robotsText,/Disallow: \/(?:\r?\n|$)/));
console.log(`LOCAL_HTTP_CHECKS=PASS (${checks}; ${pages.length} pages; ${sample ? "sample" : "candidate"}; local GETs only; no form submissions)`);
