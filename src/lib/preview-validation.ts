// Local UI validation only. A live upload endpoint will need its own validation.
type PreviewFile = { type: string; size: number };
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
export const previewPhonePattern = "(?=(?:\\D*\\d){7,})[\\+0-9\\(\\) .\\-]{7,25}";

export function previewFilesError(files: PreviewFile[]): string {
  const invalid = files.length > 5
    || files.some(file => !acceptedTypes.has(file.type) || file.size > 10 * 1024 * 1024)
    || files.reduce((total, file) => total + file.size, 0) > 20 * 1024 * 1024;
  return invalid
    ? "Choose up to 5 JPG, PNG, WebP or PDF files, no more than 10 MB each and 20 MB in total. Your previous selection has not changed."
    : "";
}
