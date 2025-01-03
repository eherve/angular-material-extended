/** @format */

import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { DatasourceRequestOrderDir } from './datasource-service.type';

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

export type MongooseDatatableComponentColumn = BaseColumn & {
  cellComponent: ComponentType<any>;
};
export type MongooseDatatableContentColumn = BaseColumn & {
  cellContent: string;
};
export type MongooseDatatableValueColumn = BaseColumn &
  ({ prefix?: string } | { prefixContent?: string }) &
  ({ suffix?: string } | { suffixContent?: string });

type Column = MongooseDatatableComponentColumn | MongooseDatatableContentColumn | MongooseDatatableValueColumn;

type SearchableColumn = Column & {
  searchable: true;
  searchProperty?: string;
};

// TEXT
export type MongooseDatatableTextColumn = Column & {
  type: 'text';
};
export type MongooseDatatableSearchTextColumn = MongooseDatatableTextColumn & SearchableColumn & {};

// NUMBER
export type MongooseDatatableNumberColumn = Column & {
  type: 'number';
};
export type MongooseDatatableSearchNumberColumn = MongooseDatatableNumberColumn & SearchableColumn & {};

// SELECT
export type MongooseDatatableSearchListOption = {
  value: any;
  label: string;
  color?: string;
  icon?: string;
  iconColor?: string;
};
export type MongooseDatatableSelectColumn = Column & {
  type: 'select';
  options: Observable<MongooseDatatableSearchListOption[]>;
};
export type MongooseDatatableSearchSelectColumn = MongooseDatatableSelectColumn &
  SearchableColumn & {
    placeholder?: string;
  };

// AUTOCOMPLETE
export type MongooseDatatableAutocompleteColumn = Column & {
  type: 'autocomplete';
};
export type MongooseDatatableSearchAutocompleteColumn = MongooseDatatableAutocompleteColumn &
  SearchableColumn & {
    placeholder?: string;
    limit?: number;
    loadOnFocus?: boolean;
    options: (limit: number, skip: number, search: string) => Promise<MongooseDatatableSearchListOption[]>;
  };

// CHECKBOX
export type MongooseDatatableCheckboxColumn = Column & {
  type: 'checkbox';
};
export type MongooseDatatableSearchCheckboxColumn = MongooseDatatableCheckboxColumn & SearchableColumn & {};

// DATE
export type MongooseDatatableDateColumn = Column & {
  type: 'date';
  locale?: string;
};
export type MongooseDatatableSearchDateColumn = MongooseDatatableDateColumn &
  SearchableColumn & {
    placeholder?: string;
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
  | MongooseDatatableSearchCheckboxColumn
  | MongooseDatatableDateColumn
  | MongooseDatatableSearchDateColumn;
