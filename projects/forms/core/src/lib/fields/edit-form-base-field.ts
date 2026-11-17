/** @format */

import { FormGroup } from "@angular/forms";
import { MatFormFieldAppearance } from "@angular/material/form-field";
import { Observable } from "rxjs";
import type { EditEntityFormGroup } from "../classes/edit-entity-form-group";

export type ConditionalState<Record extends { _id?: string }> =
  | boolean
  | Observable<boolean>
  | ((record: Record | undefined, formGroup: FormGroup) => boolean);

export type ConditionalValueFunction<Record extends { _id?: string }, Value> = (
  record: Record | undefined,
  formGroup: FormGroup,
) => Value;

export type ConditionalValue<Record extends { _id?: string }, Value> =
  | Value
  | Observable<Value>
  | ConditionalValueFunction<Record, Value>;

export type Editable<Record> =
  | boolean
  | ((record: Record | undefined, formGroup: FormGroup) => boolean);

export type EditEntityFieldLayout = {
  colSpan?: number;
  rowSpan?: number;
  breakBefore?: boolean;
  breakAfter?: boolean;
  styles?: Record<string, string>;
  classes?: string;
};

export type BaseFormField<Record extends { _id?: string }, Field = unknown> = {
  kind: string;
  name: string;
  label: string;
  section?: string;
  sectionCard?: string;
  resume?: string | string[];
  layout?: EditEntityFieldLayout;
  required?: ConditionalState<Record>;
  disabled?: ConditionalState<Record>;
  visible?: ConditionalState<Record>;
  width?: string;
  minWidth?: string;
  appearance?: MatFormFieldAppearance;
  defaultValue?: Field | null;
  alwaysInUpsert?: boolean;
  editable?: Editable<Record>;
  onValueChanges?: (
    value: Field,
    formGroup: EditEntityFormGroup,
    record?: Record,
  ) => void;
  isFilled?: (
    value: unknown,
    record: Record | undefined,
    formGroup: EditEntityFormGroup,
  ) => boolean;
  unique?: (
    value: Field,
    formGroup: EditEntityFormGroup,
    record?: Record,
  ) => Promise<boolean>;
};
