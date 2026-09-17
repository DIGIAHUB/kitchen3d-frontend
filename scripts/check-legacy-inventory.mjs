import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {migrationRedirects} from "../config/migration-redirects.mjs";

// Audit the actual recorded URLs, including trailing slashes and queries.
// Do not contact the old site or crawl media. Historical inventory is read-only.
const text = readFileSync(new URL("../../docs/K3D-001_URL_MIGRATION_MAP.csv", import.meta.url), "utf8");
const rows = text.trim().split(/\r?\n/).slice(1).map(line => {
  const match = line.match(/^"([^"\r\n]+)","([^"\r\n]+)",/);
  assert.ok(match, "Expected quoted inventory URL/type fields");
  const url = new URL(match[1]);
  assert.equal(url.origin, "https://kitchen3d.co.uk");
  return {url, type:match[2]};
});
assert.equal(rows.length, 309, "Inventory changed: reconcile outcomes explicitly");
const media = rows.filter(row => row.type.startsWith("media "));
assert.equal(media.length, 246);
const origin = process.argv[2];
if (!origin) {
  console.log("LEGACY_INVENTORY=309; MEDIA_URLS_PENDING=246; HTTP_CHECK=SKIPPED (supply authorised loopback origin)");
  process.exit(0);
}
assert.ok(["http://127.0.0.1:3100", "http://127.0.0.1:3101"].includes(origin));
const held = new Set(["/projects", "/testimonials", "/bedroom-furniture-installation-assembly", "/thinking-about-wardrobe-installation-in-manchester"]);
const redirects = new Map(migrationRedirects.map(row => [row.source,row.destination]));
const counts = {retained:0, redirected:0, held:0, retiredOrUnimplemented:0, sitemapPending:0};
let assertions = 0;
const check = fn => {fn(); assertions++;};

for (const row of rows.filter(row => !row.type.startsWith("media "))) {
  const path = row.url.pathname.replace(/\/$/, "") || "/";
  const destination = redirects.get(path);
  const retained = ["page", "post", "functional page", "parameter route", "redirect"].includes(row.type) && !held.has(path);
  const templateHome = path === "/" && row.type === "system template";
  const robots = path === "/robots.txt";
  const expected = retained || destination || templateHome || robots ? 200 : 404;
  let target = new URL(row.url.pathname + row.url.search, origin);
  const seen = new Set();
  let reply;
  for (let hop = 0; hop < 4; hop++) {
    check(() => assert.equal(target.origin, origin, "Never follow an external location"));
    check(() => assert.ok(!seen.has(target.href), "Redirect loop"));
    seen.add(target.href);
    reply = await fetch(target, {redirect:"manual", signal:AbortSignal.timeout(10_000)});
    if (![301,302,303,307,308].includes(reply.status)) break;
    check(() => assert.equal(reply.status, 308, "Expected permanent Next.js normalization or explicit redirect"));
    const location = reply.headers.get("location");
    check(() => assert.ok(location));
    await reply.body?.cancel();
    target = new URL(location, target);
  }
  check(() => assert.equal(reply.status, expected, row.url.href));
  check(() => assert.equal(target.pathname, destination ?? path));
  const body = await reply.text();
  if (robots) check(() => assert.match(body, /Disallow: \/(?:\r?\n|$)/));
  else check(() => assert.match(body, /<meta name="robots" content="[^"]*noindex/));
  if (row.type === "functional page") check(() => assert.match(body, /does not confirm that a message was received/));
  if (row.type === "parameter route") {
    check(() => assert.ok(body.includes('rel="canonical" href="https://kitchen3d.co.uk/contact"')));
    check(() => assert.doesNotMatch(body, /<(?:form|input|textarea|select)\b/));
  }
  if (destination) counts.redirected++;
  else if (held.has(path)) counts.held++;
  else if (row.type.startsWith("sitemap")) counts.sitemapPending++;
  else if (expected === 200) counts.retained++;
  else counts.retiredOrUnimplemented++;
}
console.log(`LEGACY_HTTP_CHECKS=PASS (${assertions}; 63 recorded non-media URLs; local GETs only)`);
console.log(JSON.stringify(counts));
console.log("MIGRATION_COMPLETION=HOLD; MEDIA_URLS_PENDING=246; SITEMAP_ACTIVATION_PENDING=5; 404 observations are not blanket retirement approval");
