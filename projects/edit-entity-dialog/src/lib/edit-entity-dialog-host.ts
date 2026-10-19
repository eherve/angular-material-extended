import { InjectionToken } from "@angular/core";
import { EditEntityConfirmOptions } from "./edit-entity-dialog.types";
export interface EditEntityDialogJsonSource {
  label: string;
  value: unknown;
}
export interface EditEntityDialogHost {
  confirm(options: EditEntityConfirmOptions): Promise<boolean>;
  notify(message: string): void;
  showJson(title: string, sources: readonly EditEntityDialogJsonSource[]): void;
}
export const EDIT_ENTITY_DIALOG_HOST = new InjectionToken<EditEntityDialogHost>(
  "EDIT_ENTITY_DIALOG_HOST",
);
