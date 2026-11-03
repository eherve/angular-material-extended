import { AbstractControl, FormGroup } from "@angular/forms";
import {
  EditEntityFormGroup,
  isNonEditable,
} from "@eherve/angular-material-forms/core";
import { cloneDeep, get, has, isEqual, set } from "lodash-es";

/** Scoped persistence shared by the wizard engine; no host-specific model assumptions. */
export class CreateEntityWizardState {
  valid(form: EditEntityFormGroup, paths: string[]): boolean {
    return paths.every((path) => {
      const control = form.getControl(path);
      return (
        !control || control.disabled || (!control.pending && control.valid)
      );
    });
  }

  project(
    form: EditEntityFormGroup,
    paths: string[],
    changedOnly: boolean,
    always: string[] = [],
  ): Record<string, unknown> {
    const value: Record<string, unknown> = {};
    for (const path of new Set([...paths, ...always])) {
      const control = form.getControl(path);
      if (!control || isNonEditable(control)) continue;
      const current = control.getRawValue();
      const initial = this.read(form.initialValue, path);
      if (!changedOnly || always.includes(path) || !isEqual(current, initial))
        set(value, path, cloneDeep(current));
    }
    return value;
  }

  hydrate(
    form: EditEntityFormGroup,
    record: object,
    submitted: string[],
  ): void {
    const baseline = cloneDeep(form.initialValue);
    const visit = (control: AbstractControl, path: string): void => {
      if (control instanceof FormGroup) {
        for (const [key, child] of Object.entries(control.controls))
          visit(child, path ? `${path}.${key}` : key);
        return;
      }
      const saved = submitted.some(
        (name) => path === name || path.startsWith(`${name}.`),
      );
      const current = control.getRawValue();
      const draft = !isEqual(current, this.read(baseline, path));
      if (saved || !draft) {
        if (has(record, path))
          control.patchValue(cloneDeep(get(record, path)), {
            emitEvent: false,
          });
        if (Object.prototype.hasOwnProperty.call(form.controls, path))
          baseline[path] = cloneDeep(control.getRawValue());
        else set(baseline, path, cloneDeep(control.getRawValue()));
        control.markAsPristine();
        control.markAsUntouched();
      }
    };
    visit(form, "");
    form.setInitialValue(baseline);
  }

  private read(value: Record<string, unknown>, path: string): unknown {
    return Object.prototype.hasOwnProperty.call(value, path)
      ? value[path]
      : get(value, path);
  }
}
