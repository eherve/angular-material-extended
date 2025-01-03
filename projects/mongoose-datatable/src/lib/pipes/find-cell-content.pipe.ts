/** @format */

import { Pipe, PipeTransform, QueryList } from '@angular/core';
import { DatatableCellDirective } from '../directives/datatable-cell.directive';
import { MongooseDatatableContentColumn } from '../types/datatable-column.type';

@Pipe({ name: 'findCellContent' })
export class FindCellContentPipe implements PipeTransform {
  transform(
    cellRefs: QueryList<DatatableCellDirective> | undefined,
    column: MongooseDatatableContentColumn
  ): DatatableCellDirective | undefined {
    return cellRefs?.find(ref => ref.columnDef === column.columnDef);
  }
}
