/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { DatatableValueColumn } from '../types/datatable-column.type';
import { NgxMatDatatableOptions } from '../types/datatable-options.type';

@Pipe({ name: 'color' })
export class ColorPipe<Record> implements PipeTransform {
  transform(row: Record, column: DatatableValueColumn<Record>, options: NgxMatDatatableOptions<Record>): string | void {
    if (typeof column.color === 'string') return column.color;
    if (typeof column.color === 'function') return column.color(row);
    if (typeof options.rowColor === 'string') return options.rowColor;
    if (typeof options.rowColor === 'function') return options.rowColor(column, row);
  }
}
