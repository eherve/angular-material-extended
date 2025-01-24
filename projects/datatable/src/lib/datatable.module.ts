/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMatDatatableContentDirective } from './directives/datatable-cell.directive';
import { NgxMatDatatableComponent } from './datatable.component';

@NgModule({
  imports: [CommonModule, NgxMatDatatableComponent, NgxMatDatatableContentDirective],
  exports: [NgxMatDatatableComponent, NgxMatDatatableContentDirective],
})
export class NgxMatDatatableModule {}
