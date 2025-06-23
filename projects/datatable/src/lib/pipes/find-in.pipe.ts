/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import * as lodash from 'lodash-es';

@Pipe({
  name: 'findIn',
})
export class FindInPipe implements PipeTransform {
  transform<T>(data: any, options: T[], key?: string): T | undefined {
    if (key) return lodash.find(options, option => lodash.isEqual(lodash.get(option, key), data));
    return lodash.find(options, data);
  }
}
