import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DisplayDialogJsonSource } from '../../display-dialog-host';
import { DisplayDialogIntl } from '../../display-dialog.intl';

@Component({
  selector: 'ngx-mat-display-json',
  imports: [MatDialogModule, MatButtonModule, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{data.title}}</h2>
    <mat-dialog-content>
      @for (source of data.sources; track $index) {
        <h3>{{source.label}}</h3><pre>{{source.value | json}}</pre>
      }
    </mat-dialog-content>
    <mat-dialog-actions><button mat-button mat-dialog-close>{{intl.messages.closeLabel}}</button></mat-dialog-actions>`,
  styles: ['pre {white-space: pre-wrap; overflow-wrap: anywhere;}'],
})
export class DisplayJsonDialog {
  readonly data = inject<{title: string; sources: readonly DisplayDialogJsonSource[]}>(MAT_DIALOG_DATA);
  readonly intl = inject(DisplayDialogIntl);

  constructor() {
    const changeDetectorRef = inject(ChangeDetectorRef);
    this.intl.changes.pipe(takeUntilDestroyed()).subscribe(() => changeDetectorRef.markForCheck());
  }
}
