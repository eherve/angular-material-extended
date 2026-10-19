import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NG_VALIDATORS, ReactiveFormsModule, ValidationErrors, Validator, ValidatorFn, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldAppearance, MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { DurationSegmentInputComponent } from "./duration-segment-input/duration-segment-input.component";
import { Subscription } from "rxjs";

const DEFAULT_QUICK_OPTIONS = [45, 120, 240, 480, 720, 1440];
type DurationValue = number | null;
type QuickOption = { value: number; label: string };

@Component({
  selector: "app-form-control-duration",
  standalone: true,
  imports: [DurationSegmentInputComponent, MatButtonModule, MatFormFieldModule, MatIconModule, MatMenuModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FormControlDurationComponent), multi: true }, { provide: NG_VALIDATORS, useExisting: forwardRef(() => FormControlDurationComponent), multi: true }],
  template: `
    <mat-form-field [appearance]="appearance">
      <mat-label>{{ label }}</mat-label>
      <app-duration-segment-input [formControl]="control" [placeholder]="placeholder" [hoursLabel]="intl.messages.durationHoursLabel" [minutesLabel]="intl.messages.durationMinutesLabel" (focusout)="onTouched()" />
      <button mat-icon-button matSuffix type="button" [disabled]="control.disabled" [matMenuTriggerFor]="quickMenu"><mat-icon>schedule</mat-icon></button>
      <mat-menu #quickMenu="matMenu">
        @for (option of quickOptionItems; track option.value) { <button mat-menu-item type="button" (click)="applyQuickOption(option.value)">{{ option.label }}</button> }
      </mat-menu>
      @if (hint) { <mat-hint>{{ hint }}</mat-hint> }
      @if (hasValue) { <button mat-icon-button matSuffix type="button" [disabled]="control.disabled" [attr.aria-label]="intl.messages.clear" (click)="clearValue(); $event.stopPropagation()"><mat-icon>clear</mat-icon></button> }
      @if (control.hasError('required')) { <mat-error>{{ intl.messages.required }}</mat-error> }
      @if (control.hasError('min') && minLabel) { <mat-error>{{ intl.messages.durationMinimum.replace('{value}', minLabel) }}</mat-error> }
      @if (control.hasError('max') && maxLabel) { <mat-error>{{ intl.messages.durationMaximum.replace('{value}', maxLabel) }}</mat-error> }
    </mat-form-field>
  `,
})
export class FormControlDurationComponent implements ControlValueAccessor, OnDestroy, Validator {
  @Input() label = "";
  @Input() hint?: string;
  @Input() appearance: MatFormFieldAppearance = "outline";
  @Input() set placeholder(value: string | undefined) { this.placeholderValue = value || "00:00"; }
  get placeholder(): string { return this.placeholderValue; }
  @Input() set required(value: boolean) { this.requiredValue = value !== false; this.refreshValidators(); }
  @Input() set min(value: number | string | undefined) { this.minValue = this.parseLimit(value); this.minLabel = this.minValue === null ? null : this.format(this.minValue); this.refreshValidators(); }
  @Input() set max(value: number | string | undefined) { this.maxValue = this.parseLimit(value); this.maxLabel = this.maxValue === null ? null : this.format(this.maxValue); this.refreshValidators(); }
  @Input() set quickOptions(values: Array<number | string> | undefined) {
    const source = values?.length ? values : DEFAULT_QUICK_OPTIONS;
    this.quickOptionItems = source.map(value => this.parse(value)).filter((value): value is number => value !== null).map(value => ({ value, label: this.format(value) }));
  }

  readonly control = new FormControl<DurationValue>(null);
  quickOptionItems: QuickOption[] = DEFAULT_QUICK_OPTIONS.map(value => ({ value, label: this.format(value) }));
  minLabel: string | null = null;
  maxLabel: string | null = null;
  hasValue = false;
  private minValue: number | null = null;
  private maxValue: number | null = null;
  private requiredValue = false;
  private placeholderValue = "00:00";
  private onChange: (value: DurationValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;
  private readonly subscriptions = new Subscription();

  constructor(readonly intl: EditEntityDialogIntl, private readonly cdr: ChangeDetectorRef) {
    this.subscriptions.add(this.control.valueChanges.subscribe(value => {
      this.hasValue = value !== null;
      this.onChange(value);
      this.cdr.markForCheck();
    }));
    this.subscriptions.add(this.intl.changes.subscribe(() => this.cdr.markForCheck()));
  }

  writeValue(value: DurationValue): void { this.control.setValue(value, { emitEvent: false }); this.hasValue = value !== null; this.cdr.markForCheck(); }
  registerOnChange(fn: (value: DurationValue) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  registerOnValidatorChange(fn: () => void): void { this.onValidatorChange = fn; }
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined) return null;
    if (this.minValue !== null && value < this.minValue) return { min: { min: this.minValue, actual: value } };
    if (this.maxValue !== null && value > this.maxValue) return { max: { max: this.maxValue, actual: value } };
    return null;
  }
  setDisabledState(disabled: boolean): void { disabled ? this.control.disable({ emitEvent: false }) : this.control.enable({ emitEvent: false }); }
  clearValue(): void { if (this.control.disabled) return; this.control.markAsTouched(); this.control.markAsDirty(); this.control.setValue(null); this.onTouched(); }
  applyQuickOption(value: number): void { if (!this.control.disabled) { this.control.markAsDirty(); this.control.setValue(value); } }
  ngOnDestroy(): void { this.subscriptions.unsubscribe(); }

  private refreshValidators(): void {
    const validators: ValidatorFn[] = [];
    if (this.requiredValue) validators.push(Validators.required);
    if (this.minValue !== null) validators.push(Validators.min(this.minValue));
    if (this.maxValue !== null) validators.push(Validators.max(this.maxValue));
    this.control.setValidators(validators);
    this.control.updateValueAndValidity({ emitEvent: false });
    this.onValidatorChange();
    this.cdr.markForCheck();
  }
  private parseLimit(value: number | string | undefined): number | null { return value === undefined ? null : this.parse(value); }
  private parse(value: number | string): number | null {
    if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? Math.trunc(value) : null;
    const raw = value.trim();
    const match = raw.match(/^(\d{1,3}):(\d{2})$/);
    if (match) { const hours = Number(match[1]); const minutes = Number(match[2]); return minutes <= 59 ? hours * 60 + minutes : null; }
    if (!/^\d+(\.\d+)?$/.test(raw)) return null;
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric >= 0 ? Math.trunc(numeric) : null;
  }
  private format(value: number): string { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
}
