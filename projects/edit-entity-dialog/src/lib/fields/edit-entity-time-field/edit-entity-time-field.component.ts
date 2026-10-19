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
import { TimeFormField } from "../edit-entity-field.types";
import { syncChildValidationErrors } from "../../internal/date/control-errors";
import { toPickerTime, toTimeString } from "../../internal/date/date.helpers";

@Component({
  selector: "app-edit-entity-time-field",
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
    <mat-form-field [appearance]="field.appearance ?? 'outline'"
      ><mat-label>{{ field.label }}</mat-label>
      <input
        matInput
        [placeholder]="field.placeholder ?? ''"
        [matTimepicker]="picker"
        [matTimepickerMin]="min"
        [matTimepickerMax]="max"
        [formControl]="timeControl"
        (blur)="onBlur()"
      />
      <mat-timepicker-toggle matIconSuffix [for]="picker" /><mat-timepicker
        #picker
      />
      @if (timeControl.hasError("matTimepickerParse")) {
        <mat-error>{{ intl.messages.invalidTime }}</mat-error>
      }
      @if (timeControl.hasError("matTimepickerMin") && min) {
        <mat-error>{{
          intl.messages.timeMinimum.replace(
            "{value}",
            (min.toDate() | date: "shortTime") ?? ""
          )
        }}</mat-error>
      }
      @if (timeControl.hasError("matTimepickerMax") && max) {
        <mat-error>{{
          intl.messages.timeMaximum.replace(
            "{value}",
            (max.toDate() | date: "shortTime") ?? ""
          )
        }}</mat-error>
      }
      @if (
        !timeControl.hasError("matTimepickerParse") &&
        !timeControl.hasError("matTimepickerMin") &&
        !timeControl.hasError("matTimepickerMax") &&
        timeControl.hasError("required")
      ) {
        <mat-error>{{ intl.messages.required }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class EditEntityTimeFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnInit, OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: TimeFormField<TRecord>;
  control!: AbstractControl;
  min: Moment | null = null;
  max: Moment | null = null;
  timeControl = new FormControl<Moment | null>(null);
  private readonly intlSubscription: Subscription;
  private fieldSubscriptions = new Subscription();
  private syncingControl = false;
  private syncingTime = false;
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
    this.syncRequiredErrors();
    this.syncPickerErrors();
    this.control.disabled
      ? this.timeControl.disable({ emitEvent: false })
      : this.timeControl.enable({ emitEvent: false });
    this.fieldSubscriptions.add(
      this.control.statusChanges.subscribe(() => {
        this.control.disabled
          ? this.timeControl.disable({ emitEvent: false })
          : this.timeControl.enable({ emitEvent: false });
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
      this.timeControl.statusChanges.subscribe(() => this.syncPickerErrors()),
    );
    this.fieldSubscriptions.add(
      this.timeControl.valueChanges.subscribe((value) => {
        if (!this.syncingTime) {
          this.control.markAsDirty();
          this.syncToControl(value);
          this.syncPickerErrors();
        }
      }),
    );
  }
  onBlur(): void {
    this.timeControl.markAsTouched();
    this.control.markAsTouched();
  }
  private syncPickerErrors(): void {
    syncChildValidationErrors(
      this.control,
      [{ name: "time", control: this.timeControl }],
      this.mirroredErrors,
    );
  }
  private resolveBound(bound: TimeFormField<TRecord>["min"]): Moment | null {
    if (bound === undefined || bound === null) return null;
    return toPickerTime(
      typeof bound === "string"
        ? (this.formGroup.getControl(bound)?.value ?? bound)
        : bound,
    );
  }
  private watchBound(
    bound: TimeFormField<TRecord>["min"],
    update: (value: Moment | null) => void,
  ): void {
    if (typeof bound !== "string") return;
    const source = this.formGroup.getControl(bound);
    if (source)
      this.fieldSubscriptions.add(
        source.valueChanges.subscribe((value) => {
          update(toPickerTime(value));
          this.cdr.markForCheck();
        }),
      );
  }
  private syncFromControl(value: unknown): void {
    const next = toPickerTime(value);
    if (sameTime(this.timeControl.value, next)) return;
    this.syncingTime = true;
    this.timeControl.setValue(next, { emitEvent: false });
    this.syncingTime = false;
  }
  private syncToControl(value: Moment | null): void {
    const next = toTimeString(value);
    if ((toTimeString(this.control.value) ?? null) === (next ?? null)) return;
    this.syncingControl = true;
    this.control.setValue(next);
    this.syncingControl = false;
  }
  private syncRequiredErrors(): void {
    const errors = { ...(this.timeControl.errors ?? {}) };
    if (this.control.hasError("required")) errors["required"] = true;
    else delete errors["required"];
    this.timeControl.setErrors(Object.keys(errors).length ? errors : null);
  }
}
function sameTime(a: Moment | null, b: Moment | null): boolean {
  return (!a && !b) || (!!a && !!b && a.valueOf() === b.valueOf());
}
