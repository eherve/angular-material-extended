/** @format */

import { DatasourceService } from './datasource-service.type';
import { DatatableColumn } from './datatable-column.type';

export type DatatableOptions<Record> = {
  service: DatasourceService<Record>;

  columns: DatatableColumn<Record>[];
  columnMinWith?: number;

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
  };
};
