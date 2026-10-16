import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import { NgComponentOutlet } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { DisplayFormField } from "../edit-entity-field.types";
import { Subscription } from "rxjs";
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
        *ngComponentOutlet="field.component; inputs: componentInputs"
      ></ng-container>
    } @else {
      <mat-form-field appearance="outline"
        ><mat-label>{{ field.label }}</mat-label
        ><input matInput [formControl]="control" hidden />
        <div [innerHTML]="display"></div
      ></mat-form-field>
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
  display = "";
  componentInputs: Record<string, unknown> = {};
  private sub?: Subscription;
  get control() {
    return this.formGroup.requireFormControl(this.field.name);
  }
  constructor(private readonly cdr: ChangeDetectorRef) {}
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
    this.display =
      typeof this.field.display === "string"
        ? this.field.display
        : (this.field.display(value) ?? "");
    this.componentInputs = { value, ...(this.field.componentInputs ?? {}) };
    this.cdr.markForCheck();
  }
}
