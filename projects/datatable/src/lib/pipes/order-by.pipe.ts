/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import * as lodash from 'lodash-es';

@Pipe({
  name: 'orderBy',
})
export class OrderByPipe implements PipeTransform {
  transform(data: any[], keys: string[] | string, dirs?: ('asc' | 'desc')[] | ('asc' | 'desc')): any[] {
    return lodash.orderBy(data, typeof keys === 'string' ? [keys] : keys, typeof dirs === 'string' ? [dirs] : dirs);
  }
}
