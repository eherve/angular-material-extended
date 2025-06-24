/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isArray' })
export class IsArrayPipe implements PipeTransform {
  transform(obj: any): boolean {
    return Array.isArray(obj);
  }
}
