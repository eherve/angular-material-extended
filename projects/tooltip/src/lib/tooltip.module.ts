/** @format */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMatTooltipComponent } from './tooltip.component';
import { NgxMatTooltipDirective } from './tooltip.directive';

@NgModule({
  imports: [CommonModule, OverlayModule],
  exports: [NgxMatTooltipDirective, NgxMatTooltipComponent],
  declarations: [NgxMatTooltipDirective, NgxMatTooltipComponent],
})
export class NgxMatTooltipModule {}
