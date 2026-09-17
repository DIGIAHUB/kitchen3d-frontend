// Synthetic-only contract checks. Never import the app in the host process or read .env.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/wix.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const siteId = "543768f5-be18-4f7c-bb3b-380f4b05c925";
const secret = "SYNTHETIC_SECRET_MUST_NOT_APPEAR_IN_ERRORS";
const pages = "Kitchen3DPages";
const posts = "Kitchen3DBlogPosts";
let checks = 0;
let requests = 0;
let logs = 0;
const realFetch = globalThis.fetch;
globalThis.fetch = () => { throw new Error("Real network is forbidden"); };

function load({ env = { WIX_SITE_ID: siteId, WIX_API_KEY: secret }, response, fetch: fakeFetch } = {}) {
  const timers = [];
  const calls = [];
  const compiledModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: compiledModule,
    exports: compiledModule.exports,
    process: { env },
    AbortController,
    setTimeout(callback, delay) {
      const timer = { callback, delay, cleared: false };
      timers.push(timer);
      return timer;
    },
    clearTimeout(timer) { if (timer) timer.cleared = true; },
    console: new Proxy({}, { get: () => () => { logs++; throw new Error("CMS logging is forbidden"); } }),
    require() { throw new Error("Module imports are forbidden in the CMS test sandbox"); },
    fetch: async (url, init) => {
      requests++;
      calls.push({ url, init, body: JSON.parse(init.body) });
      assert.equal(url, "https://www.wixapis.com/wix-data/v2/items/query");
      assert.equal(init.method, "POST");
      assert.equal(init.headers["wix-site-id"], siteId);
      assert.equal(init.headers.Authorization, secret);
      assert.equal(init.headers["Content-Type"], "application/json");
      assert.equal(init.redirect, "error");
      assert.equal(init.next.revalidate, 3600);
      assert.ok(init.signal instanceof AbortSignal);
      assert.ok([pages, posts].includes(calls.at(-1).body.dataCollectionId));
      if (fakeFetch) return fakeFetch(calls.at(-1), calls.length);
      if (response === undefined) throw new Error("An explicit synthetic response is required");
      return { ok: true, json: async () => response };
    },
  }, { filename: "src/lib/wix.ts", timeout: 1000 });
  return { api: compiledModule.exports, calls, timers };
}

async function check(name, test) {
  try { await test(); checks++; }
  catch (error) { throw new Error(`CMS check failed: ${name}`, { cause: error }); }
}

function item(index = 1, collection = pages, data = {}) {
  return {
    id: `item-${index}`,
    dataCollectionId: collection,
    data: { _id: `item-${index}`, slug: `slug-${index}`, title: `Title ${index}`, wpId: index, link: `https://example.invalid/${index}`, ...data },
  };
}

async function expectInvalid(response, method = "getAllPages") {
  const { api, timers } = load({ response });
  await assert.rejects(api[method](), { message: "Invalid Wix CMS response" });
  assert.ok(timers.every((timer) => timer.cleared));
}

function list(total, collection = pages, metadata = true) {
  return load({ fetch: ({ body }) => {
    const { limit, offset } = body.query.paging;
    const dataItems = Array.from({ length: Math.min(limit, total - offset) }, (_, index) => item(offset + index + 1, collection));
    return { ok: true, json: async () => ({
      dataItems,
      ...(metadata ? { pagingMetadata: { count: dataItems.length, offset, total, hasNext: offset + dataItems.length < total } } : {}),
    }) };
  } });
}

