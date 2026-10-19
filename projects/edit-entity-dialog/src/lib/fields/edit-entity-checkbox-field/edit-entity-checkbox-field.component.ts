import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { CheckboxFormField } from "../edit-entity-field.types";
@Component({
  selector: "app-edit-entity-checkbox-field",
  standalone: true,
  imports: [MatCheckboxModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mat-checkbox
      [formControl]="formGroup.requireFormControl(field.name)"
      [labelPosition]="field.labelPosition ?? 'after'"
      [indeterminate]="!!field.indeterminate"
      >{{ field.label }}</mat-checkbox
    >
    @if (field.hint) {
      <div [innerHTML]="field.hint"></div>
    }`,
})
export class EditEntityCheckboxFieldComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: CheckboxFormField<TRecord>;
}
