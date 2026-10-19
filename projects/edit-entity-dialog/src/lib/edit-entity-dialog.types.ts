/** @format */

import { ComponentType } from "@angular/cdk/overlay";
import { Type } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { EditEntityFormGroup } from "./classes/edit-entity-form-group";

export type EditEntityRecord = {
  _id?: string;
  __archived?: EditEntityArchiveState;
};

export interface EditEntityArchiveState {
  isArchived: boolean;
}

export type EditEntityConditionalState<
  TRecord extends EditEntityRecord = EditEntityRecord,
> =
  | boolean
  | Observable<boolean>
  | ((record: TRecord | undefined, formGroup: FormGroup) => boolean);

export type EditEntityConditionalValue<
  TRecord extends EditEntityRecord,
  TValue,
> =
  | TValue
  | Observable<TValue>
  | ((record: TRecord | undefined, formGroup: FormGroup) => TValue);

export type EditEntityValueProvider<TRecord extends EditEntityRecord, TValue> =
  | TValue
  | ((record: TRecord | undefined, formGroup: FormGroup) => TValue);

export type EditEntityEditable<TRecord extends EditEntityRecord> =
  | boolean
  | ((record: TRecord | undefined, formGroup: FormGroup) => boolean);

export type EditEntityIcon = string | { name: string; color?: string };

export interface EditEntityGridOptions {
  columns?: number;
  gap?: string;
  minColumnWidth?: string;
}

export type EditEntitySectionMode = "default" | "single-card";

export interface EditEntityLayout {
  colSpan?: number;
  rowSpan?: number;
  breakBefore?: boolean;
  breakAfter?: boolean;
  styles?: Record<string, string>;
  classes?: string;
}

export interface EditEntityCompletion {
  disabled?: boolean;
  done?: number | string | null;
  total?: number | string | null;
  name?: string;
  countItems?: boolean;
}

export type EditEntityValidationStatus =
  | "none"
  | "valid"
  | "missing"
  | "invalid";

export interface EditEntityValidationStats {
  total: number;
  completed: number;
  required: number;
  missing: number;
  invalid: number;
  dirty: number;
}

export interface EditEntityValidationSummary {
  status: EditEntityValidationStatus;
  label?: string;
  color?: string;
  tooltip?: string;
}

export interface EditEntityBaseField<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  kind: string;
  name: string;
  label?: string;
  layout?: EditEntityLayout;
  width?: string;
  minWidth?: string;
  required?: EditEntityConditionalState<TRecord>;
  disabled?: EditEntityConditionalState<TRecord>;
  visible?: EditEntityConditionalState<TRecord>;
  editable?: EditEntityEditable<TRecord>;
  defaultValue?: unknown;
  alwaysInUpsert?: boolean;
  appearance?: import("@angular/material/form-field").MatFormFieldAppearance;
  section?: string;
  sectionCard?: string;
  resume?: string | string[];
  pattern?: string | RegExp;
  min?: unknown;
  max?: unknown;
  lockedProperty?: string;
  canToggleLock?: EditEntityConditionalState<TRecord>;
  isFilled?: (
    value: unknown,
    record: TRecord | undefined,
    formGroup: EditEntityFormGroup,
  ) => boolean;
  onValueChanges?(
    value: unknown,
    formGroup: EditEntityFormGroup,
    record?: TRecord,
  ): void;
  unique?(
    value: unknown,
    formGroup: EditEntityFormGroup,
    record?: TRecord,
  ): Promise<boolean>;
}

export type EditEntityFormFieldKind =
  | "control"
  | "text"
  | "textarea"
  | "duration"
  | "number"
  | "checkbox"
  | "radio"
  | "select"
  | "autocomplete"
  | "date"
  | "date-range"
  | "datetime"
  | "datetime-range"
  | "time"
  | "time-range"
  | "chips"
  | "sortable-list"
  | "slider";

export type EditEntityFormField<
  TRecord extends EditEntityRecord = EditEntityRecord,
