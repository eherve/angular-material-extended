/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMatDatatableComponent } from './datatable.component';
import { NgxMatDatatableIntl } from './datatable.intl';
import { NgxMatDatatableContentDirective } from './directives/datatable-cell.directive';

@NgModule({
  imports: [CommonModule, NgxMatDatatableComponent, NgxMatDatatableContentDirective],
  exports: [NgxMatDatatableComponent, NgxMatDatatableContentDirective],
  providers: [NgxMatDatatableIntl],
})
export class NgxMatDatatableModule {}
