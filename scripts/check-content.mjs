import { access, readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { approvedPublicClaim } from "../config/approved-public-claims.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoots = ["src", "public"];
const sourceExtensions = new Set([
  ".html",
  ".js",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
]);

const rules = [
  {
    id: "EDITOR_NOTE_RENDER",
    pattern: /\bpage\.note\b/i,
  },
  {
    id: "TEMPLATE_PLACEHOLDER",
    pattern:
      /\blorem\s+ipsum\b|\bHUNIART\b|\bLenny\s+Jhonson\b|\bplaceholder\s+(?:copy|content|text)\b/i,
  },
  {
    id: "UNVERIFIED_TRUST",
    pattern:
      /\btrusted\s+kitchen\s+fitters\b|\b(?:25|109)\s+(?:Google\s+)?(?:five[- ]star\s+)?reviews?\b|\bfive[- ]star\s+reviews?\b|\bCheckatrade\b|\bMyBuilder\b|\bfully\s+insured\b|\btrade\s+accounts?\b|\bWren\b|\bHowdens\b|\bB&Q\b|\bMagnet\b/i,
  },
  {
    id: "UNVERIFIED_AUTHORSHIP",
    pattern:
      /\bWritten\s+by\s+MohammadReza\s+Savadi\b|\bMohammadReza\s+Savadi,\s+Owner\b/i,
  },
  {
    id: "HELD_BUSINESS_FACT",
    pattern:
      /\bKitchen\s*3D(?:\s+(?:Ltd|Limited))?\b|\b43\s+Manley\s+Road\b|(?<!\d)(?:\+?44|0044|0)[\s().-]*7882[\s().-]*116[\s().-]*895\b|\bkitchen3dltd@gmail\.com\b/i,
  },
  {
    id: "HELD_SERVICE_AREA",
    pattern:
      /\bGreater\s+Manchester\b|\bManchester\b|\bSalford\b|\bBolton\b|\bHyde\b|\bAshton-under-Lyne\b|\bMiddleton\b|\bStockport\b|\bBury\b/i,
  },
  {
    id: "HELD_COMMERCIAL_OFFER",
    pattern:
      /\bfree\s+quote\b|\bno[- ]obligation\s+quote\b|\bSupply\s*&\s*install\b|\binstallation\s+only\b/i,
  },
  {
    id: "HELD_SERVICE_CAPABILITY",
    pattern:
      /\bkitchen\s+fitters?\b|\bkitchen\s+fitting\b|\bkitchen\s+installation\b|\bkitchen\s+renovation\b|\bworktop\s+installation\b|\bsink\s+(?:and|&)\s+hob\b|\bdoor\s+fitting\b|\bflooring\s+installation\b|\bbedroom\s+furniture\b|\bwall\s+(?:and|&)\s+floor\s+tiling\b|\bplumbing\b|\belectrical\b/i,
  },
];

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function collectSourceFiles(relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!(await exists(absoluteDirectory))) {
    return [];
  }

  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(relativePath)));
    } else if (sourceExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(relativePath);
    }
  }

  return files;
}

function normaliseForMatching(line) {
  return line
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&mdash;", "—")
    .replaceAll("&nbsp;", " ");
}

async function main() {
  const files = (
    await Promise.all(scanRoots.map((directory) => collectSourceFiles(directory)))
  )
    .flat()
    .sort();

  const findings = [];
  const approved = [];

  for (const relativePath of files) {
    const contents = await readFile(path.join(root, relativePath), "utf8");
    const sourceHash = createHash("sha256").update(contents).digest("hex");
    const lines = contents.replaceAll("\r\n", "\n").split("\n");

    for (const [index, originalLine] of lines.entries()) {
      if (/^\s*(?:\/\/|\/\*|\*)/.test(originalLine)) {
        continue;
      }
      const normalisedLine = normaliseForMatching(originalLine);
      for (const rule of rules) {
        const match = normalisedLine.match(rule.pattern);
        if (match) {
          const finding = {
            file: relativePath.split(path.sep).join("/"),
            line: index + 1,
            column: (match.index ?? 0) + 1,
            rule: rule.id,
            text: originalLine.trim().slice(0, 180),
          };
          if (approvedPublicClaim(finding.file, sourceHash, finding.rule)) {
            approved.push(finding);
          } else {
            findings.push(finding);
          }
        }
      }
    }
  }

  console.log(`PUBLIC_SOURCE_FILES_SCANNED=${files.length}`);
  console.log(`HASH_LOCKED_OWNER_CLAIMS=${approved.length}`);

  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(
        `${finding.file}:${finding.line}:${finding.column} [${finding.rule}] ${finding.text}`,
      );
    }
    console.error("CONTENT_SAFETY_STATUS=FAIL");
    console.error("PUBLICATION_STATUS=HOLD");
    console.error(
      `ERRORS=${findings.length} WARNINGS=0 KNOWN_CONFLICTS=0`,
    );
    process.exitCode = 1;
  } else {
    console.log("CONTENT_SAFETY_STATUS=PASS");
    console.log("PUBLICATION_STATUS=REVIEW_REQUIRED");
    console.log(`ERRORS=0 WARNINGS=${approved.length} KNOWN_CONFLICTS=0`);
  }
}

main().catch((error) => {
  console.error("CONTENT_SAFETY_STATUS=INCOMPLETE");
  console.error("PUBLICATION_STATUS=HOLD");
  console.error(`CHECKER_ERROR=${error instanceof Error ? error.message : error}`);
  console.error("ERRORS=1 WARNINGS=0 KNOWN_CONFLICTS=0");
  process.exitCode = 2;
});