> = EditEntityBaseField<TRecord> & {
  kind: EditEntityFormFieldKind;
  label: string;
  type?: import("./fields/edit-entity-field.types").FormControlTextType;
  prefixIcon?: string;
  suffix?: string;
  hint?: EditEntityConditionalValue<TRecord, string | undefined>;
  tooltip?: EditEntityConditionalValue<TRecord, string | undefined>;
  placeholder?: string;
  hasCopyBtn?: boolean;
  autocomplete?: string;
  step?: number;
  isInteger?: boolean;
  minRows?: number;
  maxRows?: number;
  height?: string;
  quickOptions?: Array<number | string>;
  labelPosition?: "before" | "after";
  indeterminate?: boolean;
  direction?: "row" | "column";
  multiple?: boolean;
  group?: boolean;
  options?:
    | import("./fields/edit-entity-field.types").IFormControlSelectOption[]
    | Observable<
        import("./fields/edit-entity-field.types").IFormControlSelectOption[]
      >
    | ((
        record: TRecord | undefined,
        formGroup: FormGroup,
      ) => import("./fields/edit-entity-field.types").IFormControlSelectOption[]);
  service?: import("./fields/edit-entity-field.types").AutocompleteFormFieldService<
    TRecord,
    unknown
  >;
  open?(value: unknown): void;
  included?: boolean;
  startLabel?: string;
  endLabel?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  showTicks?: boolean;
  bare?: boolean;
  discrete?: boolean;
  valuePosition?: "top" | "bottom";
  thumbFormatter?: (value: unknown) => number;
  thumbSuffix?: string;
  component?: ComponentType<unknown> | null;
  inputs?: Record<string, unknown>;
  fields?: Record<string, string>;
  position?: "bottom" | "top";
};

export type EditEntityDisplayField<
  TRecord extends EditEntityRecord = EditEntityRecord,
> = Omit<EditEntityBaseField<TRecord>, "kind" | "label"> & {
  kind: "display";
  label?: string;
  display: string | ((value?: unknown) => string | null);
  component?: Type<unknown>;
  componentInputs?: Record<string, unknown>;
};

export interface EditEntitySeparatorField<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  kind: "separator";
  id?: string;
  label?: string;
  labelColor?: string;
  divider?: boolean;
  dividerColor?: string;
  layout?: EditEntityLayout;
  visible?: EditEntityConditionalState<TRecord>;
}

export interface EditEntityMetadataField {
  kind: "metadata";
  name: string;
  defaultValue?: unknown;
}

export type EditEntityField<
  TRecord extends EditEntityRecord = EditEntityRecord,
> =
  | EditEntityFormField<TRecord>
  | EditEntityDisplayField<TRecord>
  | EditEntitySeparatorField<TRecord>
  | EditEntityMetadataField;

export type EditEntityCardKind = "fields" | "component";

export interface EditEntityCardActionContext<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  record: TRecord | undefined;
  formGroup: EditEntityFormGroup;
  options: EditEntityComponentOptions<TRecord>;
  section: EditEntitySection<TRecord>;
  card: EditEntityCard<TRecord>;
  action: EditEntityCardAction<TRecord>;
  option?: EditEntityCardMenuOption<TRecord>;
}

export type EditEntitySectionCardActionEvent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> = EditEntityCardActionContext<TRecord> & {
  optionId?: string;
  runtimeCard: EditEntityRuntimeCard<TRecord>;
  runtimeAction: EditEntityRuntimeCardAction<TRecord>;
  runtimeOption?: EditEntityRuntimeMenuOption<TRecord>;
};

export type EditEntityActionResult<
  TRecord extends EditEntityRecord = EditEntityRecord,
> =
  | boolean
  | TRecord
  | EditEntityDialogResult<TRecord>
  | undefined
  | null
  | void;

export interface EditEntityCardMenuOption<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  ariaLabel?: string;
  visible?: EditEntityConditionalState<TRecord>;
  disabled?: EditEntityConditionalState<TRecord>;
}

export interface EditEntityConfirmOptions {
  title?: string;
  message: string;
  ok?: string;
  cancel?: string;
}

export interface EditEntityCardActionBase<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  id?: string;
  type: "icon" | "button";
  icon?: string;
  label?: string;
  tooltip?: string;
  ariaLabel?: string;
  color?: string;
  visible?: EditEntityConditionalState<TRecord>;
  disabled?: EditEntityConditionalState<TRecord>;
  closeOnHandle?: boolean;
  confirm?: string | EditEntityConfirmOptions;
  menuOptions?: EditEntityCardMenuOption<TRecord>[];
  handler?: (
    context: EditEntityCardActionContext<TRecord>,
  ) =>
    | EditEntityActionResult<TRecord>
    | Promise<EditEntityActionResult<TRecord>>;
  menuHandler?: (
    optionId: string,
    context: EditEntityCardActionContext<TRecord>,
  ) =>
    | EditEntityActionResult<TRecord>
    | Promise<EditEntityActionResult<TRecord>>;
}

