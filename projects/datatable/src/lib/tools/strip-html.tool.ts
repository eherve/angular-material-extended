/** @format */

export function stripHtml(value: string | null | undefined, tagReplacement = ' '): string {
  if (!value) return '';
  return value
    .replace(/<[^>]+>/g, tagReplacement) // remove tags
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}
