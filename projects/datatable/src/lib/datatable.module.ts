/** @format */

import { NgModule } from '@angular/core';
import { NgxMatDatatableComponent } from './datatable.component';
import { NgxMatDatatableIntl } from './datatable.intl';
import { NgxMatDatatableContentDirective } from './directives/datatable-cell.directive';

@NgModule({
  imports: [NgxMatDatatableComponent, NgxMatDatatableContentDirective],
  exports: [NgxMatDatatableComponent, NgxMatDatatableContentDirective],
  providers: [NgxMatDatatableIntl],
})
export class NgxMatDatatableModule {}
