import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
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
import { MtxDatetimepickerModule } from "@ng-matero/extensions/datetimepicker";
import { Subscription } from "rxjs";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { DatetimeRangeFormField } from "../edit-entity-field.types";
import { syncChildValidationErrors } from "../../internal/date/control-errors";
import {
  isSameDate,
  maxDate,
  minDate,
  toDate,
} from "../../internal/date/date.helpers";

@Component({
  selector: "app-edit-entity-datetime-range-field",
  standalone: true,
  styleUrls: ["../../internal/clear-button.scss"],
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MtxDatetimepickerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="datetime-range" [formGroup]="rangeFormGroup">
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
          [mtxDatetimepicker]="startPicker"
          [min]="min"
          [max]="startMax"
          formControlName="start"
          (blur)="markEngineControlTouched()"
        />
        <mtx-datetimepicker-toggle
          matIconSuffix
          [for]="startPicker"
        /><mtx-datetimepicker
          #startPicker
          type="datetime"
          [timeInput]="true"
          [twelvehour]="false"
        />

        @if (control.enabled && rangeFormGroup.controls.start.value) {
          <button
            mat-icon-button
            class="form-field-clear-btn"
            type="button"
            matSuffix
            [attr.aria-label]="intl.messages.clear"
            (click)="clearEndpoint('start'); $event.stopPropagation()"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
        @if (rangeFormGroup.controls.start.hasError("mtxDatetimepickerParse")) {
          <mat-error>{{ intl.messages.invalidDateStart }}</mat-error>
        }
        @if (
          rangeFormGroup.controls.start.hasError("mtxDatetimepickerMin") && min
        ) {
          <mat-error>{{
            intl.messages.dateMinimum.replace(
              "{value}",
              (min | date: "short") ?? ""
            )
          }}</mat-error>
        }
        @if (
          rangeFormGroup.controls.start.hasError("mtxDatetimepickerMax") &&
          startMax
        ) {
          <mat-error>{{
            intl.messages.dateMaximum.replace(
              "{value}",
              (startMax | date: "short") ?? ""
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
          <mat-error>{{ intl.messages.requiredDateStart }}</mat-error>
        }
      </mat-form-field>
      <mat-form-field [appearance]="field.appearance ?? 'outline'">
        @if (field.endLabel) {
          <mat-label>{{ field.endLabel }}</mat-label>
        } @else {
          <mat-label
            >{{ field.label }} - {{ intl.messages.rangeEnd }}</mat-label
          >
        }
        <input
          matInput
          [mtxDatetimepicker]="endPicker"
          [min]="endMin"
          [max]="max"
          formControlName="end"
          (blur)="markEngineControlTouched()"
        />
        <mtx-datetimepicker-toggle
          matIconSuffix
          [for]="endPicker"
        /><mtx-datetimepicker
          #endPicker
          type="datetime"
          [timeInput]="true"
          [twelvehour]="false"
        />

        @if (control.enabled && rangeFormGroup.controls.end.value) {
          <button
            mat-icon-button
            class="form-field-clear-btn"
            type="button"
            matSuffix
            [attr.aria-label]="intl.messages.clear"
            (click)="clearEndpoint('end'); $event.stopPropagation()"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
        @if (rangeFormGroup.controls.end.hasError("mtxDatetimepickerParse")) {
          <mat-error>{{ intl.messages.invalidDateEnd }}</mat-error>
        }
        @if (
          rangeFormGroup.controls.end.hasError("mtxDatetimepickerMin") && endMin
        ) {
          <mat-error>{{
            intl.messages.dateMinimum.replace(
              "{value}",
              (endMin | date: "short") ?? ""
            )
          }}</mat-error>
        }
        @if (
          rangeFormGroup.controls.end.hasError("mtxDatetimepickerMax") && max
        ) {
          <mat-error>{{
            intl.messages.dateMaximum.replace(
              "{value}",
              (max | date: "short") ?? ""
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
          <mat-error>{{ intl.messages.requiredDateEnd }}</mat-error>
        }
      </mat-form-field>
    </div>
  `,
})
export class EditEntityDatetimeRangeFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnInit, OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: DatetimeRangeFormField<TRecord>;
  control!: AbstractControl;
  min: Date | null = null;
  max: Date | null = null;
  rangeFormGroup = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
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
  get startMax(): Date | null {
    return minDate(this.max, toDate(this.rangeFormGroup.controls.end.value));
  }
  get endMin(): Date | null {
    return maxDate(this.min, toDate(this.rangeFormGroup.controls.start.value));
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
        this.cdr.markForCheck();
      }),
    );
    for (const child of Object.values(this.rangeFormGroup.controls))
      this.fieldSubscriptions.add(
        child.statusChanges.subscribe(() => this.syncPickerErrors()),
      );
  }
  clearEndpoint(endpoint: "start" | "end"): void {
    if (this.control.disabled) return;
    const child = this.rangeFormGroup.controls[endpoint];
    child.markAsDirty();
    child.markAsTouched();
    child.setValue(null);
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
  private syncRequiredError(
    control: FormControl<Date | null>,
    enabled: boolean,
  ): void {
    const errors = { ...(control.errors ?? {}) };
    if (this.control.hasError("required") && enabled) errors["required"] = true;
    else delete errors["required"];
    control.setErrors(Object.keys(errors).length ? errors : null);
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
  private resolveBound(
    bound: DatetimeRangeFormField<TRecord>["min"],
  ): Date | null {
    return bound === undefined || bound === null
      ? null
      : typeof bound === "string"
        ? toDate(this.formGroup.getControl(bound)?.value)
        : toDate(bound);
  }
  private watchBound(
    bound: DatetimeRangeFormField<TRecord>["min"],
    update: (value: Date | null) => void,
  ): void {
    if (typeof bound !== "string") return;
    const source = this.formGroup.getControl(bound);
    if (source)
      this.fieldSubscriptions.add(
        source.valueChanges.subscribe((value) => {
          update(toDate(value));
          this.cdr.markForCheck();
        }),
      );
  }
  private syncFromControl(value: unknown): void {
    const next = value as { start?: unknown; end?: unknown } | null;
    const start = toDate(next?.start);
    const end = toDate(next?.end);
    const current = this.rangeFormGroup.getRawValue();
    if (isSameDate(start, current.start) && isSameDate(end, current.end))
      return;
    this.syncingRange = true;
    this.rangeFormGroup.setValue({ start, end }, { emitEvent: false });
    this.syncingRange = false;
  }
  private syncToControl(start: Date | null, end: Date | null): void {
    const nextStart = toDate(start);
    const nextEnd = toDate(end);
    const next =
      nextStart && nextEnd ? { start: nextStart, end: nextEnd } : null;
    const current = this.control.value as {
      start?: unknown;
      end?: unknown;
    } | null;
    if (
      isSameDate(current?.start, next?.start) &&
      isSameDate(current?.end, next?.end)
    )
      return;
    this.syncingControl = true;
    this.control.setValue(next);
    this.syncingControl = false;
  }
}
