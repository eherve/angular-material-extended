/** @format */

import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { cloneDeep, each, has, isEqual, keys, set } from "lodash-es";
import { debounceTime } from "rxjs";
import { SubSink } from "subsink";
import {
  isEqualEntity,
  readProperty,
  readPath as get,
} from "../internal/value.helpers";

export type EditEntityControlStateApi = AbstractControl & {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  setDisabledState: (disabled: boolean) => void;
  setRequired: (required: boolean) => void;
};

export class EditEntityFormControl
  extends FormControl<unknown>
  implements EditEntityControlStateApi
{
  isVisible = true;

  setVisible(visible: boolean): void {
    this.isVisible = visible;
  }

  setDisabledState(disabled: boolean): void {
    if (disabled && this.enabled) this.disable();
    else if (!disabled && this.disabled) this.enable();
  }

  setRequired(required: boolean): void {
    if (required && !this.hasValidator(Validators.required)) {
      this.addValidators(Validators.required);
      this.updateValueAndValidity();
      return;
    }

    if (!required && this.hasValidator(Validators.required)) {
      this.removeValidators(Validators.required);
      this.updateValueAndValidity();
    }
  }
}

export class EditEntityFormGroup extends FormGroup {
  rawValue: Record<string, unknown> = {};

  get initialValue(): Record<string, unknown> {
    return this._initialValue;
  }

  get isUpdated(): boolean {
    return this._isUpdated;
  }

  get updatedValue(): Record<string, unknown> {
    return this._updatedValue;
  }

  private _initialValue: Record<string, unknown> = {};
  private _isUpdated = false;
  private _updatedValue: Record<string, unknown> = {};
  private readonly subsink = new SubSink();

  constructor(controls: Record<string, AbstractControl> = {}) {
    super(controls);
    this.resetInitialValue();
    this.subsink.add(
      this.valueChanges.pipe(debounceTime(50)).subscribe((): void => {
        this.rawValue = this.getRawValue();
        this.checkIsUpdated();
      }),
    );
  }

  override getRawValue(): Record<string, unknown> {
    return cloneDeep(super.getRawValue());
  }

  getControl<TControl extends AbstractControl = AbstractControl>(
    path: string,
  ): TControl | null {
    const directControl = (
      this.controls as Record<string, AbstractControl | undefined>
    )[path];
    const control = directControl ?? this.get(path) ?? null;

    if (!control) return null;

    return ensureEditEntityControlStateApi(control) as unknown as TControl;
  }

  requireControl<TControl extends AbstractControl = AbstractControl>(
    path: string,
  ): TControl {
    const control = this.getControl<TControl>(path);
    if (!control)
      throw new Error(`Missing edit entity form control for path "${path}"`);
    return control;
  }

  requireFormControl<TControl extends FormControl = FormControl>(
    path: string,
  ): TControl {
    const control = this.requireControl(path);
    if (!(control instanceof FormControl))
      throw new Error(
        `Edit entity form control at path "${path}" is not a FormControl`,
      );
    return control as TControl;
  }

  override addControl(
    name: string,
    control: AbstractControl,
    options?: { emitEvent?: boolean },
  ): void {
    super.addControl(name, control, options);
    this.setInitialControlValue(name, control);
    this.rawValue = this.getRawValue();
    this.checkIsUpdated();
  }

  override setControl(
    name: string,
    control: AbstractControl,
    options?: { emitEvent?: boolean },
  ): void {
    super.setControl(name, control, options);
    this.setInitialControlValue(name, control);
    this.rawValue = this.getRawValue();
    this.checkIsUpdated();
  }

  setPathControl(
    path: string,
    control: AbstractControl,
    options?: { emitEvent?: boolean },
  ): void {
    const pathSegments = path.split(".").filter(Boolean);
    if (pathSegments.length <= 1) {
      this.setControl(path, control, options);
      return;
    }

    const parentFormGroup = this.tryEnsurePathFormGroup(
      pathSegments.slice(0, -1),
      options,
    );
    if (!parentFormGroup) {
      this.setControl(path, control, options);
      return;
    }

    if (Object.prototype.hasOwnProperty.call(this.controls, path))
      super.removeControl(path, { emitEvent: false });

    parentFormGroup.setControl(
      pathSegments[pathSegments.length - 1],
      control,
      options,
    );
    this.setInitialControlValue(path, control);
    this.rawValue = this.getRawValue();
    this.checkIsUpdated();
  }

  patchPathValue(
    path: string,
    value: unknown,
    options?: { emitEvent?: boolean },
  ): void {
    const control = this.getControl(path);
    let patched = false;

    if (control) {
      control.patchValue(value, options);
      patched = true;
    }

    if (!control) {
      const pathSegments = path.split(".").filter(Boolean);
      if (pathSegments.length > 1) {
        const parentPath = pathSegments.slice(0, -1).join(".");
        const parentControl = this.getControl(parentPath);
        if (parentControl instanceof FormGroup) {
          parentControl.patchValue(
            { [pathSegments[pathSegments.length - 1]]: value },
            options,
          );
          patched = true;
        }
      }
    }

    const descendantPatched = this.patchFlatDescendantControls(path, value);
    if (patched || descendantPatched) {
      this.rawValue = this.getRawValue();
      this.checkIsUpdated();
    }
  }

  destroy(): void {
    this.subsink.unsubscribe();
  }

