/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { MongooseDatatableSearchListOption } from '../../types/datatable-column.type';

@Pipe({ name: 'option' })
export class SelectOptionPipe implements PipeTransform {
  transform(
    value: any,
    options: MongooseDatatableSearchListOption[]
  ): MongooseDatatableSearchListOption | null {
    if (!options) return null;
    return options.find((option) => option.value === value) || null;
  }
}
