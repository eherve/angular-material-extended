/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { DatatableValueColumn } from '../types/datatable-column.type';
import { NgxMatDatatableOptions } from '../types/datatable-options.type';

@Pipe({ name: 'cellOpacity' })
export class CellOpacityPipe<Record> implements PipeTransform {
  transform(row: Record, column: DatatableValueColumn<Record>, options: NgxMatDatatableOptions<Record>): number | void {
    if (typeof options.rowOpacity === 'number') return options.rowOpacity;
    if (typeof options.rowOpacity === 'function') return options.rowOpacity(column, row);
  }
}
