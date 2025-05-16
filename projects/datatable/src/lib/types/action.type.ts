/** @format */

import { NgxMatDatatableComponent } from '../datatable.component';

type BaseAction = {
  position: 'start' | 'center' | 'end';
};

export type IconAction<Record> = BaseAction & {
  kind: 'icon';
  icon: string;
  onclick: (datagrid: NgxMatDatatableComponent<Record>) => void;
  tooltip?: string;
};

export type Action<Record> = IconAction<Record>;
