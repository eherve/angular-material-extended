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
} from "@eherve/angular-material-forms/core";
import { EntityDialogKeyboardHost } from "@eherve/angular-material-forms/editor";
import { EntityWizardComponent } from "./entity-wizard.component";
import { CreateEntityWizardComponentOptions } from "./create-entity-wizard.types";
@Component({
  selector: "ame-entity-wizard-dialog",
  imports: [EntityWizardComponent],
  templateUrl: "./entity-wizard-dialog.component.html",
  styleUrl: "./entity-wizard-dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityWizardDialog<
  TRecord extends EditEntityRecord = EditEntityRecord,
> extends EntityDialogKeyboardHost<TRecord, EntityWizardDialog<TRecord>> {
  @ViewChild(EntityWizardComponent)
  protected override editEntityComponent?: EntityWizardComponent<TRecord>;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: CreateEntityWizardComponentOptions<TRecord>,
    dialogRef: MatDialogRef<
      EntityWizardDialog<TRecord>,
      EditEntityDialogResult<TRecord>
    >,
    matDialog: MatDialog,
  ) {
    super(dialogRef, matDialog);
  }
}
