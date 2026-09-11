/** @format */

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

export function stripHtml(value: string | null | undefined, tagReplacement = ' '): string {
  if (!value) return '';
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, tagReplacement))
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z][a-z0-9]+);/gi, (match, entity: string) => {
    if (!entity.startsWith('#')) return HTML_ENTITIES[entity.toLowerCase()] ?? match;
    const radix = entity[1]?.toLowerCase() === 'x' ? 16 : 10;
    const source = radix === 16 ? entity.slice(2) : entity.slice(1);
    const codePoint = Number.parseInt(source, radix);
    if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return match;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return match;
    }
  });
}
