import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync,realpathSync,lstatSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

// Offline byte verification. Supplying an archive receipt cannot fetch or publish.
const root=path.resolve(fileURLToPath(new URL("../",import.meta.url)));
assert.equal(process.argv.length,3,"Supply exactly one generated receipt filename");
assert.match(process.argv[2],/^receipt-\d+\.json$/);
const receiptPath=path.join(root,"media/continuity-files",process.argv[2]);
const receipt=JSON.parse(readFileSync(receiptPath,"utf8"));
assert.equal(receipt.source,"https://kitchen3d.co.uk");
assert.equal(receipt.publication,"HELD_NOT_DEPLOYED");
assert.deepEqual(receipt.failures,[]);
assert.equal(receipt.archived,receipt.targets);
assert.equal(receipt.receipts.length,receipt.targets);
assert.equal(new Set(receipt.receipts.map(row=>row.path.toLowerCase())).size,receipt.targets);
let bytes=0;
for(const row of receipt.receipts){
  assert.ok(["media/files","media/continuity-files"].includes(row.archive));
  assert.match(row.path,/^\/wp-content\/uploads\/\d{4}\/\d{2}\/[A-Za-z0-9_%().-]+\.(?:jpe?g|png|webp|svg)$/i);
  const relative=decodeURIComponent(row.path.slice("/wp-content/uploads/".length));
  assert.ok(!/[\\:\x00-\x1f]/.test(relative));
  const base=realpathSync(path.join(root,row.archive));
  const target=path.resolve(base,relative);
  assert.ok(target.startsWith(base+path.sep));
  const stat=lstatSync(target);
  assert.ok(stat.isFile()&&!stat.isSymbolicLink());
  assert.ok(realpathSync(target).startsWith(base+path.sep));
  assert.equal(stat.size,row.bytes);
  const body=readFileSync(target);
  assert.equal(createHash("sha256").update(body).digest("hex"),row.sha256,row.path);
  bytes+=body.length;
}
const manifest=receipt.receipts.slice().sort((a,b)=>a.path.localeCompare(b.path,"en")).map(row=>`${row.path}\t${row.bytes}\t${row.sha256}`).join("\n");
assert.equal(createHash("sha256").update(manifest).digest("hex"),receipt.manifestSha256);
console.log(`ARCHIVE_RECEIPT=PASS; FILES=${receipt.targets}; BYTES=${bytes}; SHA256=${receipt.manifestSha256}; PUBLICATION=HELD`);
