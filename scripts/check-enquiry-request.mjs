import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

// Only synthetic in-memory requests and streams. No HTTP calls, real timers,
// customer data, credentials, uploads or writes to any external system.
const root = new URL("../", import.meta.url);
const sourcePath = new URL("src/lib/enquiries/request-boundary.ts", root);
const source = await readFile(sourcePath, "utf8");
const activity = { network: 0, logs: 0, timersCreated: 0 };
const timers = new Map();
let timerId = 0;
const forbiddenNetwork = () => { activity.network++; throw new Error("Forbidden network access"); };
const forbiddenLog = () => { activity.logs++; throw new Error("Forbidden request logging"); };
const compiledModule = { exports: {} };
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
vm.runInNewContext(compiled.outputText, {
  module: compiledModule,
  exports: compiledModule.exports,
  URL, Uint8Array, TextDecoder,
  setTimeout: (callback, duration) => {
    assert.equal(duration, 10_000, "The only timer must be the fixed 10-second read deadline");
    activity.timersCreated++;
    timers.set(++timerId, callback);
    return timerId;
  },
  clearTimeout: id => timers.delete(id),
  fetch: forbiddenNetwork,
  XMLHttpRequest: forbiddenNetwork,
  WebSocket: forbiddenNetwork,
  console: { log: forbiddenLog, info: forbiddenLog, warn: forbiddenLog, error: forbiddenLog, debug: forbiddenLog },
  require: () => { throw new Error("Request boundary must not import dependencies"); },
}, { filename: fileURLToPath(sourcePath) });

const { readEnquiryJson, ENQUIRY_JSON_MAX_BYTES, ENQUIRY_JSON_READ_TIMEOUT_MS } = compiledModule.exports;
const origin = "https://kitchen3d.example";
const encoder = new TextEncoder();
const copy = value => JSON.parse(JSON.stringify(value));
let checks = 0;

async function check(name, test) {
  try {
    await test();
    assert.equal(timers.size, 0, "Every result must clear its read deadline");
    checks++;
  } catch (error) {
    throw new Error(`Enquiry request check failed: ${name}`, { cause: error });
  }
}

function bytes(value) { return encoder.encode(value); }
function streamOf(chunks, cancel) {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) controller.enqueue(chunks[index++]);
      else controller.close();
    },
    cancel,
  }, { highWaterMark: 0 });
}
function request({ body = "{}", method = "POST", headers = {}, url = `${origin}/api/enquiries` } = {}) {
  const requestHeaders = new Headers({ origin, "content-type": "application/json" });
  for (const [name, value] of Object.entries(headers)) {
    if (value === null) requestHeaders.delete(name);
    else requestHeaders.set(name, value);
  }
  return new Request(url, {
    method, headers: requestHeaders,
    ...(method === "GET" || method === "HEAD" || body === null ? {} : { body, duplex: "half" }),
  });
}
async function rejects(input, code, trusted = origin) {
  assert.deepEqual(copy(await readEnquiryJson(input, trusted)), { ok: false, error: code });
}
async function accepts(input, expected = {}, trusted = origin) {
  assert.deepEqual(copy(await readEnquiryJson(input, trusted)), { ok: true, value: expected });
}
function expireTimers() {
  assert.equal(timers.size, 1, "A read uses exactly one deadline");
  for (const callback of [...timers.values()]) callback();
}

await check("fixed byte and deadline limits", () => {
  assert.equal(ENQUIRY_JSON_MAX_BYTES, 32_768);
  assert.equal(ENQUIRY_JSON_READ_TIMEOUT_MS, 10_000);
});

