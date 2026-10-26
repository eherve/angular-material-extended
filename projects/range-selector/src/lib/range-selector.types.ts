/** @format */

import type { unitOfTime } from 'moment';

export type RangeDate = { start: Date; end: Date };
export type RangeSelectorDisplay = 'card' | 'toolbar';
export type RangeSelectorKind = 'past' | 'future';
export type RangeSelectorView = 'year' | 'month' | 'week' | 'day';

export type RangeSelectorState = {
  allDates: boolean;
  view: RangeSelectorView | null;
  dateRange: RangeDate | null;
};

export interface RangeSelectorNavigation {
  selectedId: string;
  title: string;
  disableToday: boolean;
  select(id: string): void;
  previous(): void;
  next(): void;
  today(): void;
}

export type RangeSelectorOption = {
  id?: string;
  amount?: number;
  unit?: unitOfTime.DurationConstructor;
  label: string;
  view?: RangeSelectorView;
  range?: () => RangeDate;
};

export interface RangeSelectorElement {
  setExtremes?(extremes: RangeDate, redraw: boolean, trigger?: string): void;
  clearExtremes?(redraw?: boolean, trigger?: string): void;
}
