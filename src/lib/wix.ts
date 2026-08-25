// Wix Headless CMS API client for Kitchen3D
// MetaSite ID: 543768f5-be18-4f7c-bb3b-380f4b05c925
// Environment variables required:
//   WIX_SITE_ID   - the Wix site ID (MetaSite ID)
//   WIX_API_KEY   - a Wix API key with Wix Data read permissions

const WIX_SITE_ID = process.env.WIX_SITE_ID || "";
const WIX_API_KEY = process.env.WIX_API_KEY || "";
const WIX_BASE_URL = "https://www.wixapis.com/wix-data/v2";

async function wixFetch(path: string, body: object): Promise<any> {
  if (!WIX_SITE_ID || !WIX_API_KEY) {
    throw new Error("Missing WIX_SITE_ID or WIX_API_KEY environment variables");
  }
  const res = await fetch(`${WIX_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": WIX_API_KEY,
      "wix-site-id": WIX_SITE_ID,
    },
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wix API error ${res.status}: ${text}`);
  }
  return res.json();
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

function toPage(d: any): WixPage {
  return {
    id: d.id,
    slug: d.data.slug,
    title: d.data.title,
    wpId: d.data.wpId,
    link: d.data.link,
    modified: d.data.modified || "",
    seoTitle: d.data.seoTitle || "",
    metaDescription: d.data.metaDescription || "",
    heroSubtitle: d.data.heroSubtitle || "",
    bodyJson: d.data.bodyJson || "",
    note: d.data.note || "",
  };
}

function toPost(d: any): WixPost {
  return {
    id: d.id,
    slug: d.data.slug,
    title: d.data.title,
    wpId: d.data.wpId,
    link: d.data.link,
    date: d.data.date || "",
    modified: d.data.modified || "",
    seoTitle: d.data.seoTitle || "",
    metaDescription: d.data.metaDescription || "",
    excerpt: d.data.excerpt || "",
    bodyJson: d.data.bodyJson || "",
  };
}

export async function getAllPages(): Promise<WixPage[]> {
  const data = await wixFetch("/items/query", {
    dataCollectionId: "Kitchen3DPages",
    query: { paging: { limit: 50, offset: 0 } },
  });
  return (data.dataItems || []).map(toPage);
}

export async function getPageBySlug(slug: string): Promise<WixPage | null> {
  const data = await wixFetch("/items/query", {
    dataCollectionId: "Kitchen3DPages",
    query: {
      filter: { slug: { "$eq": slug } },
      paging: { limit: 1, offset: 0 },
    },
  });
  const items = data.dataItems || [];
  return items.length > 0 ? toPage(items[0]) : null;
}

export async function getAllPosts(): Promise<WixPost[]> {
  const data = await wixFetch("/items/query", {
    dataCollectionId: "Kitchen3DBlogPosts",
    query: {
      sort: [{ fieldName: "date", order: "DESC" }],
      paging: { limit: 20, offset: 0 },
    },
  });
  return (data.dataItems || []).map(toPost);
}

export async function getPostBySlug(slug: string): Promise<WixPost | null> {
  const data = await wixFetch("/items/query", {
    dataCollectionId: "Kitchen3DBlogPosts",
    query: {
      filter: { slug: { "$eq": slug } },
      paging: { limit: 1, offset: 0 },
    },
  });
  const items = data.dataItems || [];
  return items.length > 0 ? toPost(items[0]) : null;
}
