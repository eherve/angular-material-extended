/** @format */

import { Pipe, PipeTransform, QueryList } from '@angular/core';
import { NgxMatDatatableContentDirective } from '../directives/datatable-cell.directive';

@Pipe({ name: 'findContent' })
export class FindContentPipe implements PipeTransform {
  transform(
    contentRefs: QueryList<NgxMatDatatableContentDirective> | undefined,
    id: string
  ): NgxMatDatatableContentDirective | undefined {
    return contentRefs?.find(ref => ref.id === id);
  }
}
