// Wix Headless CMS API client for Kitchen3D
// MetaSite ID: 543768f5-be18-4f7c-bb3b-380f4b05c925
// Environment variables required:
//   WIX_SITE_ID   - the Wix site ID (MetaSite ID)
//   WIX_API_KEY   - a Wix API key with Wix Data read permissions

const KITCHEN3D_SITE_ID = "543768f5-be18-4f7c-bb3b-380f4b05c925";
const WIX_SITE_ID = process.env.WIX_SITE_ID || "";
const WIX_API_KEY = process.env.WIX_API_KEY || "";
const WIX_QUERY_URL = "https://www.wixapis.com/wix-data/v2/items/query";
const REQUEST_TIMEOUT_MS = 10_000;
const PAGE_SIZE = 100;
const MAX_ITEMS = 1_000;
const MAX_REQUESTS = 20;
const INVALID_RESPONSE = "Invalid Wix CMS response";
const PAGINATION_LIMIT = "Wix CMS pagination safety limit reached";

type CollectionId = "Kitchen3DPages" | "Kitchen3DBlogPosts";
type CmsItem = { id: string; data: Record<string, unknown> };
type CmsBatch = { items: CmsItem[]; hasNext?: boolean; total?: number };
type CmsQuery = {
  filter?: { slug: { $eq: string } };
  sort?: { fieldName: string; order: "ASC" | "DESC" }[];
  paging: { limit: number; offset: number };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(data: Record<string, unknown>, key: string, optional = false): string {
  const value = data[key];
  if (optional && (value === undefined || value === null)) return "";
  if (typeof value !== "string") throw new Error(INVALID_RESPONSE);
  return value;
}

function parseBatch(value: unknown, collection: CollectionId, query: CmsQuery): CmsBatch {
  if (!isRecord(value) || !Array.isArray(value.dataItems) || value.dataItems.length > query.paging.limit) {
    throw new Error(INVALID_RESPONSE);
  }
  const items = value.dataItems.map((item: unknown): CmsItem => {
    if (!isRecord(item) || typeof item.id !== "string" || !item.id.trim() || item.id.length > 128 ||
        item.dataCollectionId !== collection || !isRecord(item.data)) {
      throw new Error(INVALID_RESPONSE);
    }
    if (item.data._id !== undefined && item.data._id !== item.id) throw new Error(INVALID_RESPONSE);
    return { id: item.id, data: item.data };
  });
  if (new Set(items.map((item) => item.id)).size !== items.length) throw new Error(INVALID_RESPONSE);

  // Native metadata is optional. When supplied it must agree with this batch.
  const metadata = value.pagingMetadata;
  if (metadata === undefined) return { items };
  if (!isRecord(metadata)) throw new Error(INVALID_RESPONSE);
  for (const key of ["count", "offset", "total"] as const) {
    if (metadata[key] !== undefined && (!Number.isSafeInteger(metadata[key]) || (metadata[key] as number) < 0)) {
      throw new Error(INVALID_RESPONSE);
    }
  }
  if ((metadata.count !== undefined && metadata.count !== items.length) ||
      (metadata.offset !== undefined && metadata.offset !== query.paging.offset) ||
      (metadata.hasNext !== undefined && typeof metadata.hasNext !== "boolean")) {
    throw new Error(INVALID_RESPONSE);
  }
  const hasNext = metadata.hasNext as boolean | undefined;
  const total = metadata.total as number | undefined;
  const end = query.paging.offset + items.length;
  if ((total !== undefined && (total < end || (hasNext !== undefined && hasNext !== (end < total)))) ||
      (items.length === 0 && (hasNext === true || (total !== undefined && total > end)))) {
    throw new Error(INVALID_RESPONSE);
  }
  return { items, hasNext, total };
}

async function wixFetch(collection: CollectionId, query: CmsQuery): Promise<CmsBatch> {
  // Explicit offline preview: do not read Wix, even if credentials exist.
  // Legacy CMS routes have no fixture records and return their normal empty/404 state.
  if (process.env.K3D_LOCAL_PREVIEW === "1" || process.env.K3D_LOCAL_CANDIDATE === "1") return { items: [], hasNext: false };
  if (!WIX_SITE_ID || !WIX_API_KEY) {
    throw new Error("Missing WIX_SITE_ID or WIX_API_KEY environment variables");
  }
  if (WIX_SITE_ID !== KITCHEN3D_SITE_ID) {
    throw new Error("WIX_SITE_ID must match the Kitchen3D site");
  }

  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reject(new Error("Wix CMS request timed out"));
    }, REQUEST_TIMEOUT_MS);
  });
  let result: unknown;
  try {
    result = await Promise.race([
      (async (): Promise<unknown> => {
        const res = await fetch(WIX_QUERY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": WIX_API_KEY,
            "wix-site-id": KITCHEN3D_SITE_ID,
          },
          body: JSON.stringify({ dataCollectionId: collection, query }),
          redirect: "error",
          signal: controller.signal,
          next: { revalidate: 3600 },
        });
        // Never read, log, or propagate a failing response body or request details.
        if (!res.ok) throw new Error("Wix CMS request failed");
        return res.json();
      })(),
      timeout,
    ]);
  } catch {
    controller.abort();
    throw new Error(timedOut ? "Wix CMS request timed out" : "Wix CMS request failed");
  } finally {
    clearTimeout(timer);
  }
  return parseBatch(result, collection, query);
}

