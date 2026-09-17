import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {mkdir, readFile, writeFile, lstat, realpath} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

// Explicit, local archive operation, never part of builds or deployment.
// Only public GETs to the existing Kitchen3D WordPress host. Never follow redirects.
assert.deepEqual(process.argv.slice(2),["--recover-public-variants"],"Explicit recovery flag required");
const origin = "https://kitchen3d.co.uk";
const sourceRoot = fileURLToPath(new URL("../media/files/",import.meta.url));
const archiveRoot = path.resolve(fileURLToPath(new URL("../media/continuity-files/",import.meta.url)));
const recorded = JSON.parse(await readFile(new URL("../media/media-index.json",import.meta.url),"utf8"));
const bytesLimit = 25 * 1024 * 1024;
async function boundedGet(url, limit) {
  const response = await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(20_000)});
  assert.equal(response.status,200,`Unexpected response for ${new URL(url).pathname}`);
  const chunks = [];
  let size = 0;
  try {
    for await (const chunk of response.body) {
      size += chunk.length;
      assert.ok(size <= limit,"Response exceeds byte limit");
      chunks.push(chunk);
    }
  } catch (error) { await response.body?.cancel().catch(()=>{}); throw error; }
  return {bytes:Buffer.concat(chunks),total:response.headers.get("x-wp-total")};
}
const observed = [];
const totals = [];
for (const page of [1,2]) {
  const result = await boundedGet(`${origin}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=id,source_url,media_details`,5*1024*1024);
  observed.push(...JSON.parse(result.bytes.toString("utf8")));
  totals.push(result.total);
}
assert.deepEqual(observed.map(row=>row.id).sort((a,b)=>a-b),recorded.map(row=>row.id).sort((a,b)=>a-b),"Public inventory drift: reconcile before archiving");
const originals = new Map(recorded.map(row=>[row.source_url,row]));
const targets = new Map();
function addTarget(source, id) {
  const url = new URL(source);
  assert.equal(url.origin,origin);
  assert.equal(url.search+url.hash,"");
  assert.match(url.pathname,/^\/wp-content\/uploads\/\d{4}\/\d{2}\/[A-Za-z0-9_%().-]+\.(?:jpe?g|png|webp|svg)$/i);
  const relative = decodeURIComponent(url.pathname.slice("/wp-content/uploads/".length));
  assert.ok(!/[\\:\x00-\x1f]/.test(relative));
  assert.ok(!relative.split("/").some(part=>part===".."||part==="."));
  targets.set(url.href,{url:url.href,relative,id,original:originals.has(url.href)});
}
for (const row of observed) {
  assert.equal(row.source_url,recorded.find(item=>item.id===row.id)?.source_url,"Source URL drift");
  addTarget(row.source_url,row.id);
  for (const size of Object.values(row.media_details?.sizes??{})) addTarget(size.source_url,row.id);
  if (row.media_details?.original_image) {
    const filename = row.media_details.original_image;
    assert.ok(!/[\\/]/.test(filename));
    addTarget(new URL(filename,row.source_url).href,row.id);
  }
}
assert.ok(targets.size <= 1000,"Unexpected archive growth");
assert.equal(new Set([...targets.values()].map(row=>row.relative.toLowerCase())).size,targets.size,"Case-insensitive collision");
await mkdir(archiveRoot,{recursive:true});
const archiveReal = await realpath(archiveRoot);
const entries = [...targets.values()];
const receipts = [];
const failures = [];
let completed = 0;
let cursor = 0;
let downloadedBytes = 0;
async function worker() {
  while (cursor < entries.length) {
    const row = entries[cursor++];
    try {
      const base = row.original ? path.resolve(sourceRoot) : archiveRoot;
      const target = path.resolve(base,row.relative);
      assert.ok(target.startsWith(base+path.sep));
      let bytes;
      let existing;
      try {existing=await lstat(target);} catch(error) {if(error.code!=="ENOENT") throw error;}
      if (existing) {
        assert.ok(existing.isFile()&&!existing.isSymbolicLink());
        assert.ok((await realpath(target)).startsWith((row.original?await realpath(base):archiveReal)+path.sep));
        assert.ok(existing.size>0&&existing.size<=bytesLimit);
        bytes=await readFile(target);
      } else {
        assert.ok(!row.original,"Run original archive recovery first");
        bytes=(await boundedGet(row.url,bytesLimit)).bytes;
      }
      const extension=path.extname(row.relative).toLowerCase();
      const valid=extension===".jpg"||extension===".jpeg" ? bytes[0]===255&&bytes[1]===216&&bytes[2]===255
        : extension===".png" ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
        : extension===".webp" ? bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP"
        : extension===".svg" ? /<svg(?:\s|>)/i.test(bytes.toString("utf8",0,4096))&&!/<html(?:\s|>)/i.test(bytes.toString("utf8",0,4096)) : false;
      assert.ok(valid,"Asset signature mismatch");
      if (!existing) {
        downloadedBytes+=bytes.length;
        assert.ok(downloadedBytes<=250*1024*1024,"Recovery byte budget exceeded");
        await mkdir(path.dirname(target),{recursive:true});
        assert.ok((await realpath(path.dirname(target))).startsWith(archiveReal+path.sep));
        await writeFile(target,bytes,{flag:"wx"});
      }
      receipts.push({path:new URL(row.url).pathname,bytes:bytes.length,sha256:createHash("sha256").update(bytes).digest("hex"),archive:row.original?"media/files":"media/continuity-files"});
      completed++;
      if (completed%100===0) console.log(`ARCHIVED=${completed}/${entries.length}`);
    } catch(error) {failures.push({path:new URL(row.url).pathname,error:error.message});}
  }
}
await Promise.all([worker(),worker(),worker(),worker()]);
receipts.sort((a,b)=>a.path.localeCompare(b.path,"en"));
const manifest=receipts.map(row=>`${row.path}\t${row.bytes}\t${row.sha256}`).join("\n");
const report={observedAt:new Date().toISOString(),source:origin,headerTotals:totals,enumeratedMedia:observed.length,targets:entries.length,archived:receipts.length,downloadedBytes,manifestSha256:createHash("sha256").update(manifest).digest("hex"),publication:"HELD_NOT_DEPLOYED",countConflict:"UNRESOLVED_124_HEADER_123_RECORDS",coverage:"Public metadata originals and listed sizes only; not a full WordPress backup",failures,receipts};
// Archive receipt is a generated local artifact, not application configuration.
await writeFile(path.join(archiveRoot,`receipt-${Date.now()}.json`),JSON.stringify(report,null,2),{flag:"wx"});
console.log(JSON.stringify({...report,receipts:undefined},null,2));
if(failures.length)process.exitCode=1;
