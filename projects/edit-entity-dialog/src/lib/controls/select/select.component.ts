import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
} from "@angular/core";
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { Subscription } from "rxjs";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { IFormControlSelectOption } from "../../fields/edit-entity-field.types";

@Component({
  selector: "app-form-control-select",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (control) {
      <mat-form-field [appearance]="appearance">
        @if (label) {
          <mat-label>{{ label }}</mat-label>
        }
        @if (prefixIcon) {
          <mat-icon matIconPrefix>{{ prefixIcon }}</mat-icon>
        }
        <mat-select
          [formControl]="control"
          [required]="isRequired"
          [multiple]="multiple"
          [compareWith]="compareValues"
          (blur)="control.markAsTouched()"
        >
          <mat-select-trigger>
            @if (multiple) {
              @for (
                value of selectedValues(control.value);
                track $index;
                let last = $last
              ) {
                <span>{{ getOption(value)?.name ?? value }}</span>
                @if (!last) {
                  <span>, </span>
                }
              }
            } @else {
              {{ getOption(control.value)?.name ?? control.value }}
            }
          </mat-select-trigger>
          @if (group) {
            @for (groupName of groupNames; track groupName) {
              <mat-optgroup [label]="groupName">
                @for (option of optionsForGroup(groupName); track $index) {
                  <mat-option
                    [value]="option.value"
                    [disabled]="!!option.disabled"
                    >{{ option.name }}</mat-option
                  >
                }
              </mat-optgroup>
            }
          } @else {
            @for (option of options; track $index) {
              <mat-option
                [value]="option.value"
                [disabled]="!!option.disabled"
                >{{ option.name }}</mat-option
              >
            }
          }
        </mat-select>
        @if (hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
        @if (open && !multiple && control.value != null) {
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="open(control.value); $event.stopPropagation()"
            [attr.aria-label]="intl.messages.open"
          >
            <mat-icon>open_in_new</mat-icon>
          </button>
        }
        @if (!control.disabled && hasValue) {
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="clear(); $event.stopPropagation()"
            [attr.aria-label]="intl.messages.clear"
          >
            <mat-icon>clear</mat-icon>
          </button>
        }
        @if (suffix) {
          <span matTextSuffix>{{ suffix }}</span>
        }
        @if (control.hasError("required")) {
          <mat-error>{{ intl.messages.required }}</mat-error>
        }
      </mat-form-field>
    }
  `,
})
export class FormControlSelectComponent implements OnDestroy {
  @Input() label = "";
  @Input() hint?: string;
  @Input() prefixIcon?: string;
  @Input() suffix?: string;
  @Input() group = false;
  @Input() multiple = false;
  @Input() appearance: "fill" | "outline" = "outline";
  @Input() open?: (value: unknown) => void;
  private optionList: IFormControlSelectOption[] = [];
  @Input() set options(value: IFormControlSelectOption[]) {
    this.optionList = value ?? [];
    this.groupNames = [
      ...new Set(this.optionList.map((option) => option.group ?? "undefined")),
    ];
  }
  get options(): IFormControlSelectOption[] {
    return this.optionList;
  }
  groupNames: string[] = [];
  private _control?: FormControl<unknown>;
  @Input({ required: true }) set control(control: FormControl<unknown>) {
    if (this._control === control) return;
    this.removeValidator(this._control);
    this._control = control;
    this.addValidator(control);
  }
  get control(): FormControl<unknown> {
    return this._control!;
  }
  readonly requiredValidator: ValidatorFn = (control) =>
    Validators.required(control);
  private _required = false;
  @Input() set required(value: boolean) {
    this._required = value;
    if (this._control) {
      if (value) this._control.addValidators(this.requiredValidator);
      else this._control.removeValidators(this.requiredValidator);
      this._control.updateValueAndValidity();
    }
  }
  private readonly intlSubscription: Subscription;
  constructor(
    readonly intl: EditEntityDialogIntl,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.intlSubscription = intl.changes.subscribe(() => cdr.markForCheck());
  }
  get isRequired(): boolean {
    return (
      this.control?.hasValidator(Validators.required) ||
      this.control?.hasValidator(this.requiredValidator) ||
      false
    );
  }
  get hasValue(): boolean {
    return this.multiple
      ? Array.isArray(this.control?.value) && this.control!.value.length > 0
      : this.control?.value !== null && this.control?.value !== undefined;
  }
  selectedValues(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
  }
  getOption(value: unknown): IFormControlSelectOption | undefined {
    return this.options.find((option) =>
      this.compareValues(option.value, value),
    );
  }
  optionsForGroup(name: string): IFormControlSelectOption[] {
    return this.options.filter(
      (option) => (option.group ?? "undefined") === name,
    );
  }
  clear(): void {
    this.control?.markAsDirty();
    this.control?.markAsTouched();
    this.control?.setValue(this.multiple ? [] : null);
  }
  compareValues = (left: unknown, right: unknown): boolean =>
    Object.is(left, right) ||
    (!!left &&
      !!right &&
      typeof left === "object" &&
      typeof right === "object" &&
      (left as { _id?: unknown })._id !== undefined &&
      (left as { _id?: unknown })._id === (right as { _id?: unknown })._id);
  ngOnDestroy(): void {
    this.intlSubscription.unsubscribe();
    this.removeValidator(this.control);
  }
  private addValidator(control?: AbstractControl | null): void {
    if (control && this._required) {
      control.addValidators(this.requiredValidator);
      control.updateValueAndValidity();
    }
  }
  private removeValidator(control?: AbstractControl | null): void {
    if (control && this._required) {
      control.removeValidators(this.requiredValidator);
      control.updateValueAndValidity();
    }
  }
}
