import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { FormControlTextareaComponent } from "../../controls/textarea/textarea.component";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { TextareaFormField } from "../edit-entity-field.types";

@Component({
  selector: "app-edit-entity-textarea-field",
  standalone: true,
  imports: [FormControlTextareaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-form-control-textarea
    [control]="control"
    [label]="field.label"
    [hint]="field.hint"
    [placeholder]="field.placeholder ?? ''"
    [height]="field.height"
    [minRows]="field.minRows ?? 1"
    [maxRows]="field.maxRows ?? -1"
  />`,
})
export class EditEntityTextareaFieldComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: TextareaFormField<TRecord>;
  get control() {
    return this.formGroup.requireFormControl(this.field.name);
  }
}
