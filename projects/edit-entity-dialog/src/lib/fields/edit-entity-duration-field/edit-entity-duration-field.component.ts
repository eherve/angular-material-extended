import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ReactiveFormsModule, Validators } from "@angular/forms";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { FormControlDurationComponent } from "../../controls/duration/duration.component";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { DurationFormField } from "../edit-entity-field.types";

@Component({
  selector: "app-edit-entity-duration-field",
  standalone: true,
  imports: [ReactiveFormsModule, FormControlDurationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-form-control-duration [showDays]="field.showDays ?? false" [formControl]="control" [label]="field.label" [hint]="field.hint" [placeholder]="field.placeholder" [min]="field.min" [max]="field.max" [quickOptions]="field.quickOptions" [required]="control.hasValidator(requiredValidator)" />`,
})
export class EditEntityDurationFieldComponent<TRecord extends EditEntityRecord = EditEntityRecord> {
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: DurationFormField<TRecord>;
  readonly requiredValidator = Validators.required;
  get control() { return this.formGroup.requireFormControl(this.field.name); }
}
