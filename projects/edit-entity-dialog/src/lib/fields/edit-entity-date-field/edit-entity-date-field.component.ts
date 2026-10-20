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
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { isObservable, Observable, Subscription } from "rxjs";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { DateFormField } from "../edit-entity-field.types";
import {
  normalizeIncludedDate,
  toDate,
} from "../../internal/date/date.helpers";

@Component({
  selector: "app-edit-entity-date-field",
  standalone: true,
  styleUrls: ["../../internal/clear-button.scss"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field [appearance]="field.appearance ?? 'outline'">
      <mat-label>{{ field.label }}</mat-label>
      <input
        matInput
        [placeholder]="field.placeholder ?? ''"
        [min]="min"
        [max]="max"
        [matDatepicker]="picker"
        [formControl]="control"
      />
      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-datepicker #picker />
      @if (control.value && control.enabled) {
        <button class="form-field-clear-btn"
          mat-icon-button
          matSuffix
          type="button"
          [attr.aria-label]="intl.messages.clear"
          (click)="clearValue()"
        >
          <mat-icon>close</mat-icon>
        </button>
      }
      @if (lockedControl && canToggleLock) {
        <button
          matPrefix
          mat-icon-button
          type="button"
          data-lock-toggle
          [attr.aria-label]="intl.messages.toggleLock"
          (click)="toggleLock($event)"
        >
          @if (lockedControl.value) {
            <mat-icon>lock</mat-icon>
          } @else {
            <mat-icon>lock_open_right</mat-icon>
          }
        </button>
      }
      @if (control.hasError("matDatepickerParse")) {
        <mat-error>{{ intl.messages.invalidDate }}</mat-error>
      }
      @if (
        !control.hasError("matDatepickerParse") &&
        !control.hasError("matDatepickerMin") &&
        !control.hasError("matDatepickerMax") &&
        control.hasError("required")
      ) {
        <mat-error>{{ intl.messages.required }}</mat-error>
      }
      @if (control.hasError("matDatepickerMin") && min) {
        <mat-error>{{
          intl.messages.dateMinimum.replace(
            "{value}",
            (min | date: "short") ?? ""
          )
        }}</mat-error>
      }
      @if (control.hasError("matDatepickerMax") && max) {
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
export class EditEntityDateFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnInit, OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: DateFormField<TRecord>;
  min: Date | null = null;
  max: Date | null = null;
  canToggleLock = false;
  control!: FormControl<unknown>;
  lockedControl: AbstractControl | null = null;
  private readonly subscriptions = new Subscription();
  private fieldSubscriptions = new Subscription();
  private lockPermissionSubscription?: Subscription;

  constructor(
    readonly intl: EditEntityDialogIntl,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.subscriptions.add(intl.changes.subscribe(() => cdr.markForCheck()));
  }

  ngOnInit(): void {
    this.bindField();
  }
  ngOnChanges(): void {
    if (this.formGroup && this.field) this.bindField();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.fieldSubscriptions.unsubscribe();
    this.lockPermissionSubscription?.unsubscribe();
  }

  toggleLock(event: Event): void {
    event.stopImmediatePropagation();
    if (typeof this.field.canToggleLock === "function")
      this.refreshLockPermission();
    if (!this.canToggleLock || !this.lockedControl) return;
    this.lockedControl.setValue(!this.lockedControl.value);
  }

  clearValue(): void {
    if (this.control.disabled) return;
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.control.setValue(null);
  }

  private bindField(): void {
    this.fieldSubscriptions.unsubscribe();
    this.fieldSubscriptions = new Subscription();
    this.lockPermissionSubscription?.unsubscribe();
    this.control = this.formGroup.requireFormControl(this.field.name);
    this.lockedControl = this.field.lockedProperty
      ? this.formGroup.getControl(this.field.lockedProperty)
      : null;
    this.fieldSubscriptions.add(
      this.control.valueChanges.subscribe(() => this.cdr.markForCheck()),
    );
    this.min = this.resolveBound(this.field.min);
    this.max = this.resolveBound(this.field.max);
    this.watchBound(this.field.min, (value) => (this.min = value));
    this.watchBound(this.field.max, (value) => (this.max = value));
    if (this.field.included) {
      this.fieldSubscriptions.add(
        this.control.valueChanges.subscribe((value) => {
          const normalized = normalizeIncludedDate(value);
          const current = toDate(value);
          if (normalized && current?.getTime() !== normalized.getTime())
            this.control.setValue(normalized, { emitEvent: false });
        }),
      );
    }
    const permission = this.field.canToggleLock;
    if (isObservable(permission)) {
      this.canToggleLock = false;
      this.lockPermissionSubscription = (
        permission as Observable<boolean>
      ).subscribe((value) => {
        this.canToggleLock = value === true;
        this.cdr.markForCheck();
      });
    } else {
      this.refreshLockPermission();
      if (typeof permission === "function")
        this.fieldSubscriptions.add(
          this.formGroup.valueChanges.subscribe(() =>
            this.refreshLockPermission(),
          ),
        );
    }
    this.cdr.markForCheck();
  }

  private refreshLockPermission(): void {
    const permission = this.field.canToggleLock;
    this.canToggleLock =
      typeof permission === "function"
        ? permission(this.record, this.formGroup) === true
        : permission === true;
    this.cdr.markForCheck();
  }

  private resolveBound(bound: DateFormField<TRecord>["min"]): Date | null {
    if (bound === undefined || bound === null) return null;
    if (typeof bound === "string")
      return toDate(this.formGroup.getControl(bound)?.value);
    return toDate(bound);
  }

  private watchBound(
    bound: DateFormField<TRecord>["min"],
    update: (value: Date | null) => void,
  ): void {
    if (typeof bound !== "string") return;
    const control = this.formGroup.getControl(bound);
    if (control)
      this.fieldSubscriptions.add(
        control.valueChanges.subscribe((value) => {
          update(toDate(value));
          this.cdr.markForCheck();
        }),
      );
  }
}
