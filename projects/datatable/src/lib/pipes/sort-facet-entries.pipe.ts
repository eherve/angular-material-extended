/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { NgxMatDatasourceResultFacet } from '../types/datasource-service.type';
import { FacetOptions } from '../types/datatable-facet.type';

@Pipe({ name: 'sortFacetEntries' })
export class SortFacetEntriesPipe implements PipeTransform {
  transform(entries: NgxMatDatasourceResultFacet[], options: FacetOptions): NgxMatDatasourceResultFacet[] {
    if (!options.options) return entries;
    return entries.sort((e1, e2) => {
      const ie1 = options.options!.findIndex(o => o._id === e1._id);
      if (ie1 === -1) return 1;
      const ie2 = options.options!.findIndex(o => o._id === e2._id);
      if (ie2 === -1) return -1;
      return ie1 - ie2;
    });
  }
}
