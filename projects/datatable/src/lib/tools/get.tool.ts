/** @format */

export function get(obj: any, path: string) {
  const chunks = path.split('.');
  let value = obj;
  for (let i = 0; i < chunks.length; ++i) {
    value = value[chunks[i]];
    if (value === undefined || value === null) return null;
  }
  return value;
}
