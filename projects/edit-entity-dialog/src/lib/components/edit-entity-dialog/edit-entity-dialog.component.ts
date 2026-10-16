/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Inject,
  ViewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { EditEntityComponent } from "../edit-entity-component/edit-entity-component.component";
import {
  EditEntityComponentOptions,
  EditEntityDialogResult,
  EditEntityRecord,
} from "../../edit-entity-dialog.types";

@Component({
  selector: "app-edit-entity-dialog",
  templateUrl: "./edit-entity-dialog.component.html",
  styleUrls: ["./edit-entity-dialog.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EditEntityDialog<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  @ViewChild(EditEntityComponent)
  private editEntityComponent?: EditEntityComponent<TRecord>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: EditEntityComponentOptions<TRecord>,
    private readonly dialogRef: MatDialogRef<
      EditEntityDialog<TRecord>,
      EditEntityDialogResult<TRecord>
    >,
    private readonly matDialog: MatDialog,
  ) {}

  @HostListener("document:keydown.enter", ["$event"])
  onKeydownEnter(event: Event): void {
    if (!this.isTopDialog() || this.inputOwnsKey(event)) return;

    const handled = this.editEntityComponent?.submitFromKeyboard() ?? false;
    if (!handled) return;

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  @HostListener("document:keydown.escape", ["$event"])
  onKeydownEscape(event: Event): void {
    if (!this.isTopDialog() || this.inputOwnsKey(event)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    void this.editEntityComponent?.requestClose();
  }

  close(result: EditEntityDialogResult<TRecord>): void {
    this.dialogRef.close(result);
  }

  private inputOwnsKey(event: Event): boolean {
    if (
      event.defaultPrevented ||
      (event instanceof KeyboardEvent &&
        (event.isComposing || event.ctrlKey || event.metaKey || event.altKey))
    )
      return true;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return false;
    if (
      event instanceof KeyboardEvent &&
      event.key === "Enter" &&
      target.closest('textarea, [contenteditable="true"]')
    )
      return true;
    return !!target.closest(
      '[role="combobox"][aria-expanded="true"], [aria-haspopup="listbox"][aria-expanded="true"], [role="listbox"], [role="menu"], mat-select[aria-expanded="true"]',
    );
  }
  private isTopDialog(): boolean {
    const openDialogs = this.matDialog.openDialogs;
    return (
      openDialogs.length > 0 &&
      openDialogs[openDialogs.length - 1] === this.dialogRef
    );
  }
}