try {
  for (const env of [{ K3D_LOCAL_PREVIEW: "1" }, { K3D_LOCAL_PREVIEW: "1", WIX_SITE_ID: "wrong-site", WIX_API_KEY: secret }]) {
    await check("exact offline gate precedes credentials and site gate for all four readers", async () => {
      const { api, calls, timers } = load({ env });
      assert.equal((await api.getAllPages()).length, 0);
      assert.equal((await api.getAllPosts()).length, 0);
      assert.equal(await api.getPageBySlug("home"), null);
      assert.equal(await api.getPostBySlug("post"), null);
      assert.equal(calls.length, 0);
      assert.equal(timers.length, 0);
    });
  }
  for (const env of [{}, { WIX_SITE_ID: siteId }, { WIX_API_KEY: secret }, { K3D_LOCAL_PREVIEW: "true" }]) {
    await check("missing credential error remains unchanged", async () => {
      const { api, calls, timers } = load({ env });
      await assert.rejects(api.getAllPages(), { message: "Missing WIX_SITE_ID or WIX_API_KEY environment variables" });
      assert.equal(calls.length, 0);
      assert.equal(timers.length, 0);
    });
  }
  for (const method of ["getAllPages", "getAllPosts", "getPageBySlug", "getPostBySlug"]) {
    for (const wrongSite of ["different-site", ` ${siteId}`, siteId.toUpperCase()]) {
      await check(`${method}: reject wrong site before fetch`, async () => {
        const { api, calls, timers } = load({ env: { WIX_SITE_ID: wrongSite, WIX_API_KEY: secret } });
        await assert.rejects(api[method]("slug-1"), { message: "WIX_SITE_ID must match the Kitchen3D site" });
        assert.equal(calls.length, 0);
        assert.equal(timers.length, 0);
      });
    }
  }
  for (const method of ["getAllPages", "getAllPosts", "getPageBySlug", "getPostBySlug"]) {
    await check(`${method}: empty native collection`, async () => {
      const { api, calls, timers } = load({ response: { dataItems: [], pagingMetadata: { count: 0, offset: 0, total: 0, hasNext: false } } });
      const result = await api[method]("missing");
      assert.ok(result === null || result.length === 0);
      assert.equal(calls.length, 1);
      assert.equal(timers[0].delay, 10_000);
      assert.equal(timers[0].cleared, true);
    });
  }
  await check("page maps required and optional values without leaking extra fields", async () => {
    const { api } = load({ response: { dataItems: [item(1, pages, { seoTitle: "SEO", heroSubtitle: "Hero", note: null, extra: secret })] } });
    const page = await api.getPageBySlug("slug-1");
    assert.equal(page.id, "item-1");
    assert.equal(page.wpId, 1);
    assert.equal(page.seoTitle, "SEO");
    assert.equal(page.heroSubtitle, "Hero");
    assert.equal(page.note, "");
    assert.equal(page.modified, "");
    assert.equal(page.bodyJson, "");
    assert.equal(Object.keys(page).length, 11);
    assert.ok(!JSON.stringify(page).includes(secret));
  });
  await check("post mapping preserves public interface and date strings", async () => {
    const data = { date: "2026-09-01", modified: "2026-09-02", excerpt: "Excerpt", bodyJson: "[]" };
    const { api, calls } = load({ response: { dataItems: [item(1, posts, data)] } });
    const post = await api.getPostBySlug("slug-1");
    for (const [key, value] of Object.entries(data)) assert.equal(post[key], value);
    assert.equal(Object.keys(post).length, 11);
    assert.deepEqual(calls[0].body.query, { filter: { slug: { $eq: "slug-1" } }, paging: { limit: 1, offset: 0 } });
  });
  for (const [method, collection] of [["getPageBySlug", pages], ["getPostBySlug", posts]]) {
    await check(`${method}: mismatched slug response is rejected`, async () => {
      const { api } = load({ response: { dataItems: [item(1, collection)] } });
      await assert.rejects(api[method]("different-slug"), { message: "Invalid Wix CMS response" });
    });
  }
  for (const response of [null, false, [], {}, { dataItems: null }, { dataItems: {} }, { dataItems: [null] }, { dataItems: [{}] }, { dataItems: [item(), item()] }]) {
    await check("malformed envelope or duplicate native item is rejected", () => expectInvalid(response));
  }
  for (const patch of [{ id: "" }, { id: " " }, { id: "x".repeat(129) }, { id: 1 }, { dataCollectionId: posts }, { dataCollectionId: undefined }, { data: null }, { data: [] }, { data: {} }]) {
    await check("invalid native identity, scope, or payload is rejected", () => expectInvalid({ dataItems: [{ ...item(), ...patch }] }));
  }
  for (const [key, value] of [
    ["_id", "mismatch"], ["slug", 10], ["title", null], ["link", {}], ["wpId", "1"], ["wpId", -1],
    ["wpId", 1.5], ["wpId", Number.NaN], ["wpId", Number.POSITIVE_INFINITY], ["wpId", Number.MAX_SAFE_INTEGER + 1],
    ["modified", false], ["seoTitle", 1], ["metaDescription", []], ["bodyJson", {}], ["heroSubtitle", 0], ["note", false],
  ]) {
    await check(`invalid mapped ${key} value is rejected`, () => expectInvalid({ dataItems: [item(1, pages, { [key]: value })] }));
  }
  for (const key of ["date", "excerpt"]) {
    await check(`invalid post ${key} value is rejected`, () => expectInvalid({ dataItems: [item(1, posts, { [key]: {} })] }, "getAllPosts"));
  }
  for (const metadata of [null, [], { count: "1" }, { count: -1 }, { count: 2 }, { offset: 1 }, { offset: 0.5 }, { total: -1 }, { total: "1" }, { total: 0 }, { hasNext: "false" }, { total: 1, hasNext: true }, { total: 2, hasNext: false }]) {
    await check("malformed or contradictory metadata is rejected", () => expectInvalid({ dataItems: [item()], pagingMetadata: metadata }));
  }
  await check("empty non-terminal batch is rejected", () => expectInvalid({ dataItems: [], pagingMetadata: { hasNext: true } }));
  await check("oversized response batch is rejected", () => expectInvalid({ dataItems: Array.from({ length: 101 }, (_, index) => item(index)) }));
  for (const [method, collection, total] of [["getAllPages", pages, 151], ["getAllPosts", posts, 121]]) {
    await check(`${method}: read beyond old 50/20 limit and preserve ordering`, async () => {
      const { api, calls, timers } = list(total, collection);
      const result = await api[method]();
      assert.equal(result.length, total);
      assert.equal(result.at(-1).id, `item-${total}`);
      assert.deepEqual(calls.map(({ body }) => body.query.paging.offset), [0, 100]);
      if (collection === posts) assert.deepEqual(calls.map(({ body }) => body.query.sort), Array(2).fill([{ fieldName: "date", order: "DESC" }]));
      assert.ok(timers.every((timer) => timer.cleared));
    });
  }
  for (const total of [99, 100, 101, 200]) {
    await check(`metadata-free paging reads ${total} and probes a full final batch`, async () => {
      const { api, calls } = list(total, pages, false);
      assert.equal((await api.getAllPages()).length, total);
      assert.equal(calls.length, Math.floor(total / 100) + 1);
    });
  }
  await check("short batch with explicit hasNext continues", async () => {
    const { api, calls } = load({ fetch: ({ body }, count) => ({ ok: true, json: async () => ({
      dataItems: [item(count)], pagingMetadata: { count: 1, offset: body.query.paging.offset, hasNext: count < 3 },
    }) }) });
    assert.equal((await api.getAllPages()).length, 3);
    assert.deepEqual(calls.map(({ body }) => body.query.paging.offset), [0, 1, 2]);
  });
  await check("known total continues short pages even if later metadata omits total", async () => {
    const { api } = load({ fetch: (_, count) => ({ ok: true, json: async () => ({
      dataItems: [item(count)], ...(count === 1 ? { pagingMetadata: { total: 3 } } : {}),
    }) }) });
    assert.equal((await api.getAllPages()).length, 3);
  });
  await check("exact hard cap succeeds with verified terminal metadata", async () => {
    const { api, calls } = list(1000);
    assert.equal((await api.getAllPages()).length, 1000);
    assert.equal(calls.length, 10);
  });
  for (const metadata of [true, false]) {
    await check("over-cap collection fails instead of returning first 1000", async () => {
      const { api, calls } = list(1001, pages, metadata);
      await assert.rejects(api.getAllPages(), { message: "Wix CMS pagination safety limit reached" });
      assert.equal(calls.length, metadata ? 1 : 10);
    });
  }
  await check("many short continuation pages hit bounded request cap", async () => {
    const { api, calls } = load({ fetch: (_, count) => ({ ok: true, json: async () => ({ dataItems: [item(count)], pagingMetadata: { hasNext: true } }) }) });
    await assert.rejects(api.getAllPages(), { message: "Wix CMS pagination safety limit reached" });
    assert.equal(calls.length, 20);
  });
  await check("repeated page fails without silent deduplication or looping", async () => {
    const { api, calls } = load({ response: { dataItems: [item()], pagingMetadata: { hasNext: true } } });
    await assert.rejects(api.getAllPages(), { message: "Invalid Wix CMS response" });
    assert.equal(calls.length, 2);
  });
  await check("changing total count fails closed", async () => {
    const { api } = load({ fetch: (_, count) => ({ ok: true, json: async () => ({ dataItems: [item(count)], pagingMetadata: { total: count + 2 } }) }) });
    await assert.rejects(api.getAllPages(), { message: "Invalid Wix CMS response" });
  });
  for (const status of [301, 400, 401, 403, 404, 429, 500, 503]) {
    await check(`HTTP ${status} never reads or leaks error body`, async () => {
      let reads = 0;
      const { api, calls, timers } = load({ fetch: () => ({ ok: false, status,
        text: async () => { reads++; return secret; }, json: async () => { reads++; return { message: secret }; },
      }) });
      await assert.rejects(api.getAllPages(), { message: "Wix CMS request failed" });
      assert.equal(reads, 0);
      assert.equal(calls[0].init.signal.aborted, true);
      assert.ok(timers.every((timer) => timer.cleared));
    });
  }
  for (const fakeFetch of [() => { throw new Error(secret); }, () => ({ ok: true, json: async () => { throw new Error(secret); } })]) {
    await check("fetch and JSON errors are sanitized", async () => {
      const { api, timers } = load({ fetch: fakeFetch });
      await assert.rejects(api.getAllPages(), { message: "Wix CMS request failed" });
      assert.ok(timers.every((timer) => timer.cleared));
    });
  }
  for (const stage of ["fetch", "body"]) {
    await check(`timeout bounds ${stage} even if transport ignores abort`, async () => {
      const never = new Promise(() => {});
      const { api, calls, timers } = load({ fetch: () => stage === "fetch" ? never : { ok: true, json: () => never } });
      const pending = assert.rejects(api.getAllPages(), { message: "Wix CMS request timed out" });
      await Promise.resolve();
      assert.equal(timers[0].delay, 10_000);
      timers[0].callback();
      await pending;
      assert.equal(calls[0].init.signal.aborted, true);
      assert.equal(timers[0].cleared, true);
    });
  }
  await check("no explicit any or imports in server gateway", () => {
    assert.doesNotMatch(source, /\bany\b/);
    assert.doesNotMatch(source, /^import\s/m);
    assert.doesNotMatch(source, /console\./);
    assert.equal(logs, 0);
  });
  console.log(`WIX_CMS_CHECKS=PASS (${checks} synthetic cases; ${requests} intercepted requests)`);
  console.log("REAL_NETWORK_CALLS=0; CREDENTIAL_FILES_READ=0; CMS_LOGS=0; REMOTE_WRITES=0");
} finally {
  globalThis.fetch = realFetch;
}
