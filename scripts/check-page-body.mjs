import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
function compile(relative, mocks = {}) {
  const result = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(relative, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(`(function(module,exports,require){${code}\n})`)(result, result.exports, id => {
    if (id in mocks) return mocks[id];
    if (id === "react/jsx-runtime") return require(id);
    if (id === "next/link") return function LinkMock({children, ...props}) { return React.createElement("a", props, children); };
    throw new Error("Unexpected module " + id);
  });
  return result.exports;
}
const parser = compile("../src/lib/page-body.ts");
let checks = 0;
const check = fn => { fn(); checks++; };
for (const body of ["", "bad", "null", "[]", "x".repeat(100001), ...[
  {service_includes: "bad"}, {service_includes: [null]}, {service_includes: {kitchen: "not a list"}},
  {service_includes: Array(51).fill("a")}, {service_includes: ["x".repeat(2001)]},
  {faq_sections: {}}, {sample_questions: ["bad\u0000text"]}, {sample_questions: []},
].map(JSON.stringify)]) check(() => assert.equal(parser.parsePageBody(body), null));
for (const body of [{service_includes:["Fitting"]}, {service_includes:{kitchen:["Fitting"]}}, {faq_sections:["Scope"],sample_questions:["What is included?"]}]) {
  check(() => assert.equal(JSON.stringify(parser.parsePageBody(JSON.stringify(body))), JSON.stringify(body)));
}
check(() => assert.equal(JSON.stringify(parser.parsePageBody(JSON.stringify({form:{fields:["secret"]},note:"internal",html:"<script>"}))), "{}"));
let fixture = {slug:"page-test",title:"Contact",heroSubtitle:"",bodyJson:""};
const page = compile("../src/app/[slug]/page.tsx", {
  "@/lib/service-pages": {getPageBySlug:async()=>fixture,getAllPages:async()=>[]},
  "@/lib/articles": {getAllPosts:async()=>[],getPostBySlug:async()=>null},
  "@/lib/migration-routes": compile("../src/lib/migration-routes.ts"),
  "@/lib/article-body": compile("../src/lib/article-body.ts"),
  "@/lib/page-body": parser,
  "next/navigation": {notFound(){throw new Error("NOT_FOUND");}},
});
for (const source of ["bad", JSON.stringify({service_includes:{bad:1}}), JSON.stringify({form:{fields:["Never render this field"]}})]) {
  fixture.bodyJson = source;
  const html = renderToStaticMarkup(await page.default({params:Promise.resolve({slug:fixture.slug})}));
  check(() => assert.match(html, /Online enquiries and bookings are not yet available/));
  check(() => assert.doesNotMatch(html, /<form|<input|Never render this field|Fill in your details|We collect:/));
  check(() => assert.match(html, /href="tel:07882116895"/));
}
fixture.bodyJson = JSON.stringify({service_includes:['<img src=x onerror="bad()">']});
let html = renderToStaticMarkup(await page.default({params:Promise.resolve({slug:fixture.slug})}));
check(() => assert.match(html, /&lt;img/));
check(() => assert.doesNotMatch(html, /<img|<script/));
fixture = {...fixture,slug:"thank-you",bodyJson:""};
await assert.rejects(page.default({params:Promise.resolve({slug:fixture.slug})}),/NOT_FOUND/); checks++;
let cmsReads = 0;
const services = compile("../src/lib/service-pages.ts", {"./wix": {
  getAllPages: async()=>[{slug:"plumbing-works",title:"Old claim"},{slug:"about",title:"About"}],
  getPageBySlug: async()=>{cmsReads++; return {slug:"about",title:"About"};},
}});
check(() => assert.equal(services.revisedServicePages.length,8));
check(() => assert.equal(new Set(services.revisedServicePages.map(item=>item.slug)).size,8));
for (const item of services.revisedServicePages) {
  check(() => assert.ok(parser.parsePageBody(item.bodyJson)));
  check(() => assert.ok(item.metaDescription.length > 40 && item.metaDescription.length < 220));
  check(() => assert.doesNotMatch(item.bodyJson,/guaranteed|fully insured|design-only|3D visualisations/i));
}
const merged = await services.getAllPages();
check(() => assert.equal(merged.length,9));
check(() => assert.equal(merged.filter(item=>item.slug==='plumbing-works').length,1));
check(() => assert.equal(merged.find(item=>item.slug==='plumbing-works').title,'Kitchen plumbing coordination'));
await services.getPageBySlug('plumbing-works');
check(() => assert.equal(cmsReads,0));
await services.getPageBySlug('about');
check(() => assert.equal(cmsReads,1));
console.log(`PAGE_BODY_CHECKS=PASS (${checks}; bounded text, malformed CMS, escaped markup, no phantom form or receipt; network=0)`);
