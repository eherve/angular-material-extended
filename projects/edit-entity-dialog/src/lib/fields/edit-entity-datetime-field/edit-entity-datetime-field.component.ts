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
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MtxDatetimepickerModule } from "@ng-matero/extensions/datetimepicker";
import { Subscription } from "rxjs";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { DatetimeFormField } from "../edit-entity-field.types";
import { toDate } from "../../internal/date/date.helpers";

@Component({
  selector: "app-edit-entity-datetime-field",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MtxDatetimepickerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field [appearance]="field.appearance ?? 'outline'"
      ><mat-label>{{ field.label }}</mat-label>
      <input
        matInput
        [placeholder]="field.placeholder ?? ''"
        [mtxDatetimepicker]="picker"
        [min]="min"
        [max]="max"
        [formControl]="control"
      />
      <mtx-datetimepicker-toggle
        matIconSuffix
        [for]="picker"
      /><mtx-datetimepicker
        #picker
        type="datetime"
        [timeInput]="true"
        [twelvehour]="false"
      />
      @if (control.value && control.enabled) {
        <button
          mat-icon-button
          matSuffix
          type="button"
          [attr.aria-label]="intl.messages.clear"
          (click)="clearValue()"
        >
          <mat-icon>close</mat-icon>
        </button>
      }
      @if (control.hasError("mtxDatetimepickerParse")) {
        <mat-error>{{ intl.messages.invalidDate }}</mat-error>
      }
      @if (
        !control.hasError("mtxDatetimepickerParse") &&
        !control.hasError("mtxDatetimepickerMin") &&
        !control.hasError("mtxDatetimepickerMax") &&
        control.hasError("required")
      ) {
        <mat-error>{{ intl.messages.required }}</mat-error>
      }
      @if (control.hasError("mtxDatetimepickerMin") && min) {
        <mat-error>{{
          intl.messages.dateMinimum.replace(
            "{value}",
            (min | date: "short") ?? ""
          )
        }}</mat-error>
      }
      @if (control.hasError("mtxDatetimepickerMax") && max) {
        <mat-error>{{
          intl.messages.dateMaximum.replace(
            "{value}",
            (max | date: "short") ?? ""
          )
        }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class EditEntityDatetimeFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnInit, OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: DatetimeFormField<TRecord>;
  control!: FormControl<unknown>;
  min: Date | null = null;
  max: Date | null = null;
  private readonly intlSubscription: Subscription;
  private boundSubscriptions = new Subscription();
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
    this.intlSubscription.unsubscribe();
    this.boundSubscriptions.unsubscribe();
  }
  clearValue(): void {
    if (this.control.disabled) return;
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.control.setValue(null);
  }
  private bindField(): void {
    this.boundSubscriptions.unsubscribe();
    this.boundSubscriptions = new Subscription();
    this.control = this.formGroup.requireFormControl(this.field.name);
    this.min = this.resolveBound(this.field.min);
    this.max = this.resolveBound(this.field.max);
    this.watchBound(this.field.min, (value) => (this.min = value));
    this.watchBound(this.field.max, (value) => (this.max = value));
    this.boundSubscriptions.add(
      this.control.valueChanges.subscribe(() => this.cdr.markForCheck()),
    );
  }
  private resolveBound(bound: DatetimeFormField<TRecord>["min"]): Date | null {
    return bound === undefined || bound === null
      ? null
      : typeof bound === "string"
        ? toDate(this.formGroup.getControl(bound)?.value)
        : toDate(bound);
  }
  private watchBound(
    bound: DatetimeFormField<TRecord>["min"],
    update: (value: Date | null) => void,
  ): void {
    if (typeof bound !== "string") return;
    const control = this.formGroup.getControl(bound);
    if (control)
      this.boundSubscriptions.add(
        control.valueChanges.subscribe((value) => {
          update(toDate(value));
          this.cdr.markForCheck();
          setTimeout(() => {
            if (!this.control.disabled) {
              this.control.updateValueAndValidity({ emitEvent: false });
              if (
                this.control.hasError("mtxDatetimepickerMin") ||
                this.control.hasError("mtxDatetimepickerMax")
              )
                this.control.markAsTouched();
            }
          });
        }),
      );
  }
}
