import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRequire } from "node:module";
const loaded = { exports: {} };
const file = new URL("../src/lib/article-body.ts", import.meta.url);
vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { module: loaded, exports: loaded.exports });
const { parseArticleBody } = loaded.exports;
let checks = 0;
const valid = {version:1,reviewState:"approved",blocks:[{type:"paragraph",text:"A kitchen project."}]};
for (const input of ["", "not json", "<p>raw HTML</p>", "null", "[]", "{}", "x".repeat(200001), JSON.stringify({...valid,reviewState:"pending"}), JSON.stringify({...valid,blocks:[]}), JSON.stringify({...valid,html:"<script>"}), JSON.stringify({...valid,blocks:Array(251).fill(valid.blocks[0])})]) {
  assert.equal(parseArticleBody(input),null); checks++;
}
for (const block of [{type:"script",text:"bad"},{type:"paragraph",text:""},{type:"paragraph",text:"x".repeat(10001)},{type:"paragraph",text:"\u0000"},{type:"paragraph",text:"ok",href:"javascript:bad"},null,[]]) {
  assert.equal(parseArticleBody(JSON.stringify({...valid,blocks:[block]})),null); checks++;
}
for (const type of ["paragraph","heading","list-item"]) {
  assert.equal(parseArticleBody(JSON.stringify({...valid,blocks:[{type,text:"  Text & more  "}]}))[0].text,"Text & more"); checks++;
}
// React must escape text, never reinterpret it as HTML or pass attributes through.
const route = readFileSync(new URL("../src/app/[slug]/page.tsx",import.meta.url),"utf8");
assert.doesNotMatch(route,/dangerouslySetInnerHTML|href=\{post\.link\}/); checks++;
assert.match(route,/parseArticleBody\(post.bodyJson\)/); checks++;
const require = createRequire(import.meta.url);
let fixtureBody = JSON.stringify(valid);
let reads = 0;
const heldSlug = "thinking-about-wardrobe-installation-in-manchester";
function compile(relative, mocks) {
  const result = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(relative,import.meta.url),"utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(`(function(module,exports,require){${code}\n})`) (result,result.exports,id => {
    if (id in mocks) return mocks[id];
    if (id === "react/jsx-runtime") return require(id);
    if (id === "next/link") return function LinkMock({children,...props}) { return React.createElement("a",props,children); };
    throw new Error("Unexpected module " + id);
  });
  return result.exports;
}
const routing = compile("../src/lib/migration-routes.ts",{});
const releaseMetadata = compile("../src/lib/release-metadata.ts",{});
const api = {getPageBySlug:async()=>{reads++; return null;},getAllPages:async()=>[],getPostBySlug:async()=>null,getAllPosts:async()=>{
  reads++;
  return [{slug:"article-test",title:"Sample",date:"2026-09-17",excerpt:"",bodyJson:fixtureBody,link:"javascript:bad"},{slug:heldSlug,title:"Held wardrobe",bodyJson:fixtureBody}];
}};
const pageBody = compile("../src/lib/page-body.ts",{});
const page = compile("../src/app/[slug]/page.tsx",{"@/lib/service-pages":api,"@/lib/articles":api,"@/lib/migration-routes":routing,"@/lib/release-metadata":releaseMetadata,"@/lib/article-body":loaded.exports,"@/lib/page-body":pageBody,"next/navigation":{notFound(){throw new Error("NOT_FOUND");}}});
fixtureBody = JSON.stringify({...valid,blocks:[{type:"heading",text:"Article heading"},{type:"paragraph",text:'<img src=x onerror="bad()">'},{type:"list-item",text:"A list item"}]});
let html = renderToStaticMarkup(await page.default({params:{slug:"article-test"}}));
assert.match(html,/<h2>Article heading<\/h2>/); checks++;
assert.match(html,/&lt;img/); checks++;
assert.doesNotMatch(html,/<img|<script|javascript:|Held wardrobe/); checks++;
fixtureBody = JSON.stringify({...valid,reviewState:"pending"});
html = renderToStaticMarkup(await page.default({params:{slug:"article-test"}}));
assert.match(html,/being prepared for the new website/); checks++;
assert.doesNotMatch(html,/A kitchen project/); checks++;
const before = reads;
await assert.rejects(page.default({params:{slug:heldSlug}}),/NOT_FOUND/); checks++;
assert.equal(reads,before); checks++;
for (const slug of ["projects","testimonials","bedroom-furniture-installation-assembly"]) {
  const beforeHold = reads;
  await assert.rejects(page.default({params:Promise.resolve({slug})}),/NOT_FOUND/); checks++;
  assert.equal(reads,beforeHold); checks++;
  const metadata = await page.generateMetadata({params:Promise.resolve({slug})});
  assert.equal(metadata.robots.index,false); checks++;
  assert.equal(reads,beforeHold); checks++;
}
const blogs = compile("../src/app/blogs/page.tsx",{"@/lib/articles":api,"@/lib/migration-routes":routing});
assert.doesNotMatch(renderToStaticMarkup(await blogs.default()),/Held wardrobe/); checks++;
const editorial = compile("../src/lib/articles.ts",{"./wix":{getAllPosts:async()=>[]},"./migration-routes":routing});
assert.equal(editorial.revisedArticles.length,6); checks++;
for (const article of editorial.revisedArticles) {
  assert.ok(parseArticleBody(article.bodyJson)); checks++;
  assert.doesNotMatch(article.bodyJson,/design-only|3D visual|guaranteed|planning permission is|required only|return on investment/i); checks++;
}
console.log(`ARTICLE_BODY_CHECKS=PASS (${checks}; includes server rendering; no network; publication approval not inferred)`);
