import { inject, Injectable } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import {
  EditEntityComponentOptions,
  EditEntityDialogResult,
  EditEntityRecord,
} from "@eherve/angular-material-forms/core";
import {
  EntityDialogLauncher,
  EntityDialogNestedOptions,
  EntityDialogOpenConfig,
} from "@eherve/angular-material-forms/editor";
import { EditEntityDialog } from "./components/edit-entity-dialog/edit-entity-dialog.component";
export type EditEntityDialogNestedOptions = EntityDialogNestedOptions;
export type EditEntityDialogOpenConfig<TRecord extends EditEntityRecord> =
  EntityDialogOpenConfig<TRecord>;
@Injectable({ providedIn: "root" })
export class EditEntityDialogService {
  private readonly launcher = inject(EntityDialogLauncher);
  open<TRecord extends EditEntityRecord>(
    options: EditEntityComponentOptions<TRecord>,
    config: EditEntityDialogOpenConfig<TRecord> = {},
  ): MatDialogRef<EditEntityDialog<TRecord>, EditEntityDialogResult<TRecord>> {
    return this.launcher.open(EditEntityDialog<TRecord>, options, config);
  }
}
