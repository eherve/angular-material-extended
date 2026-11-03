/** @format */

import { installEagerFieldValidation } from "../internal/eager-field-validation";
import { setNonEditable } from "../internal/editability";
import { Injectable } from "@angular/core";
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { cloneDeep, each, isEqual } from "lodash-es";
import { SubSink } from "subsink";
import { debounceTime, filter, of, switchMap, tap, timer } from "rxjs";
import {
  isEqualEntity,
  readProperty,
  readPath as get,
} from "../internal/value.helpers";
import {
  EditEntityControlStateApi,
  EditEntityFormControl,
  EditEntityFormGroup,
} from "../classes/edit-entity-form-group";
import {
  EditEntityComponentOptions,
  EditEntityConditionalState,
  EditEntityDisplayField,
  EditEntityField,
  EditEntityFormField,
  EditEntityRecord,
} from "../edit-entity-dialog.types";
import { EditEntityConditionalStateService } from "./edit-entity-conditional-state.service";

@Injectable()
export class EditEntityFormBuilderService<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  // Keep the independent disabled state while the lock temporarily forces disabled.
  private readonly lockDisabledControls = new WeakMap<
    AbstractControl,
    boolean
  >();

  constructor(
    private readonly conditionalStateService: EditEntityConditionalStateService<TRecord>,
  ) {}

  buildFormGroup(
    options: EditEntityComponentOptions<TRecord>,
    fields: EditEntityField<TRecord>[],
    subsink: SubSink,
    refresh: () => void,
  ): EditEntityFormGroup {
    const formGroup = new EditEntityFormGroup();
    const flatPathFieldNames = this.getFlatPathFieldNames(fields);

    each(fields, (field) =>
      this.addFieldControl(formGroup, field, options, flatPathFieldNames),
    );
    options.prepareFormGroup?.(formGroup, options);

    this.watchConditionalStates(fields, formGroup, options, subsink, refresh);
    this.applyControlStates(fields, formGroup, options);
    this.addControlValueChangeHooks(fields, formGroup, options, subsink);
    installEagerFieldValidation(fields, formGroup, subsink);

    formGroup.updateValueAndValidity();
    formGroup.setInitialValue(this.buildInitialComparisonValue(formGroup));
    return formGroup;
  }

  applyControlStates(
    fields: EditEntityField<TRecord>[],
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
  ): void {
    each(fields, (field) => {
      if (field.kind === "separator" || field.kind === "metadata") return;

      const control =
        formGroup.getControl<EditEntityControlStateApi>(field.name) ??
        undefined;
      if (!control) return;

      const visible = this.resolveState(
        field.visible,
        options.record,
        formGroup,
        true,
      );
      const disabled = this.resolveDisabledState(
        field,
        control,
        formGroup,
        options,
      );
      const required = this.resolveState(
        field.required,
        options.record,
        formGroup,
        false,
      );

      control.setVisible(visible);
      const nonEditable =
        !!options.record?._id &&
        !this.resolveEditable(field, formGroup, options);
      setNonEditable(control, nonEditable);
      const locked =
        field.kind === "date" &&
        !!field.lockedProperty &&
        formGroup.getControl(field.lockedProperty)?.value === true &&
        !this.resolveState(
          field.canToggleLock,
          options.record,
          formGroup,
          false,
        );
      if (locked) this.lockDisabledControls.set(control, disabled);
      else this.lockDisabledControls.delete(control);
      control.setDisabledState(disabled || locked);
      this.applyRequiredState(field, control, required);
    });
  }

  getEditableFields(
    fields: EditEntityField<TRecord>[],
  ): Array<EditEntityFormField<TRecord> | EditEntityDisplayField<TRecord>> {
    return fields.filter(
      (
        field,
      ): field is
        | EditEntityFormField<TRecord>
        | EditEntityDisplayField<TRecord> =>
        field.kind !== "separator" && field.kind !== "metadata",
    );
  }

  private addFieldControl(
    formGroup: EditEntityFormGroup,
    field: EditEntityField<TRecord>,
    options: EditEntityComponentOptions<TRecord>,
    flatPathFieldNames: Set<string>,
  ): void {
    if (field.kind === "separator") return;

    const value = this.getInitialValue(field, options);
    const control = new EditEntityFormControl({ value, disabled: false });
    if (field.kind !== "metadata") this.addStaticValidators(field, control);
    if (flatPathFieldNames.has(field.name))
      formGroup.setControl(field.name, control, { emitEvent: false });
    else formGroup.setPathControl(field.name, control, { emitEvent: false });

    if (
      field.kind === "date" &&
      field.lockedProperty &&
      !formGroup.getControl(field.lockedProperty)
    ) {
      const locked =
        get(options.record, field.lockedProperty) ??
        get(options.defaultValues, field.lockedProperty) ??
        false;
      formGroup.setPathControl(
        field.lockedProperty,
        new EditEntityFormControl(locked === true),
        { emitEvent: false },
      );
    }

    if (field.kind !== "metadata" && field.kind !== "display")
      this.addUniqueValidator(field, control, formGroup, options);
  }

  private applyRequiredState(
    _field: Exclude<
      EditEntityField<TRecord>,
      { kind: "separator" | "metadata" }
    >,
    control: EditEntityControlStateApi,
    required: boolean,
  ): void {
    control.setRequired(required);
  }

  private addStaticValidators(
    field: Exclude<
      EditEntityField<TRecord>,
      { kind: "separator" | "metadata" }
    >,
    control: AbstractControl,
  ): void {
    const validators: ValidatorFn[] = [];

    const pattern = field["pattern"];
    if (field.kind === "text" && pattern)
      validators.push(Validators.pattern(pattern));

    if (
      field.kind === "number" ||
      field.kind === "duration" ||
      field.kind === "slider"
    ) {
      const min = this.resolveFiniteNumber(field["min"]);
      const max = this.resolveFiniteNumber(field["max"]);
      if (min !== undefined) validators.push(Validators.min(min));
      if (max !== undefined) validators.push(Validators.max(max));
    }

    if (validators.length) control.addValidators(validators);
  }

  private resolveFiniteNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === "") return undefined;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : undefined;
  }

  private getFlatPathFieldNames(
    fields: EditEntityField<TRecord>[],
  ): Set<string> {
    const declaredFieldNames = new Set(
      fields
        .filter(
          (
            field,
          ): field is Exclude<
            EditEntityField<TRecord>,
            { kind: "separator" }
          > => field.kind !== "separator",
        )
        .map((field) => field.name),
    );
    const flatPathFieldNames = new Set<string>();

    declaredFieldNames.forEach((fieldName) => {
      const pathSegments = fieldName.split(".").filter(Boolean);
      if (pathSegments.length <= 1) return;

      for (let index = 1; index < pathSegments.length; index += 1) {
        const parentPath = pathSegments.slice(0, index).join(".");
        if (declaredFieldNames.has(parentPath)) {
          flatPathFieldNames.add(fieldName);
          return;
        }
      }
    });

    return flatPathFieldNames;
  }

  private getInitialValue(
    field: Exclude<EditEntityField<TRecord>, { kind: "separator" }>,
    options: EditEntityComponentOptions<TRecord>,
  ): unknown {
    const recordValue = get(options.record, field.name);
    if (recordValue !== undefined) return cloneDeep(recordValue);

    if (field.kind === "metadata") return cloneDeep(field.defaultValue);

    const defaultValue =
      field.defaultValue !== undefined
        ? field.defaultValue
        : get(options.defaultValues, field.name);
    return cloneDeep(defaultValue);
  }

  private buildInitialComparisonValue(
    formGroup: EditEntityFormGroup,
  ): Record<string, unknown> {
    return formGroup.getRawValue();
  }

  private watchConditionalStates(
    fields: EditEntityField<TRecord>[],
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
    subsink: SubSink,
    refresh: () => void,
  ): void {
    each(fields, (field) => {
      if (field.kind === "metadata") return;
      const update = (): void => {
        this.applyControlStates(fields, formGroup, options);
        refresh();
      };
      this.conditionalStateService.watch(field.visible, subsink, update);
      if (field.kind === "separator") return;
      this.conditionalStateService.watch(field.disabled, subsink, update);
      this.conditionalStateService.watch(field.required, subsink, update);
      if (field.kind === "date")
        this.conditionalStateService.watch(
          field.canToggleLock,
          subsink,
          update,
        );
    });

    subsink.add(
      formGroup.valueChanges.pipe(debounceTime(100)).subscribe((): void => {
        this.applyControlStates(fields, formGroup, options);
        refresh();
      }),
    );
  }

  private addControlValueChangeHooks(
    fields: EditEntityField<TRecord>[],
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
    subsink: SubSink,
  ): void {
    each(this.getEditableFields(fields), (field) => {
      if (!field.onValueChanges) return;

      const control = formGroup.getControl(field.name);
      if (!control) return;

      let previousValue = control.value;
      subsink.add(
        control.valueChanges
          .pipe(
            filter(
              (value) =>
                !isEqualEntity(previousValue, value) &&
                !isEqual(previousValue, value),
            ),
            tap((value) => (previousValue = value)),
          )
          .subscribe((value) =>
            field.onValueChanges?.(value, formGroup, options.record),
          ),
      );
    });
  }

  private resolveDisabledState(
    field: EditEntityFormField<TRecord> | EditEntityDisplayField<TRecord>,
    control: EditEntityControlStateApi,
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
  ): boolean {
    if (field.kind === "display") return true;
    if (options.record?._id && field.editable !== undefined)
      return !this.resolveEditable(field, formGroup, options);
    if (field.disabled === undefined)
      return this.lockDisabledControls.get(control) ?? control.disabled;
    return this.resolveState(field.disabled, options.record, formGroup, false);
  }

  private resolveEditable(
    field: EditEntityFormField<TRecord> | EditEntityDisplayField<TRecord>,
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
  ): boolean {
    if (field.editable === undefined) return true;
    if (typeof field.editable === "boolean") return field.editable;
    return field.editable(options.record, formGroup);
  }

  private resolveState(
    state: EditEntityConditionalState<TRecord> | undefined,
    record: TRecord | undefined,
    formGroup: EditEntityFormGroup,
    fallback: boolean,
  ): boolean {
    return this.conditionalStateService.resolve(
      state,
      record,
      formGroup,
      fallback,
    );
  }

  private addUniqueValidator(
    field: EditEntityFormField<TRecord> | EditEntityDisplayField<TRecord>,
    control: AbstractControl,
    formGroup: EditEntityFormGroup,
    options: EditEntityComponentOptions<TRecord>,
  ): void {
    if (!field.unique) return;

    const validator: AsyncValidatorFn = (currentControl: AbstractControl) => {
      const value = currentControl.value;
      if (!currentControl.dirty || !value) return of(null);

      return timer(500).pipe(
        switchMap(async () => {
          const isUnique = await field.unique?.(
            value,
            formGroup,
            options.record,
          );
          return isUnique ? null : { unique: value };
        }),
      );
    };

    control.addAsyncValidators(validator);
  }
}
