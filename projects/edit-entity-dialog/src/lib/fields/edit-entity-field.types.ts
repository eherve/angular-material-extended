import { ComponentType } from "@angular/cdk/overlay";
import { Type } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { Moment } from "moment";
import { Dayjs } from "dayjs";
import {
  BaseFormField,
  ConditionalState,
  ConditionalValue,
  EditEntityFieldLayout,
} from "./edit-form-base-field";
export type FormControlTextType = "text" | "email" | "tel" | "password";
export type DateRangeValue = { start: Date | null; end: Date | null } | null;
export type DatetimeRangeValue = {
  start: Date | null;
  end: Date | null;
} | null;
export type TimeRangeValue = { start: string; end: string } | null;
export interface IFormControlSelectOption<TValue = unknown> {
  name: string;
  value: TValue;
  color?: string;
  disabled?: boolean;
  group?: string;
}
export type CheckboxFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  boolean
> & {
  kind: "checkbox";
  labelPosition?: "before" | "after";
  indeterminate?: boolean;
  hint?: string;
};

export type DisplayFormField<Record extends { _id?: string }> = {
  kind: "display";
  name: string;
  label?: string;
  section?: string;
  sectionCard?: string;
  resume?: string | string[];
  layout?: EditEntityFieldLayout;
  width?: string;
  minWidth?: string;
  visible?: ConditionalState<Record>;
  display?: string | ((value?: unknown) => string | null);
  /** Moment/Day.js format for date values; defaults to DD/MM/YYYY HH[h]mm. */
  format?: string;
  component?: Type<unknown>;
  componentInputs?: { [key: string]: unknown };
};

export type TimeFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  string | null
> & {
  kind: "time";
  max?: Date | string;
  min?: Date | string;
  hint?: string;
  placeholder?: string;
};

export type ChipsFormFieldOption = {
  name: string;
  value: unknown;
  color?: string;
};

export type ChipsFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  unknown
> & {
  kind: "chips";
  options: Observable<ChipsFormFieldOption[]> | ChipsFormFieldOption[];
  multiple?: boolean;
};

export type DatetimeRangeFormField<Record extends { _id?: string }> =
  BaseFormField<Record, DatetimeRangeValue> & {
    kind: "datetime-range";
    min?: Date | string;
    max?: Date | string;
    startLabel?: string;
    endLabel?: string;
  };

export type RadioFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  unknown
> & {
  kind: "radio";
  direction?: "row" | "column";
  hint?: string;

  options:
    | Observable<IFormControlSelectOption[]>
    | IFormControlSelectOption[]
    | ((
        record: Record | undefined,
        formGroup: FormGroup,
      ) => IFormControlSelectOption[]);
};

export type DatetimeFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  Date
> & {
  kind: "datetime";
  max?: Date | string;
  min?: Date | string;
  hint?: string;
  placeholder?: string;
};

export type DurationFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  number
> & {
  kind: "duration";
  showDays?: boolean;
  hint?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  quickOptions?: Array<number | string>;
};

export type DateFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  Date
> & {
  kind: "date";
  max?: Date | Moment | Dayjs | string;
  min?: Date | Moment | Dayjs | string;
  hint?: string;
  placeholder?: string;
  included?: boolean;
  lockedProperty?: string;
  canToggleLock?: ConditionalState<Record>;
};

export type NumberFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  number
> & {
  kind: "number";
  prefixIcon?: string;
  suffix?: string;
  hint?: string;
  hasCopyBtn?: boolean;
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  step?: number;
  isInteger?: boolean;
};

export type TimeRangeFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  TimeRangeValue
> & {
  kind: "time-range";
  min?: Date | string;
  max?: Date | string;
  startLabel?: string;
  endLabel?: string;
};

export interface SortableListFormField<
  Record extends { _id?: string },
  TValue = unknown,
> extends BaseFormField<Record, TValue[]> {
  kind: "sortable-list";
  service: AutocompleteFormFieldService<Record, TValue>;
  placeholder?: string;
  hint?: ConditionalValue<Record, string | undefined>;
  tooltip?: ConditionalValue<Record, string | undefined>;
}

export type SelectFormField<
  Record extends { _id?: string },
  TValue = unknown,
> = {
  kind: "select";
  group?: boolean;

  options:
    | Observable<IFormControlSelectOption<TValue>[]>
    | IFormControlSelectOption<TValue>[]
    | ((
        record: Record | undefined,
        formGroup: FormGroup,
      ) => IFormControlSelectOption<TValue>[]);

  prefixIcon?: string;
  suffix?: string;
  hint?: string;
  open?(value: TValue): void;
} & (unknown extends TValue
  ? BaseFormField<Record, unknown> & { multiple?: boolean }
  :
      | (BaseFormField<Record, TValue> & { multiple?: false })
      | (BaseFormField<Record, TValue[]> & { multiple: true }));

export type TextFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  string
> & {
  kind: "text";
  type?: FormControlTextType;
  prefixIcon?: string;
  suffix?: string;
  hint?: string;
  hasCopyBtn?: boolean;
  pattern?: string | RegExp;
  placeholder?: string;
  autocomplete?: string;
  max?: number;
};

export type ControlFormFieldPosition = "bottom" | "top";

export type ControlFormField<TRecord extends { _id?: string }> = BaseFormField<
  TRecord,
  unknown
> & {
  kind: "control";
  component: ComponentType<unknown> | null;
  inputs?: Record<string, unknown>;
  fields?: Record<string, string>;
  position?: ControlFormFieldPosition;
};

export type DateRangeFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  DateRangeValue
> & {
  kind: "date-range";
  min?: Date | string;
  max?: Date | string;
  startPlaceholder?: string;
  endPlaceholder?: string;
};

export type SliderFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  unknown
> & {
  kind: "slider";
  min?: number;
  max?: number;
  step?: number;
  showTicks?: boolean;
  bare?: boolean;

  discrete?: boolean;
  valuePosition?: "top" | "bottom";

  thumbFormatter?: (value: unknown) => number;
  thumbSuffix?: string;
};

export interface AutocompleteFormFieldService<Record, Value> {
  display(value: Value): { name: string; prefix?: string; color?: string };
  search(
    limit: number,
    skip: number,
    search: string,
    record: Record | undefined,
    formGroup: FormGroup,
    selected?: Value | Value[],
  ): Promise<{ data: Value[]; matchCount: number }>;
  group?: string | { group(value: Value): string }["group"];
  open?(value: Value): void;
}

export type AutocompleteFormField<
  Record extends { _id?: string },
  TValue = unknown,
> = BaseFormField<Record, TValue | TValue[]> & {
  kind: "autocomplete";
  service: AutocompleteFormFieldService<Record, TValue>;

  prefixIcon?: string;
  suffix?: string;
  hint?: ConditionalValue<Record, string | undefined>;
  tooltip?: ConditionalValue<Record, string | undefined>;
  placeholder?: string;

  multiple?: boolean;
};

export type TextareaFormField<Record extends { _id?: string }> = BaseFormField<
  Record,
  string
> & {
  kind: "textarea";
  hint?: string;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  height?: string;
};
