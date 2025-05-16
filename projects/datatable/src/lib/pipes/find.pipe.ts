/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'find' })
export class FindPipe implements PipeTransform {
  transform<T extends { [key: string]: any }>(obj: T[] | undefined, filter: { [key: string]: any }): T | undefined {
    return (obj ?? ([] as T[])).find(o => {
      for (let key of Object.keys(filter)) {
        if (o[key] !== filter[key]) return false;
      }
      return true;
    });
  }
}
