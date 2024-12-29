/** @format */

import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { DatasourceRequestOrderDir } from './datasource-service.type';

// export type MongooseDatatableColumnType = 'text' | 'select' | 'autocomplete' | 'checkbox';

type BaseColumn = {
  type: string;
  columnDef: string;
  header: string;
  property: string;

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
};

type ComponentColumn = BaseColumn & {
  cellComponent: ComponentType<any>;
  cellContent?: undefined;
};

type ContentColumn = BaseColumn & {
  cellComponent?: undefined;
  cellContent: string;
};

type Column = BaseColumn | ComponentColumn | ContentColumn;

type SearchableColumn = Column & {
  type: string;
  searchable: true;
  searchProperty?: string;
};

// TEXT COLUMN
export type MongooseDatatableTextColumn = Column & {
  type: 'text';
};
export type MongooseDatatableSearchTextColumn = SearchableColumn & {
  type: 'text';
};

// NUMBER COLUMN
export type MongooseDatatableNumberColumn = Column & {
  type: 'number';
};
export type MongooseDatatableSearchNumberColumn = SearchableColumn & {
  type: 'number';
};

// SELECT COLUMN
export type MongooseDatatableSelectColumn = Column & {
  type: 'select';
};
export type MongooseDatatableSearchListOption = {
  value: any;
  label: string;
  color?: string;
  icon?: string;
  iconColor?: string;
};
export type MongooseDatatableSearchSelectColumn = SearchableColumn & {
  type: 'select';
  options: Observable<MongooseDatatableSearchListOption[]>;
};

// AUTOCOMPLETE COLUMN
export type MongooseDatatableAutocompleteColumn = Column & {
  type: 'autocomplete';
};
export type MongooseDatatableSearchAutocompleteColumn = SearchableColumn & {
  type: 'autocomplete';
  placeholder?: string;
  limit?: number;
  loadOnFocus?: boolean;
  options: (limit: number, skip: number, search: string) => Promise<MongooseDatatableSearchListOption[]>;
};

// CHECKBOX COLUMN
export type MongooseDatatableCheckboxColumn = Column & {
  type: 'checkbox';
};
export type MongooseDatatableSearchCheckboxColumn = SearchableColumn & {
  type: 'checkbox';
};

export type MongooseDatatableColumn =
  | MongooseDatatableTextColumn
  | MongooseDatatableSearchTextColumn
  | MongooseDatatableNumberColumn
  | MongooseDatatableSearchNumberColumn
  | MongooseDatatableSelectColumn
  | MongooseDatatableSearchSelectColumn
  | MongooseDatatableAutocompleteColumn
  | MongooseDatatableSearchAutocompleteColumn
  | MongooseDatatableCheckboxColumn
  | MongooseDatatableSearchCheckboxColumn;
