import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {lstatSync, readFileSync, realpathSync, readdirSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

// Read-only recovery audit. No downloads, public copies, redirects or publication.
const root = path.resolve(fileURLToPath(new URL("../media/files/", import.meta.url)));
const rootReal = realpathSync(root);
const records = JSON.parse(readFileSync(new URL("../media/media-index.json", import.meta.url), "utf8"));
const inventory = readFileSync(new URL("../../docs/K3D-001_URL_MIGRATION_MAP.csv", import.meta.url), "utf8");
const sourceRows = inventory.split(/\r?\n/).filter(line => line.includes('\",\"media source asset\",'));
assert.equal(records.length, 123, "Reconcile changed inventory before proceeding");
assert.equal(sourceRows.length, records.length);
const seen = new Set();
const result = [];
for (const record of records) {
  const url = new URL(record.source_url);
  assert.equal(url.origin, "https://kitchen3d.co.uk");
  assert.equal(url.search + url.hash, "");
  assert.ok(url.pathname.startsWith("/wp-content/uploads/"));
  const relative = decodeURIComponent(url.pathname.slice("/wp-content/uploads/".length));
  assert.ok(relative.split("/").every(part => part && part !== "." && part !== ".." && !/[\\:\x00-\x1f]/.test(part)));
  assert.ok(!seen.has(relative.toLowerCase()), "Case-insensitive path collision");
  seen.add(relative.toLowerCase());
  assert.ok(sourceRows.some(line => line.startsWith(`"${url.href}",`)), "Missing recorded source URL");
  const target = path.resolve(root, relative);
  assert.ok(target.startsWith(root + path.sep));
  let stat;
  try { stat = lstatSync(target); } catch (error) {
    if (error.code !== "ENOENT") throw error;
    result.push({id:record.id, path:url.pathname, status:"MISSING"});
    continue;
  }
  assert.ok(stat.isFile() && !stat.isSymbolicLink());
  assert.ok(realpathSync(target).startsWith(rootReal + path.sep), "Asset resolves outside archive");
  assert.ok(stat.size > 0 && stat.size <= 25 * 1024 * 1024, "Invalid archive file size");
  const bytes = readFileSync(target);
  const type = record.mime_type;
  const signatureOK = type === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : type === "image/png" ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : type === "image/webp" ? bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP"
    : type === "image/svg+xml" ? /<svg(?:\s|>)/i.test(bytes.toString("utf8",0,4096)) && !/<html(?:\s|>)/i.test(bytes.toString("utf8",0,4096))
    : false;
  assert.ok(signatureOK, `Signature mismatch: ${relative}`);
  result.push({id:record.id, path:url.pathname, status:"ARCHIVED", bytes:bytes.length, sha256:createHash("sha256").update(bytes).digest("hex"), review:type === "image/svg+xml" ? "SVG_UNTRUSTED_NOT_SANITIZED" : "NOT_PUBLICATION_CLEARED"});
}
const extraFiles = readdirSync(root,{recursive:true,withFileTypes:true}).filter(entry => entry.isFile()).map(entry => path.relative(root,path.join(entry.parentPath,entry.name)).replaceAll(path.sep,"/")).filter(relative => !seen.has(relative.toLowerCase()));
assert.equal(extraFiles.length,0,"Unmapped archive files require reconciliation");
const archived = result.filter(row => row.status === "ARCHIVED");
const missing = result.filter(row => row.status === "MISSING");
const manifest = archived.sort((a,b)=>a.path.localeCompare(b.path,"en")).map(row=>`${row.path}\t${row.bytes}\t${row.sha256}`).join("\n");
console.log(JSON.stringify({inventory:records.length,archived:archived.length,bytes:archived.reduce((sum,row)=>sum+row.bytes,0),manifestSha256:createHash("sha256").update(manifest).digest("hex"),missing,archiveComplete:missing.length===0,publication:"HELD",derivativeCoverage:"NOT_ESTABLISHED",historical124CountConflict:"UNRESOLVED"},null,2));
if (missing.length) process.exitCode = 1;
