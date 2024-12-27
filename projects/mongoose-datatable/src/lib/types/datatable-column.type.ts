import { Observable } from 'rxjs';
import { DatasourceRequestOrderDir } from './datasource-service.type';

export type MongooseDatatableColumnSearchType = 'text' | 'select' | 'autocomplete' | 'checkbox';

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

export interface IMongooseDatatableColumn extends IMongooseDatatableBaseColumn {
  searchable: undefined;
}

export interface IMongooseDatatableSearchTextColumn extends IMongooseDatatableBaseColumn {
  searchable: 'text';
}

export type MongooseDatatableSearchListOption = {
  value: any;
  label: string;
  color?: string;
  icon?: string;
  iconColor?: string;
};
export interface IMongooseDatatableSearchSelectColumn extends IMongooseDatatableBaseColumn {
  searchable: 'select';
  options: Observable<MongooseDatatableSearchListOption[]>;
}

export interface IMongooseDatatableSearchAutocompleteColumn extends IMongooseDatatableBaseColumn {
  searchable: 'autocomplete';
  placeholder?: string;
  limit?: number;
  loadOnFocus?:boolean;
  options: (limit: number, skip: number, search: string) => Promise<MongooseDatatableSearchListOption[]>;
}

export interface IMongooseDatatableSearchCheckboxColumn extends IMongooseDatatableBaseColumn {
  searchable: 'checkbox';
}

export type MongooseDatatableColumn =
  | IMongooseDatatableBaseColumn
  | IMongooseDatatableSearchTextColumn
  | IMongooseDatatableSearchSelectColumn
  | IMongooseDatatableSearchAutocompleteColumn
  | IMongooseDatatableSearchCheckboxColumn;
