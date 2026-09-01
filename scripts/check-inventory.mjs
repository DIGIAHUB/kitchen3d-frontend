import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const knownConflicts = [];

async function readText(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), "utf8");
  } catch (error) {
    errors.push(
      `${relativePath}: could not read file (${error instanceof Error ? error.message : error})`,
    );
    return null;
  }
}

async function readJson(relativePath, fallback) {
  const contents = await readText(relativePath);
  if (contents === null) {
    return fallback;
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    errors.push(
      `${relativePath}: malformed JSON (${error instanceof Error ? error.message : error})`,
    );
    return fallback;
  }
}

async function listJsonFiles(relativeDirectory) {
  try {
    const entries = await readdir(path.join(root, relativeDirectory), {
      withFileTypes: true,
    });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => path.join(relativeDirectory, entry.name))
      .sort();
  } catch (error) {
    errors.push(
      `${relativeDirectory}: could not list directory (${error instanceof Error ? error.message : error})`,
    );
    return [];
  }
}

function expectEqual(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${expected}, received ${actual}`);
  }
}

function expectExactList(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(
      `${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
    );
  }
}

function expectUnique(label, records, key) {
  const values = records.map((record) => record?.[key]);
  const usableValues = values.filter(
    (value) => value !== undefined && value !== null && value !== "",
  );
  expectEqual(`${label} populated ${key}`, usableValues.length, records.length);
  expectEqual(`${label} unique ${key}`, new Set(usableValues).size, records.length);
}

function expectSameSet(label, first, second) {
  const left = [...new Set(first)].sort();
  const right = [...new Set(second)].sort();
  if (JSON.stringify(left) !== JSON.stringify(right)) {
    errors.push(`${label}: sets differ`);
  }
}

function validateContentRecords(label, records, files, requiredFields) {
  for (const [index, record] of records.entries()) {
    const file = files[index] ?? `${label}[${index}]`;
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      errors.push(`${file}: expected an object`);
      continue;
    }

    if (!Number.isInteger(record.id) || record.id <= 0) {
      errors.push(`${file}: id must be a positive integer`);
    }

    for (const field of requiredFields) {
      if (typeof record[field] !== "string" || record[field].trim() === "") {
        errors.push(`${file}: ${field} must be a non-empty string`);
      }
    }

    const expectedFilename = `${record.slug}.json`;
    if (path.basename(file) !== expectedFilename) {
      errors.push(
        `${file}: filename must match slug (${expectedFilename})`,
      );
    }

    for (const field of ["seo_title", "meta_description"]) {
      if (record[field] !== null && typeof record[field] !== "string") {
        errors.push(`${file}: ${field} must be a string or null`);
      }
    }
  }

  expectUnique(label, records, "id");
  expectUnique(label, records, "slug");
  expectUnique(label, records, "link");
}

