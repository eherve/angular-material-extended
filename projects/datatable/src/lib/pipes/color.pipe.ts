/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { DatatableValueColumn } from '../types/datatable-column.type';

@Pipe({ name: 'color' })
export class ColorPipe implements PipeTransform {
  transform(row: any, column: DatatableValueColumn): string | void {
    if (typeof column.color === 'string') return column.color;
    if (typeof column.color === 'function') return column.color(row);
  }
}
