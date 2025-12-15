/** @format */

import { Action } from './action.type';
import { DatatableConfig } from './config.type';
import { NgxMatDatasourceService } from './datasource-service.type';
import { DatatableColumn, DatatableValueColumn } from './datatable-column.type';
import { FacetOptions } from './datatable-facet.type';

type Opacity<Record> = number | ((column: DatatableValueColumn<Record>, row: Record) => number | undefined);
type Color<Record> = string | ((column: DatatableValueColumn<Record>, row: Record) => string | undefined);

export type NgxMatDatatableOptions<Record> = {
  title?: string;

  service: NgxMatDatasourceService<Record>;

  configService?: {
    get?: () => Promise<DatatableConfig | undefined>;
    set?: (config: DatatableConfig) => Promise<void>;
  };

  columns: DatatableColumn<Record>[];
  columnMinWith?: number;
  rowMaxHeight?: number;

  pageSizeOptions?: number[];
  pageSizeOptionsIndex?: number;

  additionalProperties?: string[];

  actions?: {
    columns?: {
      tooltip?: string;
      hideAndShow?: boolean;
      sticky?: boolean;
      reorder?: boolean;
    };
    refresh?: boolean;
    rowClick?: boolean | ((row: Record) => void);
    export?: string | boolean;
    user?: Action<Record>[];
  };

  facets?: FacetOptions[];

  rowOpacity?: Opacity<Record>;
  rowColor?: Color<Record>;
  rowBackgroundColor?: Color<Record>;
  rowDisabled?: string | ((row: Record) => boolean);

  disableRowAnimation?: boolean;
};
