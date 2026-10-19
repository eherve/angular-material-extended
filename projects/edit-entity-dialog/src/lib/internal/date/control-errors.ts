import { AbstractControl } from "@angular/forms";

/** Mirrors nested picker validation onto its owning form control. */
export function syncChildValidationErrors(
  parent: AbstractControl,
  children: ReadonlyArray<{ name: string; control: AbstractControl }>,
  previouslyMirrored: Map<string, unknown>,
): void {
  const nextErrors = { ...(parent.errors ?? {}) };
  for (const [key, previous] of previouslyMirrored) {
    if (sameError(nextErrors[key], previous)) delete nextErrors[key];
  }
  previouslyMirrored.clear();

  const childErrors = new Map<string, Record<string, unknown>>();
  for (const { name, control } of children) {
    for (const [key, value] of Object.entries(control.errors ?? {})) {
      if (key === "required") continue;
      const endpoints = childErrors.get(key) ?? {};
      endpoints[name] = value;
      childErrors.set(key, endpoints);
    }
  }

  for (const [key, endpoints] of childErrors) {
    if (Object.prototype.hasOwnProperty.call(nextErrors, key)) continue;
    const value = Object.keys(endpoints).length === 1
      ? Object.values(endpoints)[0]
      : endpoints;
    nextErrors[key] = value;
    previouslyMirrored.set(key, value);
  }
  if (sameErrors(parent.errors, nextErrors)) return;
  parent.setErrors(Object.keys(nextErrors).length ? nextErrors : null);
}

function sameErrors(a: Record<string, unknown> | null, b: Record<string, unknown>): boolean {
  const first = a ?? {};
  return Object.keys(first).length === Object.keys(b).length &&
    Object.keys(first).every(key => Object.prototype.hasOwnProperty.call(b, key) && sameError(first[key], b[key]));
}

function sameError(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
}
