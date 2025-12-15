/** @format */

export function stripHtml(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/<[^>]+>/g, ' ') // remove tags
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}
