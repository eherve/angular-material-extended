import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { FormControlTextComponent } from "../../controls/text/text.component";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { TextFormField } from "../edit-entity-field.types";

@Component({
  selector: "app-edit-entity-text-field",
  standalone: true,
  imports: [FormControlTextComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-form-control-text
    [control]="control"
    [label]="field.label"
    [hint]="field.hint"
    [placeholder]="field.placeholder ?? ''"
    [autocomplete]="field.autocomplete ?? 'off'"
    [type]="field.type ?? 'text'"
    [appearance]="field.appearance ?? 'outline'"
    [prefixIcon]="field.prefixIcon"
    [suffix]="field.suffix"
    [pattern]="field.pattern"
    [max]="field.max"
    [hasCopyBtn]="field.hasCopyBtn ?? false"
  />`,
})
export class EditEntityTextFieldComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: TextFormField<TRecord>;
  get control() {
    return this.formGroup.requireFormControl(this.field.name);
  }
}
