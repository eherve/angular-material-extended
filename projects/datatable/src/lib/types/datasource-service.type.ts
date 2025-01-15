
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

export type DatasourceRequestOptions = {
  draw: string;

  columns: DatasourceRequestColumn[];

  order?: DatasourceRequestOrder[];

  start?: number;

  length?: number;

  search?: DatasourceRequestSearch;
};

export type DatasourceResult<T> = {
  draw: string;

  recordsTotal: number;

  recordsFiltered: number;

  data: T[];
};

export type DatasourceService<Record> = (options: DatasourceRequestOptions) => Promise<DatasourceResult<Record>>;
