/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { DatatableValueColumn } from '../types/datatable-column.type';

export type PipeFunction<Record> = (value: any, row: Record, column: DatatableValueColumn<Record>) => string;

@Pipe({ name: 'valueFunction' })
export class ValueFunctionPipe<Record> implements PipeTransform {
  transform(
    value: any,
    valueFunction: PipeFunction<Record>,
    row: Record,
    column: DatatableValueColumn<Record>
  ): string | null {
    if (typeof valueFunction === 'function') return valueFunction(value, row, column);
    return null;
  }
}
