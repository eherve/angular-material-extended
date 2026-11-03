import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  EditEntityRecord,
  EditEntityDialogResult,
  EditEntityComponentOptions,
} from "@eherve/angular-material-forms/core";
import { EntityDialogKeyboardHost } from "@eherve/angular-material-forms/editor";
import { EditEntityComponent } from "../edit-entity-component/edit-entity-component.component";
@Component({
  selector: "app-edit-entity-dialog",
  imports: [EditEntityComponent],
  templateUrl: "./edit-entity-dialog.component.html",
  styleUrl: "./edit-entity-dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEntityDialog<
  TRecord extends EditEntityRecord = EditEntityRecord,
> extends EntityDialogKeyboardHost<TRecord, EditEntityDialog<TRecord>> {
  @ViewChild(EditEntityComponent)
  protected override editEntityComponent?: EditEntityComponent<TRecord>;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: EditEntityComponentOptions<TRecord>,
    dialogRef: MatDialogRef<
      EditEntityDialog<TRecord>,
      EditEntityDialogResult<TRecord>
    >,
    matDialog: MatDialog,
  ) {
    super(dialogRef, matDialog);
  }
}
