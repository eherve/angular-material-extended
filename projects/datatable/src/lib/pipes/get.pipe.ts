/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'get' })
export class GetPipe implements PipeTransform {
  transform(obj: any, path: string): any | undefined {
    const chunks = path.split('.');
    let value = obj;
    for (let i = 0; i < chunks.length; ++i) {
      value = value[chunks[i]];
      if (value === undefined || value === null) return null;
    }
    return value;
  }
}
