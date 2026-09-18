import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
let checks = 0;
function loader(env) {
  const cache = new Map();
  const sandbox = vm.createContext({ process: { env }, Intl, Date, console });
  function load(file) {
    if (file.endsWith(".css")) return {};
    if (!path.extname(file)) file += existsSync(file + ".tsx") ? ".tsx" : ".ts";
    if (cache.has(file)) return cache.get(file);
    const source = readFileSync(file, "utf8");
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
    const result = { exports: {} }; cache.set(file, result.exports);
    vm.runInContext("(function(module,exports,require){" + compiled.outputText + "\n})", sandbox)(
      result, result.exports, dependency => {
        if (["react", "react/jsx-runtime"].includes(dependency)) return require(dependency);
        if (dependency === "next/link") return function LinkMock({ children, ...props }) { return React.createElement("a", props, children); };
        if (dependency === "next/image") return function ImageMock({ fill, priority, ...props }) { return React.createElement("img", props); };
        if (dependency.startsWith("@/")) return load(path.join(root, "src", dependency.slice(2)));
        if (dependency.startsWith(".")) return load(path.resolve(path.dirname(file), dependency));
        throw new Error("Unexpected dependency: " + dependency);
      });
    return result.exports;
  }
  return file => load(path.join(root, file));
}
function check(name, run) { try { run(); checks++; } catch (cause) { throw new Error(name, { cause }); } }
for (const [label, env, preview, indexingEnabled] of [
  ["normal", {}, false, false],
  ["production", { VERCEL_ENV: "production" }, false, true],
  ["candidate", { VERCEL_ENV: "production", K3D_LOCAL_CANDIDATE: "1" }, false, false],
  ["preview", { VERCEL_ENV: "production", K3D_LOCAL_PREVIEW: "1" }, true, false],
  ["invalid flag", { K3D_LOCAL_PREVIEW: "true", K3D_LOCAL_CANDIDATE: "true" }, false, false],
]) {
  const load = loader(env);
  const layout = load("src/app/layout.tsx");
  check(label + " thank-you is not a receipt", () => {
    const page = load("src/app/thank-you/page.tsx");
    assert.equal(page.metadata.robots.index,false);
    const html = renderToStaticMarkup(React.createElement(page.default));
    assert.match(html,/does not confirm that a message was received/);
    assert.doesNotMatch(html,/successfully submitted|<form/);
  });
  check(label + " indexing policy", () => assert.equal(layout.metadata.robots.index, indexingEnabled));
  check(label + " approved homepage", () => {
    const Home = load("src/app/page.tsx").default;
    const html = renderToStaticMarkup(React.createElement(layout.default, null, React.createElement(Home)));
    assert.match(html, /A kitchen that/); assert.match(html, /Kitchen3D/);
    assert.match(html, preview ? /Local design preview/ : /Kitchen3D/);
    assert.match(html, /lang="en-GB"/);
    assert.doesNotMatch(html, /bg-yellow-400|Supply &amp; install or installation only/);
  });
  for (const route of ["installation-enquiry", "plan-your-kitchen"]) {
    check(label + " " + route, () => {
      const Page = load("src/app/" + route + "/page.tsx").default;
      const html = renderToStaticMarkup(React.createElement(Page));
      assert.match(html, /<h1>/);
      if (preview) {
        assert.match(html, /Try the journey with sample details/);
        assert.match(html, /<form/); assert.match(html, /<fieldset disabled/);
      } else {
        assert.match(html, /Send your enquiry securely/);
        assert.match(html, /<form/);
        assert.doesNotMatch(html, /Online enquiries and bookings are not available yet/);
      }
    });
  }
  for (const route of ["services", "about", "contact", "faqs"]) {
    check(label + " information " + route, () => {
      const page = load("src/app/" + route + "/page.tsx");
      const html = renderToStaticMarkup(React.createElement(page.default));
      assert.equal((html.match(/<h1>/g) ?? []).length, 1);
      assert.equal(page.metadata.robots, undefined);
      assert.equal(page.metadata.alternates.canonical, "https://kitchen3d.co.uk/" + route);
      assert.doesNotMatch(html, /<(?:form|input|textarea|select)\b|bg-yellow|fully insured/);
      assert.match(html, /href="tel:07882116895"/);
      if (route === "services") {
        for (const slug of ["kitchen-fitting-installation", "worktop-installation", "flooring-installation", "door-fitting", "plumbing-works", "electrical-works", "wall-floor-tiling", "sink-hob-fitting"]) assert.ok(html.includes('href="/' + slug + '"'));
      }
    });
  }
}
// Exercise the existing CMS module in a separate context; no real HTTP.
const cmsSource = readFileSync(path.join(root, "src/lib/wix.ts"), "utf8");
const cmsCompiled = ts.transpileModule(cmsSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const cmsModule = { exports: {} };
let network = 0;
vm.runInNewContext(cmsCompiled.outputText, { module: cmsModule, exports: cmsModule.exports,
  process: { env: { K3D_LOCAL_CANDIDATE: "1", WIX_API_KEY: "synthetic", WIX_SITE_ID: "wrong-site" } },
  fetch: () => { network++; throw new Error("Forbidden"); },
});
assert.equal((await cmsModule.exports.getAllPages()).length, 0);
assert.equal((await cmsModule.exports.getAllPosts()).length, 0);
assert.equal(await cmsModule.exports.getPageBySlug("home"), null);
assert.equal(await cmsModule.exports.getPostBySlug("test"), null);
assert.equal(network, 0);
console.log("PRODUCTION_SHELL_CHECKS=PASS (" + checks + " render checks plus four offline CMS operations)");
console.log("NO_CUSTOMER_INPUTS_IN_NORMAL_MODE; PREVIEW_RETAINED; NETWORK=0; INDEXING_IS_PRODUCTION_ONLY");