for (const trusted of [origin, "https://example.com:9443", "http://localhost:3100", "http://127.0.0.1:3100", "http://[::1]:3100"]) {
  await check(`accepts explicit canonical origin ${trusted}`, () => accepts(request({ headers: { origin: trusted } }), {}, trusted));
}
for (const trusted of ["", "null", "*", "https://example.com/", "https://example.com/path", "https://example.com?x=1", "https://example.com#x", "https://user:pass@example.com", "HTTPS://example.com", "https://EXAMPLE.com", "https://example.com:443", "http://example.com", "http://192.168.1.2:3100", "http://0.0.0.0:3100", "http://localhost.evil.example", "http://127.1:3100", "ftp://example.com", "file:///tmp/data", "https://example.com https://other.example", undefined, null, 42]) {
  await check(`rejects noncanonical/untrusted origin configuration ${String(trusted)}`, async () => {
    assert.deepEqual(copy(await readEnquiryJson(request(), trusted)), { ok: false, error: "INVALID_TRUSTED_ORIGIN" });
  });
}
for (const method of ["GET", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
  await check(`rejects method ${method}`, () => rejects(request({ method }), "METHOD_NOT_ALLOWED"));
}
for (const value of [null, "null", "*", "https://attacker.example", `${origin}/`, `${origin}:443`, "https://KITCHEN3D.example", `${origin} https://other.example`]) {
  await check(`requires exact Origin header ${String(value)}`, () => rejects(request({ headers: { origin: value } }), "ORIGIN_NOT_ALLOWED"));
}
await check("Host and forwarded headers cannot establish trust", () => rejects(request({ headers: {
  origin: "https://attacker.example", host: "kitchen3d.example", "x-forwarded-host": "kitchen3d.example", "x-forwarded-proto": "https",
} }), "ORIGIN_NOT_ALLOWED"));
await check("request URL and Host are not used as trusted configuration", () => accepts(request({ url: "https://other.example/api/enquiries", headers: { host: "other.example" } })));

for (const media of ["application/json", "APPLICATION/JSON", "application/json;charset=utf-8", "application/json; charset=UTF-8", "application/json; charset=\"utf-8\"", "application/json \t; charset = utf-8"]) {
  await check(`accepts supported JSON media type ${media}`, () => accepts(request({ headers: { "content-type": media } })));
}
for (const media of [null, "", "text/plain", "application/x-www-form-urlencoded", "multipart/form-data", "application/problem+json", "application/jsonp", "application/json; charset=utf8", "application/json; charset=latin1", "application/json; boundary=x", "application/json; charset=utf-8; charset=utf-8", "application/json;", "application/json, application/json"]) {
  await check(`rejects unsupported media type ${String(media)}`, () => rejects(request({ headers: { "content-type": media } }), "UNSUPPORTED_MEDIA_TYPE"));
}
for (const encoding of [null, "identity", "IDENTITY"]) {
  await check(`accepts uncompressed encoding ${String(encoding)}`, () => accepts(request({ headers: { "content-encoding": encoding } })));
}
for (const encoding of ["", "gzip", "br", "deflate", "compress", "identity, gzip", "identity, identity", "unknown"]) {
  await check(`rejects unsupported/compressed encoding ${encoding}`, () => rejects(request({ headers: { "content-encoding": encoding } }), "UNSUPPORTED_CONTENT_ENCODING"));
}

for (const length of [null, "2", "0002"]) {
  await check(`accepts valid Content-Length ${String(length)}`, () => accepts(request({ headers: { "content-length": length } })));
}
for (const length of ["", "-1", "+2", "2.0", "2e0", "0x2", "2,2", "2, 2", "two", "9007199254740992", "9".repeat(100)]) {
  await check(`rejects malformed Content-Length ${length}`, () => rejects(request({ headers: { "content-length": length } }), "INVALID_CONTENT_LENGTH"));
}
await check("rejects oversized declared body before reading", async () => {
  let reads = 0;
  const body = new ReadableStream({ pull() { reads++; } }, { highWaterMark: 0 });
  await rejects(request({ body, headers: { "content-length": "32769" } }), "BODY_TOO_LARGE");
  assert.equal(reads, 0);
  assert.equal(body.locked, false);
});
for (const length of ["0", "1", "3", "32768"]) {
  await check(`rejects actual/declaration mismatch ${length}`, () => rejects(request({ headers: { "content-length": length } }), "CONTENT_LENGTH_MISMATCH"));
}
await check("Content-Length counts UTF-8 bytes rather than characters", () => accepts(request({ body: '"é"', headers: { "content-length": "4" } }), "é"));
await check("character-count Content-Length does not pass", () => rejects(request({ body: '"é"', headers: { "content-length": "3" } }), "CONTENT_LENGTH_MISMATCH"));

await check("accepts exactly 32 KiB ASCII JSON", () => accepts(request({ body: JSON.stringify("a".repeat(32_766)) }), "a".repeat(32_766)));
await check("accepts exactly 32 KiB multibyte JSON", () => accepts(request({ body: JSON.stringify("é".repeat(16_383)) }), "é".repeat(16_383)));
await check("enforces multibyte byte limit without Content-Length", () => rejects(request({ body: JSON.stringify("é".repeat(16_384)) }), "BODY_TOO_LARGE"));
await check("understated length cannot bypass streamed byte cap", () => rejects(request({ body: JSON.stringify("a".repeat(32_767)), headers: { "content-length": "1" } }), "BODY_TOO_LARGE"));
await check("enforces cumulative bytes across chunks", () => rejects(request({ body: streamOf([bytes('"'), bytes("a".repeat(16_384)), bytes("a".repeat(16_383)), bytes('"')]) }), "BODY_TOO_LARGE"));
await check("supports split UTF-8 sequences across byte-sized chunks", () => {
  const value = { message: "سلام 🔧 é" };
  return accepts(request({ body: streamOf([...bytes(JSON.stringify(value))].map(byte => new Uint8Array([byte]))) }), value);
});
await check("valid encoded replacement character is not a decoding error", () => accepts(request({ body: JSON.stringify("�") }), "�"));
for (const sequence of [[0xff], [0xc0, 0xaf], [0xe0, 0x80, 0x80], [0xed, 0xa0, 0x80], [0xf5, 0x80, 0x80, 0x80], [0xe2, 0x82]]) {
  await check(`strict UTF-8 rejects ${sequence.join("-")}`, () => rejects(request({ body: streamOf([new Uint8Array(sequence)]) }), "INVALID_UTF8"));
}
await check("rejects trailing incomplete UTF-8 after otherwise valid JSON", () => rejects(request({ body: streamOf([bytes("{}"), new Uint8Array([0xe2])]) }), "INVALID_UTF8"));

await check("rejects absent request body", () => rejects(request({ body: null }), "EMPTY_BODY"));
await check("rejects empty string body", () => rejects(request({ body: "" }), "EMPTY_BODY"));
await check("rejects empty readable stream", () => rejects(request({ body: streamOf([]) }), "EMPTY_BODY"));
for (const body of [" ", "{", "[1,]", '{"sensitive":"synthetic-private-value",}', "undefined", "NaN", "{}{}"] ) {
  await check("returns fixed error for invalid JSON without revealing text", () => rejects(request({ body }), "INVALID_JSON"));
}
for (const value of [null, true, false, 123, "synthetic", [1, 2], { nested: { a: true } }]) {
  await check("JSON envelope accepts unknown values for later semantic validation", () => accepts(request({ body: JSON.stringify(value) }), value));
}

await check("refuses already consumed body", async () => {
  const input = request();
  await input.text();
  await rejects(input, "BODY_UNREADABLE");
});
await check("refuses locked body without releasing another owner's reader", async () => {
  const input = request();
  const otherReader = input.body.getReader();
  try {
    await rejects(input, "BODY_UNREADABLE");
    assert.equal(input.body.locked, true);
  } finally {
    otherReader.releaseLock();
  }
});
await check("errored stream exception is never exposed", () => rejects(request({ body: new ReadableStream({
  start(controller) { controller.error(new Error("synthetic-secret-error")); },
}) }), "BODY_UNREADABLE"));
await check("a stream error after a JSON prefix is still unreadable", () => {
  let calls = 0;
  return rejects(request({ body: new ReadableStream({ pull(controller) {
    if (calls++ === 0) controller.enqueue(bytes("{"));
    else controller.error(new Error("synthetic-secret-error"));
  } }, { highWaterMark: 0 }) }), "BODY_UNREADABLE");
});
for (const badChunk of ["{}", null, 4, new ArrayBuffer(2), new DataView(new ArrayBuffer(2))]) {
  await check("rejects malformed non-byte stream chunk", () => rejects(request({ body: streamOf([badChunk]) }), "BODY_UNREADABLE"));
}
await check("tolerates bounded empty chunks", () => accepts(request({ body: streamOf([...Array.from({ length: 32 }, () => new Uint8Array()), bytes("{}")]) })));
await check("no-progress empty chunk stream is bounded without relying on timer scheduling", () => rejects(request({ body: new ReadableStream({
  pull(controller) { controller.enqueue(new Uint8Array()); },
}, { highWaterMark: 0 }) }), "BODY_UNREADABLE"));

await check("stalled read times out and releases the stream lock", async () => {
  let cancelled = 0;
  const body = new ReadableStream({ cancel() { cancelled++; } }, { highWaterMark: 0 });
  const pending = readEnquiryJson(request({ body }), origin);
  expireTimers();
  assert.deepEqual(copy(await pending), { ok: false, error: "READ_TIMEOUT" });
  assert.equal(cancelled, 1);
  assert.equal(body.locked, false);
});
await check("partial progress does not reset the total deadline", async () => {
  let sent = false;
  const before = activity.timersCreated;
  const body = new ReadableStream({ pull(controller) {
    if (!sent) { sent = true; controller.enqueue(bytes("{")); }
  } }, { highWaterMark: 0 });
  const pending = readEnquiryJson(request({ body }), origin);
  for (let step = 0; step < 8; step++) await Promise.resolve();
  assert.equal(sent, true);
  assert.equal(activity.timersCreated - before, 1);
  expireTimers();
  assert.deepEqual(copy(await pending), { ok: false, error: "READ_TIMEOUT" });
  assert.equal(body.locked, false);
});
for (const cancelMode of ["never", "reject", "throw"]) {
  await check(`hostile ${cancelMode} cancellation cannot delay size failure`, async () => {
    let cancelled = 0;
    const body = streamOf([new Uint8Array(32_769)], () => {
      cancelled++;
      if (cancelMode === "never") return new Promise(() => {});
      if (cancelMode === "reject") return Promise.reject(new Error("synthetic-private-cancel"));
      throw new Error("synthetic-private-cancel");
    });
    await rejects(request({ body }), "BODY_TOO_LARGE");
    assert.equal(cancelled, 1);
    assert.equal(body.locked, false);
  });
}
await check("never-settling cancellation cannot delay timeout result", async () => {
  let cancelled = 0;
  const body = new ReadableStream({ cancel() { cancelled++; return new Promise(() => {}); } }, { highWaterMark: 0 });
  const pending = readEnquiryJson(request({ body }), origin);
  expireTimers();
  assert.deepEqual(copy(await pending), { ok: false, error: "READ_TIMEOUT" });
  assert.equal(cancelled, 1);
  assert.equal(body.locked, false);
});
await check("completed stream is released without unnecessary cancellation", async () => {
  let cancelled = 0;
  const body = streamOf([bytes("{}")], () => { cancelled++; });
  await accepts(request({ body }));
  assert.equal(cancelled, 0);
  assert.equal(body.locked, false);
});
await check("hostile cleanup exceptions do not replace the fixed error", async () => {
  let released = false;
  await rejects({ method: "POST", headers: request().headers, bodyUsed: false, body: { getReader: () => ({
    read: async () => ({ value: new Uint8Array(32_769), done: false }),
    cancel: () => { throw new Error("synthetic-private-cancel"); },
    releaseLock: () => { released = true; throw new Error("synthetic-private-release"); },
  }) } }, "BODY_TOO_LARGE");
  assert.equal(released, true);
});

await check("inactive endpoint does not import or invoke the prepared request parser", async () => {
  const route = await readFile(new URL("src/app/api/enquiries/route.ts", root), "utf8");
  assert.doesNotMatch(route, /request-boundary|readEnquiryJson/);
  assert.match(route, /503/);
});
await check("module has no external dependencies, network calls or logs", () => {
  assert.doesNotMatch(source, /^import\s/m);
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
  assert.doesNotMatch(source, /\bconsole\s*\./);
  assert.equal(activity.network, 0);
  assert.equal(activity.logs, 0);
});

console.log(`Enquiry request checks passed: ${checks}. Network calls: ${activity.network}. Logs: ${activity.logs}. Real timer waits: 0. Live endpoint: unchanged and disabled.`);
