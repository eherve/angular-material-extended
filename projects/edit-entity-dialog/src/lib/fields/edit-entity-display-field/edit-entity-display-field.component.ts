import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  signal,
} from "@angular/core";
import { NgComponentOutlet } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { DisplayFormField } from "../edit-entity-field.types";
import { Subscription } from "rxjs";
import moment from "moment";
import dayjs from "dayjs";
import { toDate } from "../../internal/date/date.helpers";
@Component({
  selector: "app-edit-entity-display-field",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    NgComponentOutlet,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (field.component) {
      <ng-container
        *ngComponentOutlet="field.component; inputs: componentInputs()"
      ></ng-container>
    } @else {
      <mat-form-field appearance="outline"
        ><mat-label>{{ field.label }}</mat-label
        ><input matInput [formControl]="control" hidden style="display: none" aria-hidden="true" tabindex="-1" />
        @if (field.display !== undefined) {
          <div [innerHTML]="display()"></div>
        } @else {
          <div>{{ display() }}</div>
        }
      </mat-form-field>
    }`,
})
export class EditEntityDisplayFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: DisplayFormField<TRecord>;
  readonly display = signal("");
  readonly componentInputs = signal<Record<string, unknown>>({});
  private sub?: Subscription;
  get control(): FormControl {
    return this.formGroup.requireFormControl(this.field.name);
  }
  ngOnChanges(): void {
    this.sub?.unsubscribe();
    this.refresh(this.control.value);
    this.sub = this.control.valueChanges.subscribe((value) =>
      this.refresh(value),
    );
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  private refresh(value: unknown): void {
    this.control.disable({ emitEvent: false });
    this.display.set(this.formatValue(value));
    this.componentInputs.set({ value, ...(this.field.componentInputs ?? {}) });
  }
  private formatValue(value: unknown): string {
    if (typeof this.field.display === "string") return this.field.display;
    if (this.field.display) return this.field.display(value) ?? "";
    const format = this.field.format ?? "DD/MM/YYYY HH[h]mm";
    if (moment.isMoment(value) || dayjs.isDayjs(value)) {
      return value.isValid() ? value.format(format) : "";
    }
    if (value instanceof Date || this.field.format !== undefined) {
      const date = toDate(value);
      return date ? moment(date).format(format) : "";
    }
    return value == null ? "" : String(value);
  }
}
