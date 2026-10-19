import { readPath as get } from "../internal/value.helpers";
/** @format */

import { isNonEditable } from "../internal/editability";
import { Injectable } from "@angular/core";
import { cloneDeep, each, merge, set, unset } from "lodash-es";
import { EditEntityFormGroup } from "../classes/edit-entity-form-group";
import {
  EditEntityComponentOptions,
  EditEntityField,
  EditEntityRecord,
} from "../edit-entity-dialog.types";

@Injectable()
export class EditEntitySubmitValueService<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  buildCreateValue(
    options: EditEntityComponentOptions<TRecord>,
    fields: EditEntityField<TRecord>[],
    formGroup: EditEntityFormGroup,
  ): Record<string, unknown> {
    const value = merge(
      {},
      cloneDeep(options.defaultValues ?? {}),
      this.buildNormalizedRawValue(fields, formGroup),
    );
    return this.removeExcludedFields(value, fields, formGroup);
  }

  buildUpdateValue(
    fields: EditEntityField<TRecord>[],
    formGroup: EditEntityFormGroup,
  ): Record<string, unknown> {
    const value: Record<string, unknown> = {};

    each(fields, (field) => {
      if (field.kind === "separator" || field.kind === "metadata") return;
      if (field.alwaysInUpsert)
        set(value, field.name, formGroup.getControl(field.name)?.getRawValue());
    });

    each(formGroup.updatedValue, (fieldValue, key) => {
      if (fieldValue !== undefined) set(value, key, cloneDeep(fieldValue));
    });

    return this.removeExcludedFields(value, fields, formGroup);
  }

  private removeExcludedFields(
    value: Record<string, unknown>,
    fields: EditEntityField<TRecord>[],
    formGroup: EditEntityFormGroup,
  ): Record<string, unknown> {
    for (const field of fields) {
      if (field.kind === "separator") continue;
      if (
        field.kind !== "metadata" &&
        !isNonEditable(formGroup.getControl(field.name))
      )
        continue;
      unset(value, field.name);
      // Historical flat controls can coexist with nested form controls.
      delete value[field.name];
      const path = field.name.split(".");
      while (path.length > 1) {
        path.pop();
        const parent = get(value, path);
        if (
          !parent ||
          typeof parent !== "object" ||
          Array.isArray(parent) ||
          Object.keys(parent).length
        )
          break;
        unset(value, path);
      }
    }
    return value;
  }

  private buildNormalizedRawValue(
    fields: EditEntityField<TRecord>[],
    formGroup: EditEntityFormGroup,
  ): Record<string, unknown> {
    const rawValue = formGroup.getRawValue();
    const value: Record<string, unknown> = {};

    each(fields, (field) => {
      if (field.kind === "separator" || field.kind === "metadata") return;

      const control = formGroup.getControl(field.name);
      if (!control) return;

      set(value, field.name, control.getRawValue());
    });

    each(rawValue, (fieldValue, key) => {
      if (key.includes(".")) return;
      if (value[key] !== undefined) return;
      value[key] = fieldValue;
    });

    return value;
  }
}
