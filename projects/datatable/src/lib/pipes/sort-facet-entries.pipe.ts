/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { NgxMatDatasourceResultFacet } from '../types/datasource-service.type';
import { FacetOptionsOptions } from '../types/datatable-facet.type';

@Pipe({ name: 'sortFacetEntries' })
export class SortFacetEntriesPipe implements PipeTransform {
  transform(entries: NgxMatDatasourceResultFacet[], options: FacetOptionsOptions[]): NgxMatDatasourceResultFacet[] {
    if (!options) return entries;
    return entries.sort((e1, e2) => {
      const ie1 = options!.findIndex(o => o.value === e1._id);
      if (ie1 === -1) return 1;
      const ie2 = options!.findIndex(o => o.value === e2._id);
      if (ie2 === -1) return -1;
      return ie1 - ie2;
    });
  }
}
