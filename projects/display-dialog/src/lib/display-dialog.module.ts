/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SectionTabsModule } from '@eherve/angular-material-section-tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DisplayDialog } from './display-dialog.component';

@NgModule({
  declarations: [DisplayDialog],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    SectionTabsModule,
    MatProgressSpinnerModule,
  ],
  exports: [DisplayDialog],
})
export class DisplayDialogModule {}
