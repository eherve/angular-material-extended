/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sum' })
export class SumPipe implements PipeTransform {
  transform(obj: any[] | undefined, by?: string): number {
    if (!obj || !obj.length) return 0;
    if (by) return obj.reduce((pv, cv) => (pv += cv[by]), 0);
    return obj.reduce((pv, cv) => (pv += cv), 0);
  }
}
