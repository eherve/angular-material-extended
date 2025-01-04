/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DatatableCellDirective } from './directives/datatable-cell.directive';
import { MongooseDatatableComponent } from './datatable.component';

@NgModule({
  imports: [CommonModule, MongooseDatatableComponent, DatatableCellDirective],
  exports: [MongooseDatatableComponent, DatatableCellDirective],
})
export class DatatableModule {}
