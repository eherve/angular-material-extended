/** @format */

export type DatasourceRequestSearch = {
  value: any;

  regex?: boolean;

  chunks?: string[];
};

export type DatasourceRequestColumn = {
  data: string;

  name?: string;

  searchable?: boolean;

  orderable?: boolean;

  search?: DatasourceRequestSearch;
};

export type DatasourceRequestOrderDir = 'asc' | 'desc';

export type DatasourceRequestOrder = {
  column: number;
  dir: DatasourceRequestOrderDir;
};

export type DatasourceRequestFacetOperator = 'count' | ['sum', string] | ['avg', string];
export type DatasourceRequestFacet = {
  id: string;
  kind: 'indicator';
  property: string;
  operator: DatasourceRequestFacetOperator;
};

export type DatasourceRequestOptions = {
  draw: string;

  columns: DatasourceRequestColumn[];

  order?: DatasourceRequestOrder[];

  start?: number;

  length?: number;

  search?: DatasourceRequestSearch;

  facets?: DatasourceRequestFacet[];
};

export type DatasourceResultFacet = { _id: any; value: number };

export type DatasourceResult<T> = {
  draw: string;

  recordsTotal: number;

  recordsFiltered: number;

  data: T[];

  facets?: { [id: string]: DatasourceResultFacet[] };
};

export type DatasourceService<Record> = (options: DatasourceRequestOptions) => Promise<DatasourceResult<Record>>;
