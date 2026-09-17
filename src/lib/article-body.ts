export type ArticleBlock = { type: "paragraph" | "heading" | "list-item"; text: string };

// Only structured text is renderable. Recovered HTML is never an accepted format.
export function parseArticleBody(source: string): ArticleBlock[] | null {
  if (!source || source.length > 200_000) return null;
  let value: unknown;
  try { value = JSON.parse(source); } catch { return null; }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (body.version !== 1 || body.reviewState !== "approved" ||
      !Array.isArray(body.blocks) || !body.blocks.length || body.blocks.length > 250 ||
      Object.keys(body).some(key => !["version", "reviewState", "blocks"].includes(key))) return null;
  const blocks: ArticleBlock[] = [];
  for (const raw of body.blocks) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const block = raw as Record<string, unknown>;
    if (Object.keys(block).some(key => !["type", "text"].includes(key)) ||
        !["paragraph", "heading", "list-item"].includes(block.type as string) ||
        typeof block.text !== "string" || !block.text.trim() || block.text.length > 10_000 ||
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(block.text)) return null;
    blocks.push({ type: block.type as ArticleBlock["type"], text: block.text.trim() });
  }
  return blocks;
}