async function main() {
  const pageFiles = await listJsonFiles("pages");
  const postFiles = await listJsonFiles("posts");
  const allDataJsonFiles = await listJsonFiles("data");
  const rawMediaFiles = allDataJsonFiles.filter((file) =>
    /^media-page\d+-raw\.json$/.test(path.basename(file)),
  );
  const expectedRawMediaFiles = Array.from({ length: 7 }, (_, index) =>
    path.join("data", `media-page${index + 1}-raw.json`),
  );

  expectEqual("page files", pageFiles.length, 18);
  expectEqual("post files", postFiles.length, 7);
  expectExactList("raw media page files", rawMediaFiles, expectedRawMediaFiles);

  const pages = await Promise.all(
    pageFiles.map((file) => readJson(file, Object.create(null))),
  );
  const posts = await Promise.all(
    postFiles.map((file) => readJson(file, Object.create(null))),
  );
  validateContentRecords("pages", pages, pageFiles, [
    "slug",
    "title",
    "link",
    "modified",
  ]);
  validateContentRecords("posts", posts, postFiles, [
    "slug",
    "title",
    "link",
    "date",
    "modified",
  ]);

  const rawMediaPages = await Promise.all(
    expectedRawMediaFiles.map((file) => readJson(file, [])),
  );
  const expectedRawPageCounts = [20, 20, 19, 20, 20, 20, 4];
  for (const [index, page] of rawMediaPages.entries()) {
    if (!Array.isArray(page)) {
      errors.push(`${expectedRawMediaFiles[index]}: expected an array`);
      rawMediaPages[index] = [];
    }
    expectEqual(
      `${expectedRawMediaFiles[index]} records`,
      rawMediaPages[index].length,
      expectedRawPageCounts[index],
    );
  }
  const rawMedia = rawMediaPages.flat();

  const parsedMediaIndex = await readJson("media/media-index.json", []);
  const mediaIndex = Array.isArray(parsedMediaIndex) ? parsedMediaIndex : [];
  if (!Array.isArray(parsedMediaIndex)) {
    errors.push("media/media-index.json: expected an array");
  }

  expectEqual("raw media records", rawMedia.length, 123);
  expectEqual("media index records", mediaIndex.length, 123);
  expectUnique("raw media", rawMedia, "id");
  expectUnique("raw media", rawMedia, "source_url");
  expectUnique("media index", mediaIndex, "id");
  expectUnique("media index", mediaIndex, "source_url");
  expectSameSet(
    "media IDs in index and raw pages",
    mediaIndex.map((record) => record.id),
    rawMedia.map((record) => record.id),
  );
  expectSameSet(
    "media source URLs in index and raw pages",
    mediaIndex.map((record) => record.source_url),
    rawMedia.map((record) => record.source_url),
  );

  const downloadScript =
    (await readText("media/download-all.sh")) ?? "";
  const urlBlock = downloadScript.match(/\bURLs=\(\s*([\s\S]*?)^\s*\)/m);
  const downloadUrls = urlBlock
    ? [...urlBlock[1].matchAll(/"(https?:\/\/[^"\r\n]+)"/g)].map(
        (match) => match[1],
      )
    : [];
  if (!urlBlock) {
    errors.push("media/download-all.sh: URLs array not found");
  }
  expectEqual("download script URLs", downloadUrls.length, 123);
  expectEqual(
    "download script unique URLs",
    new Set(downloadUrls).size,
    123,
  );
  expectSameSet(
    "download and media-index URLs",
    downloadUrls,
    mediaIndex.map((record) => record.source_url),
  );

  const metadata = await readJson("data/site-metadata.json", {});
  expectEqual("metadata total_pages", metadata.total_pages, 18);
  expectEqual("metadata total_posts", metadata.total_posts, 7);
  expectEqual(
    "metadata retained media claim",
    metadata.total_media_library_items,
    124,
  );

  const mediaSummary =
    (await readText("data/media-page1-raw-summary.txt")) ?? "";
  if (!/Total items confirmed via REST API:\s*124\b/.test(mediaSummary)) {
    errors.push(
      "data/media-page1-raw-summary.txt: retained 124-item claim missing",
    );
  }
  if (!/Download all 124\b|Downloading 124\b/.test(downloadScript)) {
    errors.push("media/download-all.sh: retained 124-item claim missing");
  }

  if (
    metadata.total_media_library_items === 124 &&
    /Total items confirmed via REST API:\s*124\b/.test(mediaSummary) &&
    /Download all 124\b|Downloading 124\b/.test(downloadScript) &&
    mediaIndex.length === 123
  ) {
    knownConflicts.push(
      "124 items are documented while 123 unique media records are enumerated",
    );
  }

  const missingAltText = mediaIndex.filter(
    (record) => String(record.alt_text ?? "").trim() === "",
  ).length;
  expectEqual("media records missing alt text", missingAltText, 80);
  if (missingAltText === 80) {
    warnings.push("80 of 123 media records have empty alt text");
  }

  const reviewRequiredAssets = mediaIndex.filter((record) =>
    /placeholder|404|untitled|chatgpt/i.test(
      [record.slug, record.title, record.source_url].join(" "),
    ),
  );
  expectEqual("review-required media names", reviewRequiredAssets.length, 11);
  if (reviewRequiredAssets.length === 11) {
    warnings.push("11 media records have review-required names");
  }

  const rawById = new Map(rawMedia.map((record) => [record.id, record]));
  const descriptiveDifferences = [];
  for (const record of mediaIndex) {
    const rawRecord = rawById.get(record.id);
    if (!rawRecord) {
      continue;
    }
    const rawTitle =
      rawRecord.title && typeof rawRecord.title === "object"
        ? rawRecord.title.rendered
        : rawRecord.title;
    if (record.slug !== rawRecord.slug) {
      descriptiveDifferences.push(`${record.id}:slug`);
    }
    if (record.title !== rawTitle) {
      descriptiveDifferences.push(`${record.id}:title`);
    }
  }
  const expectedDescriptiveDifferences = [
    "338:title",
    "513:title",
    "3526:slug",
    "4190:slug",
    "4198:slug",
    "4198:title",
  ];
  expectExactList(
    "known media descriptive differences",
    descriptiveDifferences.sort(),
    expectedDescriptiveDifferences.sort(),
  );
  if (descriptiveDifferences.length === 6) {
    warnings.push(
      "six descriptive fields differ across five media IDs; identity fields match",
    );
  }

  console.log(`PAGE_EXPORTS=${pageFiles.length}`);
  console.log(`POST_EXPORTS=${postFiles.length}`);
  console.log(`RAW_MEDIA_PAGE_FILES=${rawMediaFiles.length}`);
  console.log(`ENUMERATED_MEDIA_RECORDS=${mediaIndex.length}`);
  console.log(`DOWNLOAD_URLS=${downloadUrls.length}`);
  console.log(`DOCUMENTED_MEDIA_CLAIM=${metadata.total_media_library_items}`);
  for (const warning of warnings) {
    console.log(`WARNING=${warning}`);
  }
  for (const conflict of knownConflicts) {
    console.log(`KNOWN_CONFLICT=${conflict}`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`ERROR=${error}`);
    }
    console.error("STRUCTURAL_STATUS=FAIL");
    console.error("PUBLICATION_STATUS=HOLD");
    console.error(
      `ERRORS=${errors.length} WARNINGS=${warnings.length} KNOWN_CONFLICTS=${knownConflicts.length}`,
    );
    process.exitCode = 1;
  } else {
    console.log("STRUCTURAL_STATUS=PASS");
    console.log("PUBLICATION_STATUS=HOLD");
    console.log(
      `ERRORS=0 WARNINGS=${warnings.length} KNOWN_CONFLICTS=${knownConflicts.length}`,
    );
  }
}

main().catch((error) => {
  console.error("STRUCTURAL_STATUS=INCOMPLETE");
  console.error("PUBLICATION_STATUS=HOLD");
  console.error(`CHECKER_ERROR=${error instanceof Error ? error.message : error}`);
  console.error("ERRORS=1 WARNINGS=0 KNOWN_CONFLICTS=0");
  process.exitCode = 2;
});
