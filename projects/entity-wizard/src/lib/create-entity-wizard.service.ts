import { inject, Injectable } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import {
  EditEntityDialogResult,
  EditEntityRecord,
} from "@eherve/angular-material-forms/core";
import {
  EntityDialogLauncher,
  EntityDialogOpenConfig,
} from "@eherve/angular-material-forms/editor";
import { CreateEntityWizardComponentOptions } from "./create-entity-wizard.types";
import { EntityWizardDialog } from "./entity-wizard-dialog.component";
export type CreateEntityWizardOpenConfig<TRecord extends EditEntityRecord> =
  EntityDialogOpenConfig<TRecord>;
@Injectable({ providedIn: "root" })
export class CreateEntityWizardService {
  private readonly launcher = inject(EntityDialogLauncher);
  open<TRecord extends EditEntityRecord>(
    options: CreateEntityWizardComponentOptions<TRecord>,
    config: CreateEntityWizardOpenConfig<TRecord> = {},
  ): MatDialogRef<
    EntityWizardDialog<TRecord>,
    EditEntityDialogResult<TRecord>
  > {
    if (!options.wizard?.steps.length || !("tabs" in options.displayOptions))
      throw new Error(
        "Use createEntityWizardOptions before opening a creation wizard",
      );
    return this.launcher.open(EntityWizardDialog<TRecord>, options, config);
  }
}
