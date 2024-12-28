/** @format */

import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { DatasourceRequestOrderDir } from './datasource-service.type';

export type MongooseDatatableColumnType = 'text' | 'select' | 'autocomplete' | 'checkbox';

export interface IMongooseDatatableBaseColumn {
  columnDef: string;
  header: string;
  property: string;

  type?: MongooseDatatableColumnType;

  minWidth?: number;

  sticky?: boolean;
  hidden?: boolean;

  searchable?: boolean;
  searchProperty?: string;

  sortable?: boolean;
  sortProperty?: string;
  order?: {
    index: number;
    dir: DatasourceRequestOrderDir;
  };

  cellComponent?: ComponentType<any>;
}

export interface IMongooseDatatableColumn extends IMongooseDatatableBaseColumn {
  searchable?: false;
  searchProperty?: undefined;
}

export interface IMongooseDatatableSearchableColumn extends IMongooseDatatableBaseColumn {
  type: MongooseDatatableColumnType;
  searchable: true;
  searchProperty?: string;
}

export interface IMongooseDatatableSearchTextColumn extends IMongooseDatatableSearchableColumn {
  type: 'text';
}

export type MongooseDatatableSearchListOption = {
  value: any;
  label: string;
  color?: string;
  icon?: string;
  iconColor?: string;
};
export interface IMongooseDatatableSearchSelectColumn extends IMongooseDatatableSearchableColumn {
  type: 'select';
  options: Observable<MongooseDatatableSearchListOption[]>;
}

export interface IMongooseDatatableSearchAutocompleteColumn extends IMongooseDatatableSearchableColumn {
  type: 'autocomplete';
  placeholder?: string;
  limit?: number;
  loadOnFocus?: boolean;
  options: (limit: number, skip: number, search: string) => Promise<MongooseDatatableSearchListOption[]>;
}

export interface IMongooseDatatableSearchCheckboxColumn extends IMongooseDatatableSearchableColumn {
  type: 'checkbox';
}

export type MongooseDatatableColumn =
  | IMongooseDatatableColumn
  | IMongooseDatatableSearchTextColumn
  | IMongooseDatatableSearchSelectColumn
  | IMongooseDatatableSearchAutocompleteColumn
  | IMongooseDatatableSearchCheckboxColumn;
