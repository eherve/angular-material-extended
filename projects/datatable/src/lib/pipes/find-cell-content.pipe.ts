/** @format */

import { Pipe, PipeTransform, QueryList } from '@angular/core';
import { NgxMatDatatableCellDirective } from '../directives/datatable-cell.directive';
import { DatatableContentColumn } from '../types/datatable-column.type';

@Pipe({ name: 'findCellContent' })
export class FindCellContentPipe implements PipeTransform {
  transform(
    cellRefs: QueryList<NgxMatDatatableCellDirective> | undefined,
    column: DatatableContentColumn
  ): NgxMatDatatableCellDirective | undefined {
    return cellRefs?.find(ref => ref.columnDef === column.columnDef);
  }
}
