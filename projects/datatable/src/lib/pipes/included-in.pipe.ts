/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'includedIn' })
export class IncludedInPipe implements PipeTransform {
  transform(elmt: any, obj: any[]): boolean {
    return (obj ?? ([] as any[])).includes(elmt);
  }
}
