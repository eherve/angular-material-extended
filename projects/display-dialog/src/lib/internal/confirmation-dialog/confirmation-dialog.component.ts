import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DisplayDialogConfirmOptions } from '../../display-dialog.types';
import { DisplayDialogIntl } from '../../display-dialog.intl';

@Component({
  selector: 'ngx-mat-display-confirmation',
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{data.title ?? intl.messages.confirmTitle}}</h2>
    <mat-dialog-content>{{data.message}}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{data.cancel ?? intl.messages.confirmCancel}}</button>
      <button mat-button [mat-dialog-close]="true">{{data.ok ?? intl.messages.confirmOk}}</button>
    </mat-dialog-actions>`,
})
export class DisplayConfirmationDialog {
  readonly data = inject<DisplayDialogConfirmOptions>(MAT_DIALOG_DATA);
  readonly intl = inject(DisplayDialogIntl);

  constructor() {
    const changeDetectorRef = inject(ChangeDetectorRef);
    this.intl.changes.pipe(takeUntilDestroyed()).subscribe(() => changeDetectorRef.markForCheck());
  }
}
