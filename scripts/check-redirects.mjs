import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {migrationRedirects} from "../config/migration-redirects.mjs";
const inventory=readFileSync(new URL("../../docs/K3D-001_URL_MIGRATION_MAP.csv",import.meta.url),"utf8");
let checks=0;
const check=fn=>{fn();checks++;};
check(()=>assert.equal(migrationRedirects.length,11));
const sources=new Set(migrationRedirects.map(row=>row.source));
check(()=>assert.equal(sources.size,11));
for (const row of migrationRedirects) {
  check(()=>assert.ok(inventory.includes('"https://kitchen3d.co.uk'+row.source+'/"')));
  check(()=>assert.match(row.source,/^\/(?:category\/|tag\/)?[a-z0-9-]+$/));
  check(()=>assert.match(row.destination,/^\/[a-z0-9-]+$/));
  check(()=>assert.equal(row.permanent,true));
  check(()=>assert.ok(!sources.has(row.destination),"No configured redirect chains"));
  check(()=>assert.doesNotMatch(row.source,/wardrobe|wp-content|wp-admin|projects|testimonials/));
  check(()=>assert.notEqual(row.source,row.destination));
}
console.log(`REDIRECT_CHECKS=PASS (${checks}; 11 exact inventory paths; no remote changes, wildcard rules or configured chains)`);