export type EditEntityCardAction<
  TRecord extends EditEntityRecord = EditEntityRecord,
> =
  | (EditEntityCardActionBase<TRecord> & { type: "icon"; icon: string })
  | (EditEntityCardActionBase<TRecord> & { type: "button"; label: string });

export interface EditEntityCardComponentContext<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  record: TRecord | undefined;
  formGroup: EditEntityFormGroup;
  options: EditEntityComponentOptions<TRecord>;
  section: EditEntitySection<TRecord>;
  card: EditEntityCard<TRecord>;
  cardActionEvents$?: Observable<EditEntitySectionCardActionEvent<TRecord>>;
}

export type EditEntityCardComponentInput<
  TRecord extends EditEntityRecord = EditEntityRecord,
> =
  | Record<string, unknown>
  | ((
      context: EditEntityCardComponentContext<TRecord>,
    ) => Record<string, unknown>);

export interface EditEntityCardHeaderValue<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  value: EditEntityValueProvider<TRecord, string | number | null | undefined>;
  format?: "raw" | "percentage";
}

export interface EditEntityCard<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  kind?: EditEntityCardKind;
  grid?: EditEntityGridOptions;
  layout?: EditEntityLayout;
  visible?: EditEntityConditionalState<TRecord>;
  fields?: EditEntityField<TRecord>[];
  component?: Type<unknown>;
  input?: EditEntityCardComponentInput<TRecord>;
  componentInputs?: Record<string, unknown>;
  headerValue?: EditEntityCardHeaderValue<TRecord>;
  completion?: false | EditEntityCompletion;
  actions?: EditEntityCardAction<TRecord>[];
}

export interface EditEntitySection<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  sectionMode?: EditEntitySectionMode;
  grid?: EditEntityGridOptions;
  visible?: EditEntityConditionalState<TRecord>;
  cards: EditEntityCard<TRecord>[];
  completion?: false | EditEntityCompletion;
}

export interface EditEntitySectionsOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  sections: EditEntitySection<TRecord>[];
  menuHeader?: string;
  showEmptyFields?: boolean;
  showEmptyFieldsToggle?: boolean;
  showEmptyFieldsLabel?: string;
}

export interface EditEntitySingleSectionOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  section: EditEntitySection<TRecord>;
  showEmptyFields?: boolean;
  showEmptyFieldsToggle?: boolean;
  showEmptyFieldsLabel?: string;
}

export interface EditEntityComponentDisplayContext<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  record: TRecord | undefined;
  formGroup: EditEntityFormGroup;
  options: EditEntityComponentOptions<TRecord>;
  displayOptions: EditEntityComponentDisplayOptions<TRecord>;
}

export type EditEntityComponentDisplayInput<
  TRecord extends EditEntityRecord = EditEntityRecord,
> =
  | Record<string, unknown>
  | ((
      context: EditEntityComponentDisplayContext<TRecord>,
    ) => Record<string, unknown>);

export interface EditEntityComponentDisplayOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  component: Type<unknown>;
  input?: EditEntityComponentDisplayInput<TRecord>;
  overflow?: boolean;
}

export interface EditEntityTabOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  label: string;
  icon?: string;
  svgIcon?: string;
  badge?: number;
  visible?: EditEntityConditionalState<TRecord>;
  displayOptions: EditEntityTabDisplayOptions<TRecord>;
}

export interface EditEntityTabsOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  tabs: EditEntityTabOptions<TRecord>[];
  tabIndex?: number;
}

export type EditEntityTabDisplayOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> =
  | EditEntitySectionsOptions<TRecord>
  | EditEntityComponentDisplayOptions<TRecord>
  | EditEntitySingleSectionOptions<TRecord>;

export type EditEntityDisplayOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> = EditEntityTabDisplayOptions<TRecord> | EditEntityTabsOptions<TRecord>;

export type EditEntityTitle<TRecord extends EditEntityRecord> =
  | string
  | ((context: EditEntityTitleContext<TRecord>) => string);

export interface EditEntityTitleContext<TRecord extends EditEntityRecord> {
  record: TRecord | undefined;
  formGroup: EditEntityFormGroup;
  value: Record<string, unknown>;
  updated: boolean;
}

