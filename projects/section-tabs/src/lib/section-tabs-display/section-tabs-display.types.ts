import { Type } from '@angular/core';

export interface SectionTabsDisplayGrid {
  columns: number;
  gap: string;
  minColumnWidth: string;
}

export type SectionTabsDisplaySectionMode = 'default' | 'single-card';

export interface SectionTabsDisplayLayout {
  colSpan?: number;
  rowSpan?: number;
  breakBefore?: boolean;
  breakAfter?: boolean;
  styles?: Record<string, string>;
  classes?: string;
}

export type SectionTabsDisplayCounter = number | string | null | undefined;

export interface SectionTabsDisplayCompletion {
  disabled?: boolean;
  done?: SectionTabsDisplayCounter;
  total?: SectionTabsDisplayCounter;
  donePath?: string;
  totalPath?: string;
}

export interface SectionTabsDisplaySelectOption {
  label: string;
  value: unknown;
  color?: string;
}

export interface SectionTabsDisplayChipConfig {
  icon?: string;
  labelPath?: string;
  color?: string;
  colorPath?: string;
  trackByPath?: string;
}

export interface SectionTabsDisplayChipViewModel {
  label: string;
  trackValue: unknown;
  icon?: string;
  color?: string;
}

export type SectionTabsDisplayFieldKind = 'text' | 'number' | 'date' | 'select' | 'chips' | 'component' | string;
export type SectionTabsDisplayCardKind = 'fields' | 'component';

export interface SectionTabsDisplayFieldLabelAction {
  active: boolean;
  disabled: boolean;
  ariaLabel: string;
  onClick: () => void | Promise<void>;
}

export interface SectionTabsDisplayField {
  kind: SectionTabsDisplayFieldKind;
  visible?: (record: any) => boolean;
  label: string;
  path: string;
  labelAction?: SectionTabsDisplayFieldLabelAction;
  layout?: SectionTabsDisplayLayout;
  color?: string;
  suffix?: string;
  decimal?: number;
  unit?: string;
  dateFormat?: string;
  options?: SectionTabsDisplaySelectOption[];
  chips?: SectionTabsDisplayChipConfig;
  component?: Type<unknown>;
  componentInputs?: Record<string, unknown>;
  onClick?: (value: any) => void;
}

// display-dialog-card-actions-v2
export interface SectionTabsDisplayCardMenuOption {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  ariaLabel?: string;
  disabled: boolean;
  handle: () => void;
}

export interface SectionTabsDisplayCardAction {
  id?: string;
  type: 'icon' | 'button';
  icon?: string;
  label?: string;
  tooltip?: string;
  ariaLabel?: string;
  color?: string;
  disabled: boolean;
  menuOptions?: SectionTabsDisplayCardMenuOption[];
  handle: () => void;
}

export interface SectionTabsDisplayCard {
  id: string;
  visible?: (record: any) => boolean;
  label: string;
  icon?: string;
  tooltip?: string;
  kind?: SectionTabsDisplayCardKind;
  path?: string;
  grid?: SectionTabsDisplayGrid;
  layout?: SectionTabsDisplayLayout;
  fields?: SectionTabsDisplayField[];
  component?: Type<unknown>;
  componentInputs?: Record<string, unknown>;
  completion?: false | SectionTabsDisplayCompletion;
  actions?: SectionTabsDisplayCardAction[];
}

export interface SectionTabsDisplaySection {
  id: string;
  queryParamValue?: string;
  visible?: (record: any) => boolean;
  label: string;
  icon?: string;
  tooltip?: string;
  sectionMode?: SectionTabsDisplaySectionMode;
  grid?: SectionTabsDisplayGrid;
  cards: SectionTabsDisplayCard[];
  completion?: false | SectionTabsDisplayCompletion;
}

export interface SectionTabsDisplayOptions {
  data: unknown;
  sections: SectionTabsDisplaySection[];
  showEmptyFields?: boolean;
  showEmptyFieldsToggle?: boolean;
  showEmptyFieldsLabel?: string;
}

export interface SectionTabsDisplayFieldComponentContext {
  data: unknown;
  value: unknown;
  field: SectionTabsDisplayField;
  card: SectionTabsDisplayCard;
  section: SectionTabsDisplaySection;
  options: SectionTabsDisplayOptions;
}

export interface SectionTabsDisplayCardComponentContext {
  data: unknown;
  value: unknown;
  card: SectionTabsDisplayCard;
  section: SectionTabsDisplaySection;
  options: SectionTabsDisplayOptions;
}
