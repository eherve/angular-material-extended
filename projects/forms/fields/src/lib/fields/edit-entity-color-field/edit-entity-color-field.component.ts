import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import {
  EditEntityFormGroup,
  EditEntityRecord,
  ColorFormField,
  ColorValue,
} from "@eherve/angular-material-forms/core";
import { FormControlColorComponent } from "../../controls/color/color.component";

@Component({
  selector: "ame-edit-entity-color-field",
  standalone: true,
  imports: [FormControlColorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ame-color-picker
    [control]="control"
    [label]="field.label"
    [appearance]="field.appearance ?? 'outline'"
    [colors]="field.colors"
    [inline]="field.inline ?? false"
  />`,
})
export class EditEntityColorFieldComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: ColorFormField<TRecord>;
  get control(): FormControl<ColorValue | null> {
    return this.formGroup.requireFormControl(
      this.field.name,
    ) as FormControl<ColorValue | null>;
  }
}
