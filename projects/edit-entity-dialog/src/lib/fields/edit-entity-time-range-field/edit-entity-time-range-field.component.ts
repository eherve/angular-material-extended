import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTimepickerModule } from "@angular/material/timepicker";
import { Moment } from "moment";
import { Subscription } from "rxjs";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { TimeRangeFormField } from "../edit-entity-field.types";
import { syncChildValidationErrors } from "../../internal/date/control-errors";
import {
  maxTime,
  minTime,
  toPickerTime,
  toTimeString,
} from "../../internal/date/date.helpers";

@Component({
  selector: "app-edit-entity-time-range-field",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="time-range" [formGroup]="rangeFormGroup">
      <mat-form-field [appearance]="field.appearance ?? 'outline'">
        @if (field.startLabel) {
          <mat-label>{{ field.startLabel }}</mat-label>
        } @else {
          <mat-label
            >{{ field.label }} - {{ intl.messages.rangeStart }}</mat-label
          >
        }
        <input
          matInput
          [matTimepicker]="startPicker"
          [matTimepickerMin]="min"
          [matTimepickerMax]="startMax"
          formControlName="start"
          (blur)="markEngineControlTouched()"
        />
        <mat-timepicker-toggle
          matIconSuffix
          [for]="startPicker"
        /><mat-timepicker #startPicker />
        @if (rangeFormGroup.controls.start.hasError("matTimepickerParse")) {
          <mat-error>{{ intl.messages.invalidTimeStart }}</mat-error>
        }
        @if (
          rangeFormGroup.controls.start.hasError("matTimepickerMin") && min
        ) {
          <mat-error>{{
            intl.messages.timeMinimum.replace(
              "{value}",
              (min.toDate() | date: "shortTime") ?? ""
            )
          }}</mat-error>
        }
        @if (
          rangeFormGroup.controls.start.hasError("matTimepickerMax") && startMax
        ) {
          <mat-error>{{
            intl.messages.timeMaximum.replace(
              "{value}",
              (startMax.toDate() | date: "shortTime") ?? ""
            )
          }}</mat-error>
        }
        @if (
          !rangeFormGroup.controls.start.hasError("matDatepickerParse") &&
          !rangeFormGroup.controls.start.hasError("matDatepickerMin") &&
          !rangeFormGroup.controls.start.hasError("matDatepickerMax") &&
          !rangeFormGroup.controls.start.hasError("mtxDatetimepickerParse") &&
          !rangeFormGroup.controls.start.hasError("mtxDatetimepickerMin") &&
          !rangeFormGroup.controls.start.hasError("mtxDatetimepickerMax") &&
          !rangeFormGroup.controls.start.hasError("matTimepickerParse") &&
          !rangeFormGroup.controls.start.hasError("matTimepickerMin") &&
          !rangeFormGroup.controls.start.hasError("matTimepickerMax") &&
          rangeFormGroup.controls.start.hasError("required")
        ) {
          <mat-error>{{ intl.messages.requiredTimeStart }}</mat-error>
        }
      </mat-form-field>
      <mat-form-field [appearance]="field.appearance ?? 'outline'"
        ><!-- @if preserves consumer-specific labels; fallback is localized below. -->
        @if (field.endLabel) {
          <mat-label>{{ field.endLabel }}</mat-label>
        } @else {
          <mat-label
            >{{ field.label }} - {{ intl.messages.rangeEnd }}</mat-label
          >
        }
        <input
          matInput
          [matTimepicker]="endPicker"
          [matTimepickerMin]="endMin"
          [matTimepickerMax]="max"
          formControlName="end"
          (blur)="markEngineControlTouched()"
        />
        <mat-timepicker-toggle matIconSuffix [for]="endPicker" /><mat-timepicker
          #endPicker
        />
        @if (rangeFormGroup.controls.end.hasError("matTimepickerParse")) {
          <mat-error>{{ intl.messages.invalidTimeEnd }}</mat-error>
        }
        @if (
          rangeFormGroup.controls.end.hasError("matTimepickerMin") && endMin
        ) {
          <mat-error>{{
            intl.messages.timeMinimum.replace(
              "{value}",
              (endMin.toDate() | date: "shortTime") ?? ""
            )
          }}</mat-error>
        }
        @if (rangeFormGroup.controls.end.hasError("matTimepickerMax") && max) {
          <mat-error>{{
            intl.messages.timeMaximum.replace(
              "{value}",
              (max.toDate() | date: "shortTime") ?? ""
            )
          }}</mat-error>
        }
        @if (
          !rangeFormGroup.controls.end.hasError("matDatepickerParse") &&
          !rangeFormGroup.controls.end.hasError("matDatepickerMin") &&
          !rangeFormGroup.controls.end.hasError("matDatepickerMax") &&
          !rangeFormGroup.controls.end.hasError("mtxDatetimepickerParse") &&
          !rangeFormGroup.controls.end.hasError("mtxDatetimepickerMin") &&
          !rangeFormGroup.controls.end.hasError("mtxDatetimepickerMax") &&
          !rangeFormGroup.controls.end.hasError("matTimepickerParse") &&
          !rangeFormGroup.controls.end.hasError("matTimepickerMin") &&
          !rangeFormGroup.controls.end.hasError("matTimepickerMax") &&
          rangeFormGroup.controls.end.hasError("required")
        ) {
          <mat-error>{{ intl.messages.requiredTimeEnd }}</mat-error>
        }
      </mat-form-field>
    </div>
  `,
})
export class EditEntityTimeRangeFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnInit, OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: TimeRangeFormField<TRecord>;
  control!: AbstractControl;
  min: Moment | null = null;
  max: Moment | null = null;
  startMax: Moment | null = null;
  endMin: Moment | null = null;
  rangeFormGroup = new FormGroup({
    start: new FormControl<Moment | null>(null),
    end: new FormControl<Moment | null>(null),
  });
  private readonly intlSubscription: Subscription;
  private fieldSubscriptions = new Subscription();
  private syncingControl = false;
  private syncingRange = false;
  private readonly mirroredErrors = new Map<string, unknown>();
  constructor(
    readonly intl: EditEntityDialogIntl,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.intlSubscription = intl.changes.subscribe(() => cdr.markForCheck());
  }
  ngOnInit(): void {
    this.bindField();
  }
  ngOnChanges(): void {
    if (this.formGroup && this.field) this.bindField();
  }
  ngOnDestroy(): void {
    this.fieldSubscriptions.unsubscribe();
    this.intlSubscription.unsubscribe();
  }
  private bindField(): void {
    this.fieldSubscriptions.unsubscribe();
    this.fieldSubscriptions = new Subscription();
    this.control = this.formGroup.requireControl(this.field.name);
    this.min = this.resolveBound(this.field.min);
    this.max = this.resolveBound(this.field.max);
    this.watchBound(this.field.min, (value) => (this.min = value));
    this.watchBound(this.field.max, (value) => (this.max = value));
    this.syncFromControl(this.control.value);
    this.control.disabled
      ? this.rangeFormGroup.disable({ emitEvent: false })
      : this.rangeFormGroup.enable({ emitEvent: false });
    this.syncRequiredErrors();
    this.syncPickerErrors();
    this.fieldSubscriptions.add(
      this.control.statusChanges.subscribe(() => {
        this.control.disabled
          ? this.rangeFormGroup.disable({ emitEvent: false })
          : this.rangeFormGroup.enable({ emitEvent: false });
        this.syncRequiredErrors();
        this.syncPickerErrors();
      }),
    );
    this.fieldSubscriptions.add(
      this.control.valueChanges.subscribe((value) => {
        if (!this.syncingControl) this.syncFromControl(value);
        this.syncRequiredErrors();
        this.syncPickerErrors();
        this.cdr.markForCheck();
      }),
    );
    this.fieldSubscriptions.add(
      this.rangeFormGroup.valueChanges.subscribe((value) => {
        if (!this.syncingRange) {
          this.control.markAsDirty();
          this.control.markAsTouched();
          this.syncToControl(value.start ?? null, value.end ?? null);
        }
        this.syncRequiredErrors();
        this.syncPickerErrors();
        this.updateConstraints();
        this.cdr.markForCheck();
      }),
    );
    for (const child of Object.values(this.rangeFormGroup.controls))
      this.fieldSubscriptions.add(
        child.statusChanges.subscribe(() => this.syncPickerErrors()),
      );
    this.updateConstraints();
  }
  private resolveBound(
    bound: TimeRangeFormField<TRecord>["min"],
  ): Moment | null {
    if (bound === undefined || bound === null) return null;
    return toPickerTime(
      typeof bound === "string"
        ? (this.formGroup.getControl(bound)?.value ?? bound)
        : bound,
    );
  }
  private watchBound(
    bound: TimeRangeFormField<TRecord>["min"],
    update: (value: Moment | null) => void,
  ): void {
    if (typeof bound !== "string") return;
    const source = this.formGroup.getControl(bound);
    if (source)
      this.fieldSubscriptions.add(
        source.valueChanges.subscribe((value) => {
          update(toPickerTime(value));
          this.updateConstraints();
          this.cdr.markForCheck();
        }),
      );
  }
  private syncFromControl(value: unknown): void {
    const item = value as { start?: unknown; end?: unknown } | null;
    const start = toPickerTime(item?.start);
    const end = toPickerTime(item?.end);
    if (
      sameTime(start, this.rangeFormGroup.controls.start.value) &&
      sameTime(end, this.rangeFormGroup.controls.end.value)
    )
      return;
    this.syncingRange = true;
    this.rangeFormGroup.setValue({ start, end }, { emitEvent: false });
    this.syncingRange = false;
    this.updateConstraints();
  }
  private syncToControl(start: Moment | null, end: Moment | null): void {
    const nextStart = toTimeString(start);
    const nextEnd = toTimeString(end);
    const next =
      nextStart && nextEnd ? { start: nextStart, end: nextEnd } : null;
    const current = this.control.value as {
      start?: unknown;
      end?: unknown;
    } | null;
    if (
      (toTimeString(current?.start) ?? null) === (next?.start ?? null) &&
      (toTimeString(current?.end) ?? null) === (next?.end ?? null)
    )
      return;
    this.syncingControl = true;
    this.control.setValue(next);
    this.syncingControl = false;
  }
  markEngineControlTouched(): void {
    this.control.markAsTouched();
  }
  private syncRequiredErrors(): void {
    this.syncRequiredError(
      this.rangeFormGroup.controls.start,
      !this.rangeFormGroup.controls.start.value,
    );
    this.syncRequiredError(
      this.rangeFormGroup.controls.end,
      !this.rangeFormGroup.controls.end.value,
    );
  }
  private syncPickerErrors(): void {
    syncChildValidationErrors(
      this.control,
      Object.entries(this.rangeFormGroup.controls).map(([name, control]) => ({
        name,
        control,
      })),
      this.mirroredErrors,
    );
  }
  private syncRequiredError(
    control: FormControl<Moment | null>,
    enabled: boolean,
  ): void {
    const errors = { ...(control.errors ?? {}) };
    if (this.control.hasError("required") && enabled) errors["required"] = true;
    else delete errors["required"];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }
  private updateConstraints(): void {
    this.startMax = minTime(this.max, this.rangeFormGroup.controls.end.value);
    this.endMin = maxTime(this.min, this.rangeFormGroup.controls.start.value);
  }
}
function sameTime(a: Moment | null, b: Moment | null): boolean {
  return (!a && !b) || (!!a && !!b && a.valueOf() === b.valueOf());
}