export interface WixPage {
  id: string;
  slug: string;
  title: string;
  wpId: number;
  link: string;
  modified: string;
  seoTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  bodyJson: string;
  note: string;
}

export interface WixPost {
  id: string;
  slug: string;
  title: string;
  wpId: number;
  link: string;
  date: string;
  modified: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  bodyJson: string;
}

function commonFields(d: CmsItem) {
  const wpId = d.data.wpId;
  if (typeof wpId !== "number" || !Number.isSafeInteger(wpId) || wpId < 0) throw new Error(INVALID_RESPONSE);
  return {
    id: d.id,
    slug: stringField(d.data, "slug"),
    title: stringField(d.data, "title"),
    wpId,
    link: stringField(d.data, "link"),
    modified: stringField(d.data, "modified", true),
    seoTitle: stringField(d.data, "seoTitle", true),
    metaDescription: stringField(d.data, "metaDescription", true),
    bodyJson: stringField(d.data, "bodyJson", true),
  };
}

function toPage(d: CmsItem): WixPage {
  return {
    ...commonFields(d),
    heroSubtitle: stringField(d.data, "heroSubtitle", true),
    note: stringField(d.data, "note", true),
  };
}

function toPost(d: CmsItem): WixPost {
  return {
    ...commonFields(d),
    date: stringField(d.data, "date", true),
    excerpt: stringField(d.data, "excerpt", true),
  };
}

async function getAll<T>(collection: CollectionId, map: (item: CmsItem) => T, sort?: CmsQuery["sort"]): Promise<T[]> {
  const results: T[] = [];
  const ids = new Set<string>();
  let knownTotal: number | undefined;
  for (let request = 0; request < MAX_REQUESTS; request++) {
    const batch = await wixFetch(collection, { ...(sort ? { sort } : {}), paging: { limit: PAGE_SIZE, offset: results.length } });
    if (batch.total !== undefined) {
      if (knownTotal !== undefined && knownTotal !== batch.total) throw new Error(INVALID_RESPONSE);
      knownTotal = batch.total;
      if (knownTotal > MAX_ITEMS) throw new Error(PAGINATION_LIMIT);
    }
    for (const item of batch.items) {
      if (ids.has(item.id)) throw new Error(INVALID_RESPONSE);
      ids.add(item.id);
      results.push(map(item));
    }
    if (results.length > MAX_ITEMS) throw new Error(PAGINATION_LIMIT);
    if (knownTotal !== undefined && (results.length > knownTotal ||
        (batch.hasNext !== undefined && batch.hasNext !== (results.length < knownTotal)))) {
      throw new Error(INVALID_RESPONSE);
    }
    const hasNext = batch.hasNext ?? (knownTotal !== undefined ? results.length < knownTotal : batch.items.length === PAGE_SIZE);
    if (!hasNext) return results;
    if (batch.items.length === 0) throw new Error(INVALID_RESPONSE);
    if (results.length >= MAX_ITEMS) throw new Error(PAGINATION_LIMIT);
  }
  // Fail closed instead of returning a truncated collection or looping forever.
  throw new Error(PAGINATION_LIMIT);
}

export async function getAllPages(): Promise<WixPage[]> {
  return getAll("Kitchen3DPages", toPage);
}

export async function getPageBySlug(slug: string): Promise<WixPage | null> {
  const data = await wixFetch("Kitchen3DPages", {
    filter: { slug: { "$eq": slug } },
    paging: { limit: 1, offset: 0 },
  });
  const page = data.items.length > 0 ? toPage(data.items[0]) : null;
  if (page && page.slug !== slug) throw new Error(INVALID_RESPONSE);
  return page;
}

export async function getAllPosts(): Promise<WixPost[]> {
  return getAll("Kitchen3DBlogPosts", toPost, [{ fieldName: "date", order: "DESC" }]);
}

export async function getPostBySlug(slug: string): Promise<WixPost | null> {
  const data = await wixFetch("Kitchen3DBlogPosts", {
    filter: { slug: { "$eq": slug } },
    paging: { limit: 1, offset: 0 },
  });
  const post = data.items.length > 0 ? toPost(data.items[0]) : null;
  if (post && post.slug !== slug) throw new Error(INVALID_RESPONSE);
  return post;
}
