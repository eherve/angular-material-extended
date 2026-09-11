/** @format */

import { NgxMatDatatableComponent } from '../datatable.component';

type BaseAction = {
  position: 'start' | 'center' | 'end';
  isHidden?: boolean;
  isDisabled?: boolean;
};

export type IconAction<Record> = BaseAction & {
  kind: 'icon';
  icon: string;
  onclick: (datagrid: NgxMatDatatableComponent<Record>) => void;
  tooltip?: string;
  ariaLabel?: string;
  color?: string;
};

export type TemplateAction = BaseAction & {
  kind: 'template';
  contentId: string;
};

export type Action<Record> = IconAction<Record> | TemplateAction;
