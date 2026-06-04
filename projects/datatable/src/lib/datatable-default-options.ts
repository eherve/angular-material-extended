/** @format */

import { InjectionToken, Provider } from '@angular/core';
import { NgxMatDatatableDefaultOptions } from './types/datatable-options.type';

export const NGX_MAT_DATATABLE_DEFAULT_OPTIONS = new InjectionToken<NgxMatDatatableDefaultOptions>('NGX_MAT_DATATABLE_DEFAULT_OPTIONS', {
  providedIn: 'root',
  factory: (): NgxMatDatatableDefaultOptions => ({
    loadMode: 'pagination',
    showRecordsCount: true,
    pageSizeOptions: [20, 50, 100],
    pageSizeOptionsIndex: 1,
    incremental: {
      trigger: 'inView',
    },
  }),
});

export function provideNgxMatDatatableDefaultOptions<Record = any>(options: NgxMatDatatableDefaultOptions<Record>): Provider {
  return {
    provide: NGX_MAT_DATATABLE_DEFAULT_OPTIONS,
    useValue: options,
  };
}
