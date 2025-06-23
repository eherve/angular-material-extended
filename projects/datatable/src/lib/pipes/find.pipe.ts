/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'find' })
export class FindPipe implements PipeTransform {
  transform(obj: any[] | undefined, filter: { [key: string]: any }): any | undefined {
    return (obj ?? ([] as any[])).find(o => {
      for (let key of Object.keys(filter)) {
        if (o[key] !== filter[key]) return false;
      }
      return true;
    });
  }
}
