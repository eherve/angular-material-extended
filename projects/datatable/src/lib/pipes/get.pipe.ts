/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { get } from '../tools/get.tool';

@Pipe({ name: 'get' })
export class GetPipe implements PipeTransform {
  transform(obj: any, path: string): any | undefined {
    return get(obj, path);
  }
}
