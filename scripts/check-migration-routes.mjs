import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const source = readFileSync(new URL("src/lib/migration-routes.ts", root), "utf8");
const loaded = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: loaded.exports, module: loaded });
const { isCmsSlug, migrationParams, cmsMetadata } = loaded.exports;
let checks = 0;
function check(fn) { fn(); checks++; }
for (const slug of ["../contact", "//evil.test", "https://evil.test", "contact?x=1", "contact#x", "Contact", "a%2fb", "a/b", "a\\b", "", "-a", "a-", "a--b", "a".repeat(181), "home", "blogs", "api", "_next", "installation-enquiry", "plan-your-kitchen", "services", "about", "contact", "faqs"]) {
  check(() => assert.equal(isCmsSlug(slug), false));
}
const readRecords = folder => readdirSync(new URL(folder + "/", root)).filter(name => name.endsWith(".json")).map(name => JSON.parse(readFileSync(new URL(`${folder}/${name}`, root), "utf8")));
const pages = readRecords("data/source-pages"), posts = readRecords("posts");
check(() => assert.equal(pages.length, 18));
check(() => assert.equal(posts.length, 7));
check(() => assert.equal(migrationParams(pages, posts).length, 14));
check(() => assert.equal(migrationParams(pages, posts).some(item => item.slug === "thinking-about-wardrobe-installation-in-manchester"), false));
for (const item of [...pages, ...posts].filter(item => !["home", "blogs", "services", "about", "contact", "faqs", "thank-you"].includes(item.slug))) {
  check(() => assert.equal(isCmsSlug(item.slug), true));
  check(() => {
    const metadata = cmsMetadata({ ...item, seoTitle: "  Specific title  ", metaDescription: "A useful description." });
    assert.equal(metadata.title, "Specific title");
    assert.equal(metadata.alternates.canonical, `https://kitchen3d.co.uk/${item.slug}`);
    assert.equal(metadata.robots.index, false);
    assert.equal(metadata.description, "A useful description.");
  });
}
check(() => assert.throws(() => migrationParams([{ slug: "door-fitting" }], [{ slug: "door-fitting" }]), /Conflicting/));
check(() => assert.throws(() => migrationParams([{ slug: "../bad" }], []), /Invalid/));
check(() => assert.equal(cmsMetadata({ slug: "door-fitting", title: "Doors", seoTitle: "<script>x</script>", metaDescription: "bad\ntext" }).title, "Doors"));
check(() => assert.equal(cmsMetadata({ slug: "door-fitting", title: "Doors", metaDescription: "<b>bad</b>" }).description, undefined));
check(() => assert.equal(cmsMetadata({ slug: "../bad", title: "Bad" }).alternates, undefined));
check(() => assert.equal(cmsMetadata({ slug: "door-fitting", title: "Doors", seoTitle: " " }).title, "Doors"));
console.log(`MIGRATION_ROUTE_CHECKS=PASS (${checks} checks; 18 page and 7 post source records; no network)`);
const missingBodies = posts.filter(post => !post.bodyJson && !post.content && !post.body);
console.log(`CONTENT_READINESS=HELD (${missingBodies.length}/7 saved article records have no full body; not a migration-completion pass)`);
