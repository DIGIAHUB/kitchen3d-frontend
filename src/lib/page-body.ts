type ServiceIncludes = string[] | Record<string, string[]>;
export type PageBody = {
  service_includes?: ServiceIncludes;
  faq_sections?: string[];
  sample_questions?: string[];
};

// Legacy CMS text only. Forms, destinations, editor notes and HTML are never
// passed to the renderer. This shape check does not approve business claims.
export function parsePageBody(source: string): PageBody | null {
  if (!source || source.length > 100_000) return null;
  let raw: unknown;
  try { raw = JSON.parse(source); } catch { return null; }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  const text = (item: unknown): item is string => typeof item === "string" &&
    item.trim().length > 0 && item.length <= 2_000 && !/[\u0000-\u001f\u007f]/.test(item);
  const list = (item: unknown): item is string[] => Array.isArray(item) &&
    item.length > 0 && item.length <= 50 && item.every(text);
  const body: PageBody = {};
  if (value.service_includes !== undefined) {
    if (list(value.service_includes)) body.service_includes = value.service_includes;
    else if (value.service_includes && typeof value.service_includes === "object" && !Array.isArray(value.service_includes)) {
      const sections = Object.entries(value.service_includes);
      if (!sections.length || sections.length > 20 || sections.some(([key, items]) => !text(key) || !list(items))) return null;
      body.service_includes = Object.fromEntries(sections) as Record<string, string[]>;
    } else return null;
  }
  for (const key of ["faq_sections", "sample_questions"] as const) {
    if (value[key] === undefined) continue;
    if (!list(value[key])) return null;
    body[key] = value[key];
  }
  return body;
}
