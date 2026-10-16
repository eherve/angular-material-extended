/** @format */

import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import {
  EditEntityDisplayField,
  EditEntityFormField,
  EditEntityRecord,
} from "../../edit-entity-dialog.types";

@Component({
  selector: "app-edit-entity-field-renderer",
  templateUrl: "./edit-entity-field-renderer.component.html",
  styleUrls: ["./edit-entity-field-renderer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EditEntityFieldRendererComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!:
    | EditEntityFormField<TRecord>
    | EditEntityDisplayField<TRecord>;
  @Input() record?: TRecord;
}
