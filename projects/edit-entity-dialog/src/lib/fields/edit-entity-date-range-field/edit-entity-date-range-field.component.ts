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
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Subscription } from "rxjs";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { DateRangeFormField } from "../edit-entity-field.types";
import { syncChildValidationErrors } from "../../internal/date/control-errors";
import { isSameDate, toDate } from "../../internal/date/date.helpers";

@Component({
  selector: "app-edit-entity-date-range-field",
  standalone: true,
  styleUrls: ["../../internal/clear-button.scss"],
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container [formGroup]="rangeFormGroup">
      <mat-form-field [appearance]="field.appearance ?? 'outline'">
        <mat-label>{{ field.label }}</mat-label>
        <mat-date-range-input [rangePicker]="picker" [min]="min" [max]="max">
          <input
            matStartDate
            (blur)="markEngineControlTouched()"
            formControlName="start"
            [placeholder]="
              field.startPlaceholder ?? intl.messages.dateRangeStart
            "
          />
          <input
            matEndDate
            (blur)="markEngineControlTouched()"
            formControlName="end"
            [placeholder]="field.endPlaceholder ?? intl.messages.dateRangeEnd"
          />
        </mat-date-range-input>
        <mat-datepicker-toggle matIconSuffix [for]="picker" />
        <mat-date-range-picker #picker />
        @if (
          control.enabled &&
          (rangeFormGroup.controls.start.value ||
            rangeFormGroup.controls.end.value)
        ) {
          <button
            mat-icon-button
            class="form-field-clear-btn"
            type="button"
            matSuffix
            [attr.aria-label]="intl.messages.clear"
            (click)="clearValue(); $event.stopPropagation()"
          >
            <mat-icon>close</mat-icon>
          </button>
        }

        @if (rangeFormGroup.controls.start.hasError("matDatepickerParse")) {
          <mat-error>{{ intl.messages.invalidDateStart }}</mat-error>
        }
        @if (rangeFormGroup.controls.end.hasError("matDatepickerParse")) {
          <mat-error>{{ intl.messages.invalidDateEnd }}</mat-error>
        }
        @if (
          rangeFormGroup.controls.start.hasError("matDatepickerMin") && min
        ) {
          <mat-error>{{
            intl.messages.dateMinimum.replace(
              "{value}",
              (min | date: "short") ?? ""
            )
          }}</mat-error>
        }
        @if (rangeFormGroup.controls.end.hasError("matDatepickerMin") && min) {
          <mat-error>{{
            intl.messages.dateMinimum.replace(
              "{value}",
              (min | date: "short") ?? ""
            )
          }}</mat-error>
        }
        @if (
          rangeFormGroup.controls.start.hasError("matDatepickerMax") && max
        ) {
          <mat-error>{{
            intl.messages.dateMaximum.replace(
              "{value}",
              (max | date: "short") ?? ""
            )
          }}</mat-error>
        }
        @if (rangeFormGroup.controls.end.hasError("matDatepickerMax") && max) {
          <mat-error>{{
            intl.messages.dateMaximum.replace(
              "{value}",
              (max | date: "short") ?? ""
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
    </ng-container>
  `,
})
export class EditEntityDateRangeFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnInit, OnChanges, OnDestroy
{
  clearValue(): void {
    if (this.control.disabled) return;
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.rangeFormGroup.setValue({ start: null, end: null });
  }
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: DateRangeFormField<TRecord>;
  min: Date | null = null;
  max: Date | null = null;
  control!: AbstractControl;
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

  private bindField(): void {
    this.fieldSubscriptions.unsubscribe();
    this.fieldSubscriptions = new Subscription();
    this.control = this.formGroup.requireControl(this.field.name);
    this.min = this.resolveBound(this.field.min);
    this.max = this.resolveBound(this.field.max);
    this.watchBound(this.field.min, (value) => (this.min = value));
    this.watchBound(this.field.max, (value) => (this.max = value));
    this.syncRangeFromControl(this.control.value);
    this.syncRequiredErrors();
    this.control.disabled
      ? this.rangeFormGroup.disable({ emitEvent: false })
      : this.rangeFormGroup.enable({ emitEvent: false });
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
        if (this.syncingControl) return;
        this.syncRangeFromControl(value);
        this.syncRequiredErrors();
        this.syncPickerErrors();
      }),
    );
    this.fieldSubscriptions.add(
      this.rangeFormGroup.valueChanges.subscribe((value) => {
        if (this.syncingRange) return;
        this.control.markAsDirty();
        this.control.markAsTouched();
        this.syncControlFromRange(value.start ?? null, value.end ?? null);
        this.syncRequiredErrors();
        this.syncPickerErrors();
      }),
    );
    for (const child of Object.values(this.rangeFormGroup.controls))
      this.fieldSubscriptions.add(
        child.statusChanges.subscribe(() => this.syncPickerErrors()),
      );
  }
  private resolveBound(bound: DateRangeFormField<TRecord>["min"]): Date | null {
    return bound === undefined || bound === null
      ? null
      : typeof bound === "string"
        ? toDate(this.formGroup.getControl(bound)?.value)
        : toDate(bound);
  }
  private watchBound(
    bound: DateRangeFormField<TRecord>["min"],
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
  private syncRangeFromControl(value: unknown): void {
    const item = value as { start?: unknown; end?: unknown } | null;
    const start = toDate(item?.start);
    const end = toDate(item?.end);
    const current = this.rangeFormGroup.getRawValue();
    if (isSameDate(start, current.start) && isSameDate(end, current.end))
      return;
    this.syncingRange = true;
    this.rangeFormGroup.setValue({ start, end }, { emitEvent: false });
    this.syncingRange = false;
  }
  private syncControlFromRange(start: Date | null, end: Date | null): void {
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
    control: FormControl<Date | null>,
    enabled: boolean,
  ): void {
    const errors = { ...(control.errors ?? {}) };
    if (this.control.hasError("required") && enabled) errors["required"] = true;
    else delete errors["required"];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }
}
