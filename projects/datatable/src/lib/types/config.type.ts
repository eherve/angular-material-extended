/** @format */

export type DatatableColumnConfig = {
  columnDef: string;
  sticky?: boolean;
  hidden?: boolean;
};

export type DatatableConfig = {
  columns: DatatableColumnConfig[];
  pageSizeOptionsIndex: number;
};
