/** @format */

import { NgxMatDatasourceRequestOrderDir } from './datasource-service.type';

export type NgxMatDatatableStateOrder = {
  columnDef: string;
  index: number;
  dir: NgxMatDatasourceRequestOrderDir;
};

export type NgxMatDatatableStatePage = {
  index: number;
  size: number;
};

export type NgxMatDatatableState = {
  version: 1;
  filters: Record<string, any>;
  order: NgxMatDatatableStateOrder[];
  page?: NgxMatDatatableStatePage;
};

export type NgxMatDatatableStateService = {
  get?: () => Promise<NgxMatDatatableState | undefined>;
  set?: (state: NgxMatDatatableState) => Promise<void>;
  clear?: () => Promise<void>;
};