export interface EditEntityActionContext<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  record: TRecord | undefined;
  formGroup: EditEntityFormGroup;
  options: EditEntityComponentOptions<TRecord>;
  action: EditEntityActionButton<TRecord>;
}

export interface EditEntityActionButton<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  label?: string;
  icon?: string;
  position?: "bottom" | "bottom-end" | "top";
  buttonType?: "text" | "raised";
  color?: string;
  contrastColor?: string;
  tooltip?: string;
  visible?: EditEntityConditionalState<TRecord>;
  disabled?: EditEntityConditionalState<TRecord>;
  visibility?: "upsert" | "create" | "update";
  closeOnHandle?: boolean;
  confirm?: string | EditEntityConfirmOptions;
  handle: (
    context: EditEntityActionContext<TRecord>,
  ) =>
    | EditEntityActionResult<TRecord>
    | Promise<EditEntityActionResult<TRecord>>;
}

export interface EditEntityActionComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  component: ComponentType<unknown>;
  position?: "bottom" | "bottom-end" | "top";
  input?:
    | Record<string, unknown>
    | ((
        context: EditEntityComponentOptions<TRecord>,
      ) => Record<string, unknown>);
}

export type EditEntityAction<
  TRecord extends EditEntityRecord = EditEntityRecord,
> = EditEntityActionButton<TRecord> | EditEntityActionComponent<TRecord>;

export interface EditEntityRemovableState {
  removable: boolean;
  reason?: string;
}

export interface EditEntityDataService<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  loadRecord?: () =>
    | Promise<TRecord | null | undefined>
    | Observable<TRecord | null | undefined>;
  create?: (
    value: Record<string, unknown>,
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
  ) => Promise<TRecord | false>;
  update?: (
    _id: string,
    value: Record<string, unknown>,
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
  ) => Promise<boolean | TRecord>;
  isRemovable?:
    | boolean
    | Promise<EditEntityRemovableState | boolean>
    | ((
        record: TRecord,
        value: Record<string, unknown>,
      ) => Promise<EditEntityRemovableState | boolean>);
  remove?: (_id: string) => Promise<boolean>;
  isArchivable?: boolean;
  archive?: (_id: string) => Promise<EditEntityArchiveState>;
  disableNotifications?: boolean;
  closeOnUpsert?: boolean;
}

export interface EditEntityComponentOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  record?: TRecord;
  loadRecord?: () =>
    | Promise<TRecord | null | undefined>
    | Observable<TRecord | null | undefined>;
  title?: EditEntityTitle<TRecord>;
  subtitle?: EditEntityTitle<TRecord>;
  loadingLabel?: string;
  errorLabel?: string;
  emptyLabel?: string;
  createLabel?: string;
  updateLabel?: string;
  closeLabel?: string;
  cancelLabel?: string;
  defaultValues?: Record<string, unknown>;
  displayOptions: EditEntityDisplayOptions<TRecord>;
  service?: EditEntityDataService<TRecord>;
  actions?: EditEntityAction<TRecord>[];
  focusOn?: string;
  validateOnEnter?: boolean;
  confirmOnWipClose?: boolean;
  showJsonDataButton?: boolean;
  connect?: () => EditEntityDialogConnection<TRecord>;
  prepareFormGroup?: (
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
  ) => void;
  ready?: (
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
  ) => void;
}

export interface EditEntityDialogResult<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  updated: boolean;
  created?: boolean;
  removed?: boolean;
  archived?: boolean;
  record?: TRecord;
}

export type EditEntityRenderKind =
  | "tabs"
  | "sections"
  | "component"
  | "section"
  | "empty";

export interface EditEntityRuntimeField<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  id: string;
  type: "field";
  source:
    | EditEntityFormField<TRecord>
    | EditEntityDisplayField<TRecord>
    | EditEntitySeparatorField<TRecord>;
  field?: EditEntityFormField<TRecord> | EditEntityDisplayField<TRecord>;
  separator?: EditEntitySeparatorField<TRecord>;
  kind: string;
  visible: boolean;
  enabled: boolean;
  countable: boolean;
  filled: boolean;
  required: boolean;
  missing: boolean;
  invalid: boolean;
  dirty: boolean;
  styles: Record<string, string>;
  classes: Record<string, boolean>;
}

