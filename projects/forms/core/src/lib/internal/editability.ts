import { AbstractControl } from "@angular/forms";
// Editability is distinct from disabled state: disabled values may still be submitted.
const nonEditable = new WeakSet<AbstractControl>();
export function setNonEditable(control: AbstractControl, value: boolean): void {
  if (value) nonEditable.add(control);
  else nonEditable.delete(control);
}
export function isNonEditable(control: AbstractControl | null): boolean {
  return control !== null && nonEditable.has(control);
}
