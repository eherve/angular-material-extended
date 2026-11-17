import { ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { SubSink } from "subsink";
import { EditEntityField, EditEntityRecord } from "../edit-entity-dialog.types";
import { EditEntityFormGroup } from "../classes/edit-entity-form-group";
import { toDate, toPickerTime } from "./date/date.helpers";

/** Install field rules before lazy views create their picker/widget directives. */
export function installEagerFieldValidation<T extends EditEntityRecord>(
  fields: EditEntityField<T>[],
  form: EditEntityFormGroup,
  sink: SubSink,
): void {
  for (const field of fields) {
    if (
      field.kind === "separator" ||
      field.kind === "metadata" ||
      field.kind === "display"
    )
      continue;
    const control = form.getControl(field.name);
    if (!control) continue;
    const validators: ValidatorFn[] = [];
    if (field.kind === "text") {
      if (field.type === "email") validators.push((c) => Validators.email(c));
      const max = typeof field.max === "number" ? field.max : undefined;
      if (max !== undefined) validators.push(Validators.maxLength(max));
    }
    if (field.kind === "number" && field.isInteger)
      validators.push((c) =>
        c.value == null || Number.isInteger(c.value) ? null : { integer: true },
      );
    const numeric = ["number", "duration", "slider"].includes(field.kind);
    const temporal = [
      "date",
      "datetime",
      "time",
      "date-range",
      "datetime-range",
      "time-range",
    ].includes(field.kind);
    const resolveBound = (value: unknown): unknown =>
      typeof value === "string"
        ? (form.getControl(value)?.value ??
          (field.kind.startsWith("time") ? value : undefined))
        : value;
    if (numeric)
      validators.push((c) => {
        if (empty(c.value)) return null;
        const errors: ValidationErrors = {};
        for (const key of ["min", "max"] as const) {
          const bound = resolveBound(field[key]);
          if (empty(bound)) continue;
          const limit = Number(bound);
          if (
            Number.isFinite(limit) &&
            (key === "min" ? Number(c.value) < limit : Number(c.value) > limit)
          )
            errors[key] = { [key]: limit, actual: c.value };
        }
        return Object.keys(errors).length ? errors : null;
      });
    if (temporal)
      validators.push((c) => {
        const time = field.kind.startsWith("time");
        const range = field.kind.endsWith("-range");
        const prefix = time
          ? "matTimepicker"
          : field.kind.startsWith("datetime")
            ? "mtxDatetimepicker"
            : "matDatepicker";
        const compare = (value: unknown): number | null => {
          if (time) {
            const parsed = toPickerTime(value);
            return parsed
              ? parsed.hours() * 3600000 +
                  parsed.minutes() * 60000 +
                  parsed.seconds() * 1000
              : null;
          }
          const date = toDate(value);
          if (!date) return null;
          if (field.kind === "date" || field.kind === "date-range")
            return new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            ).getTime();
          return date.getTime();
        };
        const errors: ValidationErrors = {};
        const min = compare(resolveBound(field.min));
        const max = compare(resolveBound(field.max));
        const check = (value: unknown, name = ""): void => {
          if (empty(value)) {
            if (range && control.hasValidator(Validators.required))
              errors["required"] = true;
            return;
          }
          const current = compare(value);
          if (current === null) {
            errors[name + prefix + "Parse"] = true;
            return;
          }
          if (min !== null && current < min)
            errors[name + prefix + "Min"] = { min, actual: value };
          if (max !== null && current > max)
            errors[name + prefix + "Max"] = { max, actual: value };
        };
        if (range) {
          const value = c.value as { start?: unknown; end?: unknown } | null;
          check(value?.start, "start.");
          check(value?.end, "end.");
          const start = compare(value?.start),
            end = compare(value?.end);
          if (start !== null && end !== null && start > end)
            errors["end." + prefix + "Min"] = {
              min: value?.start,
              actual: value?.end,
            };
        } else check(c.value);
        return Object.keys(errors).length ? errors : null;
      });
    control.addValidators(validators);
    control.updateValueAndValidity({ emitEvent: false });
    for (const key of ["min", "max"] as const) {
      const bound = field[key];
      if (typeof bound === "string") {
        const source = form.getControl(bound);
        if (source && source !== control)
          sink.add(
            source.valueChanges.subscribe(() =>
              control.updateValueAndValidity({ emitEvent: false }),
            ),
          );
      }
    }
  }
  form.updateValueAndValidity({ emitEvent: false });
}
function empty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}
