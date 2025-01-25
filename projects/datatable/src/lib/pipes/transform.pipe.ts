/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { DatatableValueColumn } from '../types/datatable-column.type';

@Pipe({ name: 'transform' })
export class TransformPipe<Record> implements PipeTransform {
  transform(value: any, row: Record, column: DatatableValueColumn<Record>): any {
    if (typeof column.transform === 'function') {
      return column.transform(value, row);
    }
    return value;
  }
}
