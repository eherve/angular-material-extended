/** @format */

import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { NgxMatDatasourceRequestOrderDir } from './datasource-service.type';

type Color<Record> = string | ((row: Record) => string | undefined);

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
    dir: NgxMatDatasourceRequestOrderDir;
  };

  tooltip?: string;
  align?: 'start' | 'center' | 'end';

  export?: (exportRow: any, value: any, row: any) => void;
};

export type DatatableComponentColumn = BaseColumn & {
  cellComponent: ComponentType<any>;
};
export type DatatableContentColumn = BaseColumn & {
  cellContentId: string;
};
export type DatatableValueColumn<Record> = BaseColumn & {
  color?: Color<Record>;
  backgroundColor?: Color<Record>;
  transform?: (value: any, row: Record) => any;
} & ({ prefix?: string; prefixContentId?: undefined } | { prefix?: undefined; prefixContentId?: string }) &
  ({ suffix?: string } | { suffixContentId?: string });

type Column<Record> = DatatableComponentColumn | DatatableContentColumn | DatatableValueColumn<Record>;

type SearchableColumn<Record> = Column<Record> & {
  searchable: true;
  searchProperty?: string;
};

// TEXT
export type DatatableTextColumn<Record> = Column<Record> & {
  type: 'text';
};
export type DatatableSearchTextColumn<Record> = DatatableTextColumn<Record> & SearchableColumn<Record> & {};

// NUMBER
export type DatatableNumberColumn<Record> = Column<Record> & {
  type: 'number';
  format?: string;
  locale?: string;
};
export type DatatableSearchNumberColumn<Record> = DatatableNumberColumn<Record> & SearchableColumn<Record> & {};

// SELECT
export type DatatableSearchListOption = {
  value: any;
  name: string;
  color?: string;
  iconSrc?: 'mat-icon' | 'svg';
  icon?: string;
  iconColor?: string;
};
export type DatatableSelectColumn<Record> = Column<Record> & {
  type: 'select';
  multiple?:boolean;
  options: Observable<DatatableSearchListOption[]>;
};
export type DatatableSearchSelectColumn<Record> = DatatableSelectColumn<Record> &
  SearchableColumn<Record> & {
    placeholder?: string;
  };

// AUTOCOMPLETE
export type DatatableAutocompleteColumn<Record> = Column<Record> & {
  type: 'autocomplete';
};
export type DatatableSearchAutocompleteColumn<Record> = DatatableAutocompleteColumn<Record> &
  SearchableColumn<Record> & {
    placeholder?: string;
    limit?: number;
    loadOnFocus?: boolean;
    options: (limit: number, skip: number, search: string) => Promise<DatatableSearchListOption[]>;
  };

// CHECKBOX
export type DatatableCheckboxColumn<Record> = Column<Record> & {
  type: 'checkbox';
};
export type DatatableSearchCheckboxColumn<Record> = DatatableCheckboxColumn<Record> & SearchableColumn<Record>;

// DATE
export type DatatableDateColumn<Record> = Column<Record> & {
  type: 'date';
  format?: string;
  timezone?: string;
  locale?: string;
  withDuration?: boolean;
  durationRefreshTime?: number;
};
export type DatatableSearchDateColumn<Record> = DatatableDateColumn<Record> &
  SearchableColumn<Record> & {
    placeholder?: string;
  };

// DURATION
export type DatatableDurationColumn<Record> = Column<Record> & {
  type: 'duration';
  locale?: string;
  largest?: number;
};
export type DatatableSearchDurationColumn<Record> = DatatableDurationColumn<Record> &
  SearchableColumn<Record> & {
    placeholder?: string;
  };

// DEFAULT
export type DatatableDefaultColumn<Record> = Column<Record> & {
  searchable?: false;
};

export type DatatableColumn<Record> =
  | DatatableDefaultColumn<Record>
  | DatatableTextColumn<Record>
  | DatatableSearchTextColumn<Record>
  | DatatableNumberColumn<Record>
  | DatatableSearchNumberColumn<Record>
  | DatatableSelectColumn<Record>
  | DatatableSearchSelectColumn<Record>
  | DatatableAutocompleteColumn<Record>
  | DatatableSearchAutocompleteColumn<Record>
  | DatatableCheckboxColumn<Record>
  | DatatableSearchCheckboxColumn<Record>
  | DatatableDateColumn<Record>
  | DatatableSearchDateColumn<Record>
  | DatatableDurationColumn<Record>
  | DatatableSearchDurationColumn<Record>;
