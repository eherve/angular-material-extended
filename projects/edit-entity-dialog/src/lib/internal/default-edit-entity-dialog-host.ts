import { Component, Inject, Injectable, inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatButtonModule } from "@angular/material/button";
import { firstValueFrom } from "rxjs";
import {
  EditEntityDialogHost,
  EditEntityDialogJsonSource,
} from "../edit-entity-dialog-host";
import { EditEntityConfirmOptions } from "../edit-entity-dialog.types";
import { EditEntityDialogIntl } from "../edit-entity-dialog.intl";
@Component({
  selector: "ngx-mat-edit-confirm",
  imports: [MatDialogModule, MatButtonModule],
  template: `<h2 mat-dialog-title>
      {{ data.title ?? intl.messages.confirmation }}
    </h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content
    ><mat-dialog-actions align="end"
      ><button mat-button [mat-dialog-close]="false">
        {{ data.cancel ?? intl.messages.no }}</button
      ><button mat-flat-button [mat-dialog-close]="true">
        {{ data.ok ?? intl.messages.yes }}
      </button></mat-dialog-actions
    >`,
})
class EditEntityConfirmDialog {
  readonly intl = inject(EditEntityDialogIntl);
  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: EditEntityConfirmOptions,
  ) {}
}
@Component({
  selector: "ngx-mat-edit-json",
  imports: [MatDialogModule, MatButtonModule],
  template: `<h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      @for (source of data.sources; track $index) {
        <h3>{{ source.label }}</h3>
        <pre>{{ source.text }}</pre>
      }</mat-dialog-content
    ><mat-dialog-actions align="end"
      ><button mat-button mat-dialog-close>
        {{ intl.messages.close }}
      </button></mat-dialog-actions
    >`,
  styles: ["pre {white-space:pre-wrap;overflow-wrap:anywhere}"],
})
class EditEntityJsonDialog {
  readonly intl = inject(EditEntityDialogIntl);
  constructor(
    @Inject(MAT_DIALOG_DATA)
    readonly data: {
      title: string;
      sources: { label: string; text: string }[];
    },
  ) {}
}
@Injectable({ providedIn: "root" })
export class DefaultEditEntityDialogHost implements EditEntityDialogHost {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  async confirm(options: EditEntityConfirmOptions): Promise<boolean> {
    return (
      (await firstValueFrom(
        this.dialog
          .open<
            EditEntityConfirmDialog,
            EditEntityConfirmOptions,
            boolean
          >(EditEntityConfirmDialog, { data: options, disableClose: true })
          .afterClosed(),
      )) === true
    );
  }
  notify(message: string): void {
    this.snackBar.open(message, undefined, { duration: 4500 });
  }
  showJson(
    title: string,
    sources: readonly EditEntityDialogJsonSource[],
  ): void {
    this.dialog.open(EditEntityJsonDialog, {
      data: {
        title,
        sources: sources.map((source) => ({
          label: source.label,
          text: JSON.stringify(source.value, null, 2),
        })),
      },
      width: "min(900px, 90vw)",
      maxHeight: "90vh",
    });
  }
}
