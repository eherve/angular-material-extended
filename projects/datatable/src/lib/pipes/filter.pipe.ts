/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  transform(obj: any[] | undefined, filter: { [key: string]: any }): any[] {
    return (obj ?? []).filter(o => {
      for (let key of Object.keys(filter)) {
        if (o[key] !== filter[key]) return false;
      }
      return true;
    });
  }
}
