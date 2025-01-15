/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMatDatatableCellDirective } from './directives/datatable-cell.directive';
import { NgxMatDatatableComponent } from './datatable.component';

@NgModule({
  imports: [CommonModule, NgxMatDatatableComponent, NgxMatDatatableCellDirective],
  exports: [NgxMatDatatableComponent, NgxMatDatatableCellDirective],
})
export class NgxMatDatatableModule {}
