import { Injectable, InjectionToken, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DisplayDialogConfirmOptions } from './display-dialog.types';
import { DisplayConfirmationDialog } from './internal/confirmation-dialog/confirmation-dialog.component';
import { DisplayJsonDialog } from './internal/json-dialog/json-dialog.component';
export interface DisplayDialogJsonSource { label: string; value: unknown; }
export interface DisplayDialogHost {
  confirm(options: DisplayDialogConfirmOptions): Promise<boolean>;
  showJson(title: string, sources: readonly DisplayDialogJsonSource[]): void;
}
@Injectable({providedIn: 'root'})
class DefaultDisplayDialogHost implements DisplayDialogHost {
  private readonly dialog = inject(MatDialog);
  async confirm(options: DisplayDialogConfirmOptions): Promise<boolean> {
    return (await firstValueFrom(this.dialog.open(DisplayConfirmationDialog, {data: options}).afterClosed())) === true;
  }
  showJson(title: string, sources: readonly DisplayDialogJsonSource[]): void {
    this.dialog.open(DisplayJsonDialog, {width: '80vw', maxHeight: '90vh', data: {title, sources}});
  }
}
export const DISPLAY_DIALOG_HOST = new InjectionToken<DisplayDialogHost>('DISPLAY_DIALOG_HOST', {providedIn: 'root', factory: () => inject(DefaultDisplayDialogHost)});
