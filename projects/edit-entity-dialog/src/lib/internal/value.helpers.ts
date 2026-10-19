import { get, isEqual } from "lodash-es";
/** Dynamic properties stay unknown until their caller validates their shape. */
export function readProperty(value: unknown, key: PropertyKey): unknown {
  if (
    value === null ||
    (typeof value !== "object" && typeof value !== "function")
  )
    return undefined;
  return Reflect.get(value, key);
}
function timestamp(value: unknown): number | undefined {
  if (value instanceof Date) return value.getTime();
  if (
    typeof value === "object" &&
    value !== null &&
    typeof readProperty(value, "toDate") === "function"
  ) {
    const date: unknown = Reflect.apply(
      readProperty(value, "toDate") as (...args: unknown[]) => unknown,
      value,
      [],
    );
    if (date instanceof Date) return date.getTime();
  }
  return undefined;
}
export function isEqualEntity(first: unknown, second: unknown): boolean {
  if (first === second) return true;
  const a = timestamp(first),
    b = timestamp(second);
  if (a !== undefined && b !== undefined) return a === b;
  if (Array.isArray(first) && Array.isArray(second))
    return (
      first.length === second.length &&
      first.every((v, i) => isEqualEntity(v, second[i]))
    );
  if (
    first &&
    second &&
    typeof first === "object" &&
    typeof second === "object" &&
    a === undefined &&
    b === undefined
  ) {
    const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
    return [...keys].every((key) =>
      isEqualEntity(readProperty(first, key), readProperty(second, key)),
    );
  }
  return isEqual(first, second);
}

export function readPath(
  value: unknown,
  path: string | readonly string[],
): unknown {
  return get(value, typeof path === "string" ? path : [...path]);
}
