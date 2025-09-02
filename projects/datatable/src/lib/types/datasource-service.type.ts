/** @format */

export type NgxMatDatasourceRequestSearchOperator =
  | '>'
  | '>='
  | '≥'
  | '<'
  | '≤'
  | '<>'
  | '≤≥'
  | '><'
  | '≥≤'
  | '$in'
  | '$nin';

export type NgxMatDatasourceRequestSearch = {
  value: any;
  regex?: boolean;
  operator?: NgxMatDatasourceRequestSearchOperator;
};

export type NgxMatDatasourceRequestColumn = {
  data: string;

  projection?: string;

  name?: string;

  searchable?: boolean;

  orderable?: boolean;

  search?: NgxMatDatasourceRequestSearch;
};

export type NgxMatDatasourceRequestOrderDir = 'asc' | 'desc';

export type NgxMatDatasourceRequestOrder = {
  column: number;
  dir: NgxMatDatasourceRequestOrderDir;
};

export type NgxMatDatasourceRequestFacetOperator = 'count' | ['sum', string] | ['avg', string];
export type NgxMatDatasourceRequestFacet = {
  id: string;
  kind: 'indicator';
  property: string;
  operator: NgxMatDatasourceRequestFacetOperator;
};

export type NgxMatDatasourceRequestOptions = {
  draw: string;

  columns: NgxMatDatasourceRequestColumn[];

  order?: NgxMatDatasourceRequestOrder[];

  start?: number;

  length?: number;

  search?: NgxMatDatasourceRequestSearch;

  facets?: NgxMatDatasourceRequestFacet[];
};

export type NgxMatDatasourceResultFacet = { _id: any; value: number };

export type NgxMatDatasourceResult<T> = {
  draw: string;

  recordsTotal: number;

  recordsFiltered: number;

  data: T[];

  facets?: { [id: string]: NgxMatDatasourceResultFacet[] };
};

export type NgxMatDatasourceService<Record> = (
  options: NgxMatDatasourceRequestOptions
) => Promise<NgxMatDatasourceResult<Record>>;
