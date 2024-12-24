import { DatasourceRequestOrderDir } from './datasource-service.type';

export type MongooseDatatableColumnSearchType = 'text';

export type MongooseDatatableBaseColumn = {
  columnDef: string;
  header: string;
  property: string;
  minWidth?: number;

  sticky?: boolean;
  hidden?: boolean;

  searchable?: MongooseDatatableColumnSearchType;

  sortable?: boolean;
  order?: {
    index: number;
    dir: DatasourceRequestOrderDir;
  };
};

export type MongooseDatatableSearchTextColumn = MongooseDatatableBaseColumn & {
  searchable: 'text';
};

export type MongooseDatatableColumn = MongooseDatatableBaseColumn | MongooseDatatableSearchTextColumn;
