import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const loaded = {exports:{}};
const source = readFileSync(new URL("../src/lib/enquiries/retention.ts",import.meta.url),"utf8");
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:loaded,exports:loaded.exports});
const {unsuccessfulEnquiryRetention:decide,UNSUCCESSFUL_RETENTION_DAYS} = loaded.exports;
let checks = 0;
const check = fn => {fn(); checks++;};
check(()=>assert.equal(UNSUCCESSFUL_RETENTION_DAYS,90));
const firstReceivedAt = "2026-09-17T12:00:00.000Z";
const due = "2026-12-16T12:00:00.000Z";
check(()=>assert.equal(decide({firstReceivedAt,status:"unsuccessful",now:due}).dueAt,due));
check(()=>assert.equal(decide({firstReceivedAt,status:"unsuccessful",now:"2026-12-16T11:59:59.999Z"}).eligible,false));
check(()=>assert.equal(decide({firstReceivedAt,status:"unsuccessful",now:due}).eligible,true));
check(()=>assert.equal(decide({firstReceivedAt,status:"unsuccessful",now:"2027-01-01T00:00:00.000Z"}).eligible,true));
for (const status of ["active","accepted"]) {
  check(()=>assert.equal(decide({firstReceivedAt,status,now:"2027-01-01T00:00:00.000Z"}).eligible,false));
}
for (const bad of ["", "bad", "2026-02-30T00:00:00.000Z", "2026-09-17", "2026-09-17T12:00:00+01:00", "99999-09-17T12:00:00.000Z", null]) {
  check(()=>assert.equal(decide({firstReceivedAt:bad,status:"unsuccessful",now:due}).reason,"invalid-input"));
  check(()=>assert.equal(decide({firstReceivedAt,status:"unsuccessful",now:bad}).eligible,false));
}
check(()=>assert.equal(decide({firstReceivedAt,status:"closed",now:due}).eligible,false));
check(()=>assert.equal(decide({firstReceivedAt:due,status:"unsuccessful",now:firstReceivedAt}).eligible,false));
check(()=>assert.equal(decide(null).eligible,false));
check(()=>assert.equal(decide({firstReceivedAt:"2024-02-29T12:00:00.000Z",status:"unsuccessful",now:"2024-05-29T12:00:00.000Z"}).eligible,true));
console.log(`RETENTION_CHECKS=PASS (${checks}; 90 days from first receipt; unsuccessful only; no storage access or deletion)`);