  resetInitialValue(paths?: string | string[]): void {
    this.rawValue = this.getRawValue();

    if (!paths) {
      this.setInitialValue(this.rawValue);
      return;
    }

    const pathList = Array.isArray(paths) ? paths : [paths];
    each(pathList, (path) => {
      if (Object.prototype.hasOwnProperty.call(this.controls, path)) {
        this._initialValue[path] = cloneDeep(this.rawValue[path]);
        return;
      }
      set(this._initialValue, path, get(this.rawValue, path));
    });

    this.checkIsUpdated();
  }

  setInitialValue(value: Record<string, unknown>): void {
    this.rawValue = this.getRawValue();
    this._initialValue = cloneDeep(value);
    this.checkIsUpdated();
  }

  private tryEnsurePathFormGroup(
    pathSegments: string[],
    options?: { emitEvent?: boolean },
  ): FormGroup | null {
    let currentFormGroup: FormGroup = this;

    for (const pathSegment of pathSegments) {
      const existingControl = currentFormGroup.controls[pathSegment];
      if (existingControl instanceof FormGroup) {
        currentFormGroup = existingControl;
        continue;
      }

      if (existingControl) return null;

      const nextFormGroup = ensureEditEntityControlStateApi(
        new FormGroup({}),
      ) as unknown as FormGroup;
      currentFormGroup.setControl(pathSegment, nextFormGroup, options);
      currentFormGroup = nextFormGroup;
    }

    return currentFormGroup;
  }

  private setInitialControlValue(name: string, control: AbstractControl): void {
    const value = cloneDeep(control.getRawValue());

    if (Object.prototype.hasOwnProperty.call(this.controls, name)) {
      this._initialValue[name] = value;
      return;
    }

    set(this._initialValue, name, value);
  }

  private patchFlatDescendantControls(path: string, value: unknown): boolean {
    const descendantPathPrefix = `${path}.`;
    let patched = false;

    each(keys(this.controls), (controlName) => {
      if (!controlName.startsWith(descendantPathPrefix)) return;

      const descendantPath = controlName.slice(descendantPathPrefix.length);
      if (!has(value, descendantPath)) return;

      const descendantControl = this.controls[controlName];
      descendantControl.patchValue(get(value, descendantPath), {
        emitEvent: false,
      });
      patched = true;
    });

    return patched;
  }

  private checkIsUpdated(): void {
    this._updatedValue =
      this.getFormGroupUpdatedValue(this, this._initialValue) ?? {};
    this._isUpdated = keys(this._updatedValue).length > 0;
  }

  private getFormGroupUpdatedValue(
    formGroup: FormGroup,
    value: unknown,
  ): Record<string, unknown> | undefined {
    const changedValues: Record<string, unknown> = {};

    each(keys(formGroup.controls), (key) => {
      const control = formGroup.controls[key];
      const keyValue = readProperty(value, key);

      if (control instanceof FormGroup) {
        const embeddedChangedValues = this.getFormGroupUpdatedValue(
          control,
          keyValue,
        );
        if (embeddedChangedValues && keys(embeddedChangedValues).length)
          changedValues[key] = embeddedChangedValues;
        return;
      }

      if (control instanceof FormArray) {
        const embeddedChangedValues = this.getFormArrayUpdatedValue(
          control,
          keyValue,
        );
        if (embeddedChangedValues) changedValues[key] = embeddedChangedValues;
        return;
      }

      const rawValue = control.getRawValue();
      if (!isEqualEntity(rawValue, keyValue) && !isEqual(rawValue, keyValue))
        changedValues[key] = rawValue;
    });

    return keys(changedValues).length ? changedValues : undefined;
  }

  private getFormArrayUpdatedValue(
    formArray: FormArray,
    value: unknown,
  ): unknown[] | undefined {
    const changedValues: unknown[] = [];

    each(formArray.controls, (control, index) => {
      const indexValue = readProperty(value, index);

      if (control instanceof FormGroup) {
        const rawValue = control.getRawValue();
        const data = this.getFormGroupUpdatedValue(control, indexValue);
        if (data && rawValue?._id !== undefined)
          changedValues.push({ _id: rawValue._id, ...data });
        else if (data) changedValues.push(data);
        return;
      }

      if (control instanceof FormArray) {
        const data = this.getFormArrayUpdatedValue(control, indexValue);
        if (data) changedValues.push(data);
        return;
      }

      const rawValue = control.getRawValue();
      if (
        !isEqualEntity(rawValue, indexValue) &&
        !isEqual(rawValue, indexValue)
      )
        changedValues[index] = rawValue;
    });

    return changedValues.length ? changedValues : undefined;
  }
}

export function ensureEditEntityControlStateApi(
  control: AbstractControl,
): EditEntityControlStateApi {
  const editControl = control as Partial<EditEntityControlStateApi> &
    AbstractControl;

  editControl.isVisible ??= true;

  editControl.setVisible ??= function setVisible(
    this: EditEntityControlStateApi,
    visible: boolean,
  ): void {
    this.isVisible = visible;
  };

  editControl.setDisabledState ??= function setDisabledState(
    this: EditEntityControlStateApi,
    disabled: boolean,
  ): void {
    if (disabled && this.enabled) this.disable();
    else if (!disabled && this.disabled) this.enable();
  };

  editControl.setRequired ??= function setRequired(
    this: EditEntityControlStateApi,
    required: boolean,
  ): void {
    if (required && !this.hasValidator(Validators.required)) {
      this.addValidators(Validators.required);
      this.updateValueAndValidity();
      return;
    }

    if (!required && this.hasValidator(Validators.required)) {
      this.removeValidators(Validators.required);
      this.updateValueAndValidity();
    }
  };

  return editControl as EditEntityControlStateApi;
}
