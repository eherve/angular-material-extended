import { Observable } from 'rxjs';
import { DatasourceRequestOrderDir } from './datasource-service.type';

export type MongooseDatatableColumnSearchType = 'text' | 'select';

export interface IMongooseDatatableBaseColumn {
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
}

export interface IMongooseDatatableSearchTextColumn extends IMongooseDatatableBaseColumn {
  searchable: 'text';
}

export type MongooseDatatableSearchSelectColumnOption = {
  value: any;
  label: string;
  color?: string;
  icon?: string;
  iconColor?: string;
};

export interface IMongooseDatatableSearchSelectColumn extends IMongooseDatatableBaseColumn {
  searchable: 'select';
  options: Observable<MongooseDatatableSearchSelectColumnOption[]>;
}

export type MongooseDatatableColumn =
  | IMongooseDatatableBaseColumn
  | IMongooseDatatableSearchTextColumn
  | IMongooseDatatableSearchSelectColumn;