export interface EditEntityRuntimeFieldBreak {
  id: string;
  type: "break";
}

export type EditEntityRuntimeFieldItem<
  TRecord extends EditEntityRecord = EditEntityRecord,
> = EditEntityRuntimeField<TRecord> | EditEntityRuntimeFieldBreak;

export interface EditEntityRuntimeMenuOption<
  TRecord extends EditEntityRecord = EditEntityRecord,
> extends EditEntityCardMenuOption<TRecord> {
  isVisible: boolean;
  isDisabled: boolean;
}

export interface EditEntityRuntimeCardAction<
  TRecord extends EditEntityRecord = EditEntityRecord,
> extends EditEntityCardActionBase<TRecord> {
  isVisible: boolean;
  isDisabled: boolean;
  runtimeMenuOptions?: EditEntityRuntimeMenuOption<TRecord>[];
}

export interface EditEntityRuntimeCard<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  id: string;
  type: "card";
  source: EditEntityCard<TRecord>;
  cardActionEventsKey?: string;
  label: string;
  icon?: string;
  tooltip?: string;
  kind: EditEntityCardKind;
  component?: Type<unknown>;
  componentInputs?: Record<string, unknown>;
  grid: EditEntityGridOptions;
  gridStyles: Record<string, string>;
  styles: Record<string, string>;
  classes: Record<string, boolean>;
  items: EditEntityRuntimeFieldItem<TRecord>[];
  headerValueLabel?: string;
  completionLabel?: string;
  completionColor?: string;
  validationStats: EditEntityValidationStats;
  validationSummary: EditEntityValidationSummary;
  done?: number | string | null;
  total?: number | string | null;
  runtimeActions: EditEntityRuntimeCardAction<TRecord>[];
}

export interface EditEntityRuntimeCardBreak {
  id: string;
  type: "break";
}

export type EditEntityRuntimeCardItem<
  TRecord extends EditEntityRecord = EditEntityRecord,
> = EditEntityRuntimeCard<TRecord> | EditEntityRuntimeCardBreak;

export interface EditEntityRuntimeSection<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  id: string;
  source: EditEntitySection<TRecord>;
  label: string;
  icon?: string;
  tooltip?: string;
  sectionMode: EditEntitySectionMode;
  cardCount: number;
  grid: EditEntityGridOptions;
  gridStyles: Record<string, string>;
  items: EditEntityRuntimeCardItem<TRecord>[];
  validationStats: EditEntityValidationStats;
  validationSummary: EditEntityValidationSummary;
  done?: number | string | null;
  total?: number | string | null;
  progress: boolean;
  statusColor: string;
}

export interface EditEntityTabRenderState<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  label: string;
  icon?: string;
  svgIcon?: string;
  badge?: number;
  isVisible: boolean;
  validationStats: EditEntityValidationStats;
  validationSummary: EditEntityValidationSummary;
  renderState: EditEntityRenderState<TRecord>;
}

export interface EditEntityRenderState<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  kind: EditEntityRenderKind;
  tabs?: EditEntityTabRenderState<TRecord>[];
  sections?: EditEntityRuntimeSection<TRecord>[];
  sectionsMenuHeader?: string;
  showEmptyFieldsToggle?: boolean;
  showEmptyFieldsLabel?: string;
  component?: Type<unknown>;
  componentInputs?: Record<string, unknown>;
  componentOverflow?: boolean;
  validationStats?: EditEntityValidationStats;
  validationSummary?: EditEntityValidationSummary;
}

export interface EditEntityRuntimeActionButton<
  TRecord extends EditEntityRecord = EditEntityRecord,
> extends EditEntityActionButton<TRecord> {
  isVisible: boolean;
  isDisabled: boolean;
}

export interface EditEntityRuntimeActionComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> extends EditEntityActionComponent<TRecord> {
  isVisible: boolean;
  isDisabled: boolean;
  componentInputs: Record<string, unknown>;
}

export type EditEntityRuntimeAction<
  TRecord extends EditEntityRecord = EditEntityRecord,
> =
  | EditEntityRuntimeActionButton<TRecord>
  | EditEntityRuntimeActionComponent<TRecord>;

export interface EditEntityDialogConnection<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  actions?: readonly EditEntityAction<TRecord>[];
  recordChanged?(record: TRecord | undefined): void;
  destroy?(): void;
}
