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
import { MatInputModule } from "@angular/material/input";
import { Subscription } from "rxjs";
import {
  EDIT_ENTITY_DIALOG_HOST,
  EditEntityDialogHost,
} from "../../edit-entity-dialog-host";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { Inject, Optional } from "@angular/core";

@Component({
  selector: "app-form-control-number",
  standalone: true,
  styleUrls: ["../../internal/clear-button.scss"],
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (control) {
      <mat-form-field [appearance]="appearance">
        <mat-label>{{ label }}</mat-label>
        @if (prefixIcon) {
          <mat-icon matIconPrefix>{{ prefixIcon }}</mat-icon>
        }
        @if (hasCopyBtn) {
          <button
            mat-icon-button
            matIconPrefix
            type="button"
            [disabled]="control.value == null"
            [attr.aria-label]="intl.messages.copy"
            (click)="copy($event)"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
        }
        <input
          matInput
          type="number"
          [required]="isRequired"
          [formControl]="control"
          [min]="min ?? null"
          [max]="max ?? null"
          [step]="step ?? null"
          [placeholder]="placeholder"
          (blur)="control.markAsTouched()"
        />
        @if (control.hasError("required")) {
          <mat-error>{{ intl.messages.required }}</mat-error>
        }
        @if (control.hasError("min")) {
          <mat-error>{{
            intl.messages.minimum.replace(
              "{value}",
              "" + control.getError("min").min
            )
          }}</mat-error>
        }
        @if (control.hasError("max")) {
          <mat-error>{{
            intl.messages.maximum.replace(
              "{value}",
              "" + control.getError("max").max
            )
          }}</mat-error>
        }
        @if (control.hasError("integer")) {
          <mat-error>{{ intl.messages.integer }}</mat-error>
        }
        @if (control.hasError("unique")) {
          <mat-error>{{ intl.messages.unique }}</mat-error>
        }
        @if (hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
        @if (suffix) {
          <span matTextSuffix>{{ suffix }}</span>
        }
        @if (
          control.value !== null &&
          control.value !== undefined &&
          !control.disabled
        ) {
          <button class="form-field-clear-btn"
            mat-icon-button
            matSuffix
            type="button"
            (click)="clear(); $event.stopPropagation()"
            [attr.aria-label]="intl.messages.clear"
          >
            <mat-icon>clear</mat-icon>
          </button>
        }
      </mat-form-field>
    }
  `,
})
export class FormControlNumberComponent implements OnDestroy {
  @Input() label = "";
  @Input() hint?: string;
  @Input() placeholder = "";
  @Input() suffix?: string;
  @Input() prefixIcon?: string;
  @Input() hasCopyBtn = false;
  @Input() step?: number;
  @Input() appearance: "fill" | "outline" = "outline";

  private _control?: FormControl<number | null>;
  @Input({ required: true }) set control(control: FormControl<number | null>) {
    if (this._control === control) return;
    this.removeOwnValidators(this._control);
    this._control = control;
    this.applyValidators();
  }
  get control(): FormControl<number | null> {
    return this._control!;
  }

  private integerValidator?: ValidatorFn;
  private minValidator?: ValidatorFn;
  private maxValidator?: ValidatorFn;
  private readonly ownedRequiredValidator: ValidatorFn = (control) =>
    Validators.required(control);
  private requiredValidator?: ValidatorFn;
  private _required = false;
  @Input() set required(value: boolean) {
    this._required = value;
    this.updateValidator(
      "requiredValidator",
      value ? this.ownedRequiredValidator : undefined,
    );
  }
  @Input() set min(value: number | string | undefined) {
    this._min = value == null ? undefined : Number(value);
    this.updateValidator(
      "minValidator",
      this._min == null ? undefined : Validators.min(this._min),
    );
  }
  get min(): number | undefined {
    return this._min;
  }
  private _min?: number;
  @Input() set max(value: number | string | undefined) {
    this._max = value == null ? undefined : Number(value);
    this.updateValidator(
      "maxValidator",
      this._max == null ? undefined : Validators.max(this._max),
    );
  }
  get max(): number | undefined {
    return this._max;
  }
  private _max?: number;
  @Input() set isInteger(value: boolean) {
    this._integer = value;
    this.updateValidator(
      "integerValidator",
      value
        ? (control) =>
            control.value != null && !Number.isInteger(control.value)
              ? { integer: true }
              : null
        : undefined,
    );
  }
  private _integer = false;

  get isRequired(): boolean {
    return (
      this.control?.hasValidator(Validators.required) ||
      (this.requiredValidator != null &&
        this.control?.hasValidator(this.requiredValidator)) ||
      false
    );
  }

  private readonly subscriptions: Subscription;
  constructor(
    readonly intl: EditEntityDialogIntl,
    private readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(EDIT_ENTITY_DIALOG_HOST)
    private readonly host?: EditEntityDialogHost,
  ) {
    this.subscriptions = this.intl.changes.subscribe(() =>
      this.cdr.markForCheck(),
    );
  }

  clear(): void {
    this.control?.markAsDirty();
    this.control?.markAsTouched();
    this.control?.setValue(null);
  }
  async copy(event: Event): Promise<void> {
    event.stopPropagation();
    const value = this.control?.value;
    if (value == null || !this.hasCopyBtn) return;
    await navigator.clipboard?.writeText(String(value));
    this.host?.notify(this.intl.messages.copied);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.removeOwnValidators(this.control);
  }

  private applyValidators(): void {
    if (this._required) this.requiredValidator = this.ownedRequiredValidator;
    if (this._min != null) this.minValidator = Validators.min(this._min);
    if (this._max != null) this.maxValidator = Validators.max(this._max);
    if (this._integer)
      this.integerValidator = (control) =>
        control.value != null && !Number.isInteger(control.value)
          ? { integer: true }
          : null;
    this.addOwnValidators(this.control);
  }
  private updateValidator(
    key:
      | "requiredValidator"
      | "minValidator"
      | "maxValidator"
      | "integerValidator",
    next?: ValidatorFn,
  ): void {
    const previous = this[key];
    if (previous) this.control?.removeValidators(previous);
    this[key] = next;
    if (next) this.control?.addValidators(next);
    this.control?.updateValueAndValidity();
  }
  private addOwnValidators(control?: AbstractControl | null): void {
    if (!control) return;
    for (const validator of [
      this.requiredValidator,
      this.minValidator,
      this.maxValidator,
      this.integerValidator,
    ])
      if (validator) control.addValidators(validator);
    control.updateValueAndValidity();
  }
  private removeOwnValidators(control?: AbstractControl | null): void {
    if (!control) return;
    for (const validator of [
      this.requiredValidator,
      this.minValidator,
      this.maxValidator,
      this.integerValidator,
    ])
      if (validator) control.removeValidators(validator);
    control.updateValueAndValidity();
  }
}
