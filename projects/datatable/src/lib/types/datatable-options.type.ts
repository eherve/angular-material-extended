/** @format */

import { Action } from './action.type';
import { DatasourceService } from './datasource-service.type';
import { DatatableColumn, DatatableValueColumn } from './datatable-column.type';
import { FacetOptions as Statistic } from './datatable-facet.type';

type Color<Record> = string | ((column: DatatableValueColumn<Record>, row: Record) => string | undefined);

export type DatatableOptions<Record> = {
  service: DatasourceService<Record>;

  columns: DatatableColumn<Record>[];
  columnMinWith?: number;
  rowMaxHeight?: number;

  pageSizeOptions?: number[];
  pageSizeOptionsIndex?: number;

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

  facets?: Statistic[];

  rowColor?: Color<Record>;
  rowBackgroundColor?: Color<Record>;
};
