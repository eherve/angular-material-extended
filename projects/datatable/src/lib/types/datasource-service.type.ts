/** @format */

export type NgxMatDatasourceRequestSearchOperator =
  | '='
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

export type NgxMatDatasourceRequestColumnType = 'string' | 'boolean' | 'number' | 'date' | 'objectid';

export type NgxMatDatasourceRequestColumn = {
  data: string;

  projection?: any;

  name?: string;

  searchable?: boolean;

  orderable?: boolean;

  type?: NgxMatDatasourceRequestColumnType;

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
  info?: any;
};

export type NgxMatDatasourceRequestOptions = {
  draw: string;

  columns: NgxMatDatasourceRequestColumn[];

  order?: NgxMatDatasourceRequestOrder[];

  start?: number;

  length?: number;

  search?: NgxMatDatasourceRequestSearch;

  enableUnfilteredInfo?: boolean;

  facets?: NgxMatDatasourceRequestFacet[];
};

export type NgxMatDatasourceResultFacet = { _id: any; value: number; info?: any };

export type NgxMatDatasourceResult<T> = {
  draw: string;

  recordsTotal: number;

  recordsFiltered: number;

  data: T[];

  facets?: { [id: string]: NgxMatDatasourceResultFacet[] };
};

export type NgxMatDatasourceService<Record> = (
  options: NgxMatDatasourceRequestOptions,
) => Promise<NgxMatDatasourceResult<Record>>;
