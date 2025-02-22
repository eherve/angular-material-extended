/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { DatatableValueColumn } from '../types/datatable-column.type';
import { DatatableOptions } from '../types/datatable-options.type';

@Pipe({ name: 'backgroundColor' })
export class BackgroundColorPipe<Record> implements PipeTransform {
  transform(row: Record, column: DatatableValueColumn<Record>, options: DatatableOptions<Record>): string | void {
    if (typeof column.backgroundColor === 'string') return column.backgroundColor;
    if (typeof column.backgroundColor === 'function') return column.backgroundColor(row);
    if (typeof options.rowBackgroundColor === 'string') return options.rowBackgroundColor;
    if (typeof options.rowBackgroundColor === 'function') return options.rowBackgroundColor(column, row);
  }
}
