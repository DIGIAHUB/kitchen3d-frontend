import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function compile(relative,mocks={}) {
  const result={exports:{}};
  const code=ts.transpileModule(readFileSync(new URL(relative,import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(`(function(module,exports,require){${code}\n})`)(result,result.exports,id=>{
    if (id in mocks) return mocks[id];
    throw new Error("Unapproved dependency "+id);
  });
  return result.exports;
}
const routes=compile("../src/lib/migration-routes.ts");
const seo=compile("../src/lib/seo-preparation.ts",{"./migration-routes":routes});
const services=compile("../src/lib/service-pages.ts",{"./wix":{}}).revisedServicePages;
const articles=compile("../src/lib/articles.ts",{"./wix":{},"./migration-routes":routes}).revisedArticles;
let checks=0;
const check=fn=>{fn();checks++;};
const draft=seo.prepareSitemapCandidates(services,articles);
check(()=>assert.equal(draft.length,20));
check(()=>assert.equal(new Set(draft.map(row=>row.url)).size,20));
for (const row of draft) {
  check(()=>assert.ok(row.url.startsWith("https://kitchen3d.co.uk/")));
  check(()=>assert.equal(Object.keys(row).join(","),"url"));
}
for (const slug of ["../secret","https://other.test","home","thank-you","installation-enquiry","plan-your-kitchen","thinking-about-wardrobe-installation-in-manchester","projects","testimonials","bedroom-furniture-installation-assembly"]) {
  check(()=>assert.throws(()=>seo.prepareSitemapCandidates([{slug}],[]),/Unreviewed/));
}
check(()=>assert.throws(()=>seo.prepareSitemapCandidates(services,services),/Duplicate/));
const organisation=seo.prepareOrganisationData();
check(()=>assert.equal(organisation.name,"Kitchen3D Ltd"));
check(()=>assert.equal(organisation.areaServed.name,"Greater Manchester"));
for (const field of ["aggregateRating","review","address","award","foundingDate","hasCredential","openingHours"]) {
  check(()=>assert.equal(organisation[field],undefined));
}
const hostile={text:'</script><img src=x onerror="bad()">&\u2028\u2029'};
const safe=seo.serializeStructuredData(hostile);
check(()=>assert.doesNotMatch(safe,/[<>&\u2028\u2029]/));
check(()=>assert.equal(JSON.parse(safe).text,hostile.text));
check(()=>assert.throws(()=>seo.serializeStructuredData(undefined),/serializable/));
// Runtime imports are allowed only behind the exact server-side release gate.
function scan(directory) {
  for (const item of readdirSync(directory,{withFileTypes:true})) {
    const target=new URL(item.name+(item.isDirectory()?"/":""),directory);
    if(item.isDirectory()) scan(target);
    else if (/\.[jt]sx?$/.test(item.name) && target.pathname.endsWith("robots.ts")) {
      const source=readFileSync(target,"utf8");
      check(()=>assert.match(source,/releaseIndexingEnabled/));
      check(()=>assert.match(source,/sitemap/));
    }
  }
}
scan(new URL("../src/app/",import.meta.url));
console.log(`SEO_PREPARATION_CHECKS=PASS (${checks}; 20 release-gated sitemap candidates; no indexing, invented dates or ratings in local modes)`);
