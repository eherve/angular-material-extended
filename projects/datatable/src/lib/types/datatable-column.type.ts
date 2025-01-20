/** @format */

import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { DatasourceRequestOrderDir } from './datasource-service.type';

type BaseColumn = {
  type?: string;
  columnDef: string;
  header: string;
  property: string;

  additionalProperties?: string[];

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

export type DatatableComponentColumn = BaseColumn & {
  cellComponent: ComponentType<any>;
};
export type DatatableContentColumn = BaseColumn & {
  cellContent: string;
};
export type DatatableValueColumn = BaseColumn &
  ({ prefix?: string } | { prefixContent?: string }) &
  ({ suffix?: string } | { suffixContent?: string });

type Column = DatatableComponentColumn | DatatableContentColumn | DatatableValueColumn;

type SearchableColumn = Column & {
  searchable: true;
  searchProperty?: string;
};

// TEXT
export type DatatableTextColumn = Column & {
  type: 'text';
};
export type DatatableSearchTextColumn = DatatableTextColumn & SearchableColumn & {};

// NUMBER
export type DatatableNumberColumn = Column & {
  type: 'number';
};
export type DatatableSearchNumberColumn = DatatableNumberColumn & SearchableColumn & {};

// SELECT
export type DatatableSearchListOption = {
  value: any;
  name: string;
  color?: string;
  icon?: string;
  iconColor?: string;
};
export type DatatableSelectColumn = Column & {
  type: 'select';
  options: Observable<DatatableSearchListOption[]>;
};
export type DatatableSearchSelectColumn = DatatableSelectColumn &
  SearchableColumn & {
    placeholder?: string;
  };

// AUTOCOMPLETE
export type DatatableAutocompleteColumn = Column & {
  type: 'autocomplete';
};
export type DatatableSearchAutocompleteColumn = DatatableAutocompleteColumn &
  SearchableColumn & {
    placeholder?: string;
    limit?: number;
    loadOnFocus?: boolean;
    options: (limit: number, skip: number, search: string) => Promise<DatatableSearchListOption[]>;
  };

// CHECKBOX
export type DatatableCheckboxColumn = Column & {
  type: 'checkbox';
};
export type DatatableSearchCheckboxColumn = DatatableCheckboxColumn & SearchableColumn & {};

// DATE
export type DatatableDateColumn = Column & {
  type: 'date';
  format?: string;
  timezone?: string;
  locale?: string;
};
export type DatatableSearchDateColumn = DatatableDateColumn &
  SearchableColumn & {
    placeholder?: string;
  };

// DURATION
export type DatatableDurationColumn = Column & {
  type: 'duration';
  locale?: string;
};
export type DatatableSearchDurationColumn = DatatableDurationColumn &
  SearchableColumn & {
    placeholder?: string;
  };

// DEFAULT
export type DatatableDefaultColumn = Column & {
  searchable?: false;
};

export type DatatableColumn =
  | DatatableDefaultColumn
  | DatatableTextColumn
  | DatatableSearchTextColumn
  | DatatableNumberColumn
  | DatatableSearchNumberColumn
  | DatatableSelectColumn
  | DatatableSearchSelectColumn
  | DatatableAutocompleteColumn
  | DatatableSearchAutocompleteColumn
  | DatatableCheckboxColumn
  | DatatableSearchCheckboxColumn
  | DatatableDateColumn
  | DatatableSearchDateColumn
  | DatatableDurationColumn;
