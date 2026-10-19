import { Type } from '@angular/core';
import { Observable } from 'rxjs';
import { SectionTabsDisplayCard, SectionTabsDisplayCardAction, SectionTabsDisplayOptions, SectionTabsDisplaySection } from '@eherve/angular-material-section-tabs';
type ComponentInputs = Record<string, unknown>;
export type DisplayDialogRecord = { _id?: string };

export type DisplayDialogRecordLoader<TRecord extends object> = () =>
  | Promise<TRecord>
  | Observable<TRecord>;

export interface DisplayDialogComponentContext<TRecord extends object> {
  record: TRecord;
  data: DisplayDialogData<TRecord>;
  displayOptions: DisplayDialogComponentOptions<TRecord>;
}

export type DisplayDialogComponentInput<TRecord extends object> =
  | ComponentInputs
  | ((context: DisplayDialogComponentContext<TRecord>) => ComponentInputs);

export interface DisplayDialogCardMenuOption<TRecord extends object = DisplayDialogRecord> {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  ariaLabel?: string;
  visible?: DisplayDialogCardActionState<TRecord>;
  disabled?: DisplayDialogCardActionState<TRecord>;
}

export interface DisplayDialogCardActionContext<TRecord extends object = DisplayDialogRecord> {
  record: TRecord;
  data: DisplayDialogData<TRecord>;
  section: DisplayDialogSection<TRecord>;
  card: DisplayDialogSectionCard<TRecord>;
  action: DisplayDialogCardAction<TRecord>;
  option?: DisplayDialogCardMenuOption<TRecord>;
  close: (result?: unknown) => void;
  setRecord: (record: TRecord) => void;
}

export type DisplayDialogCardActionState<TRecord extends object = DisplayDialogRecord> =
  | boolean
  | ((context: DisplayDialogCardActionContext<TRecord>) => boolean);

export interface DisplayDialogCardActionBase<TRecord extends object = DisplayDialogRecord> {
  id?: string;
  type: 'icon' | 'button';
  icon?: string;
  label?: string;
  tooltip?: string;
  ariaLabel?: string;
  color?: string;
  visible?: DisplayDialogCardActionState<TRecord>;
  disabled?: DisplayDialogCardActionState<TRecord>;
  closeOnHandle?: boolean;
  confirm?: string | DisplayDialogConfirmOptions;
  menuOptions?: DisplayDialogCardMenuOption<TRecord>[];
  handler?: (context: DisplayDialogCardActionContext<TRecord>) => unknown | Promise<unknown>;
  menuHandler?: (
    optionId: string,
    context: DisplayDialogCardActionContext<TRecord>,
  ) => unknown | Promise<unknown>;
}

export type DisplayDialogCardAction<TRecord extends object = DisplayDialogRecord> =
  | (DisplayDialogCardActionBase<TRecord> & { type: 'icon'; icon: string })
  | (DisplayDialogCardActionBase<TRecord> & { type: 'button'; label: string });

export type DisplayDialogSectionCard<TRecord extends object = DisplayDialogRecord> = Omit<
  SectionTabsDisplayCard,
  'actions'
> & {
  actions?: Array<SectionTabsDisplayCardAction | DisplayDialogCardAction<TRecord>>;
};

export type DisplayDialogSection<TRecord extends object = DisplayDialogRecord> = Omit<
  SectionTabsDisplaySection,
  'cards'
> & {
  cards: DisplayDialogSectionCard<TRecord>[];
};

export type DisplayDialogSectionsOptions<TRecord extends object = DisplayDialogRecord> = Omit<
  SectionTabsDisplayOptions,
  'data' | 'sections'
> & {
  sections: DisplayDialogSection<TRecord>[];
  menuHeader?: string;
};

export interface DisplayDialogComponentOptions<TRecord extends object = DisplayDialogRecord> {
  component: Type<unknown>;
  input?: DisplayDialogComponentInput<TRecord>;
  overflow?: boolean;
}

export interface DisplayDialogSingleSectionOptions<TRecord extends object = DisplayDialogRecord> {
  section: DisplayDialogSection<TRecord>;
  showEmptyFields?: boolean;
  showEmptyFieldsToggle?: boolean;
  showEmptyFieldsLabel?: string;
}

export type DisplayDialogTabDisplayOptions<TRecord extends object = DisplayDialogRecord> =
  | DisplayDialogSectionsOptions<TRecord>
  | DisplayDialogComponentOptions<TRecord>
  | DisplayDialogSingleSectionOptions<TRecord>;

export interface DisplayDialogTabOptions<TRecord extends object = DisplayDialogRecord> {
  label: string;
  icon?: string;
  svgIcon?: string;
  badge?: number;
  displayOptions: DisplayDialogTabDisplayOptions<TRecord>;
}

export interface DisplayDialogTabsOptions<TRecord extends object = DisplayDialogRecord> {
  tabs: DisplayDialogTabOptions<TRecord>[];
}

export type DisplayDialogOptions<TRecord extends object = DisplayDialogRecord> =
  | DisplayDialogTabDisplayOptions<TRecord>
  | DisplayDialogTabsOptions<TRecord>;

export interface DisplayDialogOptionsContext<TRecord extends object = DisplayDialogRecord> {
  record: TRecord;
  data: DisplayDialogData<TRecord>;
}

export type DisplayDialogOptionsFactory<TRecord extends object = DisplayDialogRecord> = (
  context: DisplayDialogOptionsContext<TRecord>,
) => DisplayDialogOptions<TRecord>;

export type DisplayDialogOptionsSource<TRecord extends object = DisplayDialogRecord> =
  | DisplayDialogOptions<TRecord>
  | DisplayDialogOptionsFactory<TRecord>;

export type DisplayDialogTitle<TRecord extends object> = string | ((record: TRecord) => string);

export type DisplayDialogActionPosition = 'bottom' | 'bottom-end' | 'top';

export interface DisplayDialogConfirmOptions {
  title?: string;
  message: string;
  ok?: string;
  cancel?: string;
}

export interface DisplayDialogActionContext<TRecord extends object = DisplayDialogRecord> {
  record: TRecord;
  data: DisplayDialogData<TRecord>;
  action: DisplayDialogActionButton<TRecord>;
  close: (result?: unknown) => void;
  setRecord: (record: TRecord) => void;
}

export type DisplayDialogActionState<TRecord extends object = DisplayDialogRecord> =
  | boolean
  | ((context: DisplayDialogActionContext<TRecord>) => boolean);

export interface DisplayDialogActionButton<TRecord extends object = DisplayDialogRecord> {
  label?: string;
  icon?: string;
  position?: DisplayDialogActionPosition;
  buttonType?: 'text' | 'raised';
  color?: string;
  contrastColor?: string;
  tooltip?: string;
  visible?: DisplayDialogActionState<TRecord>;
  disabled?: DisplayDialogActionState<TRecord>;
  closeOnHandle?: boolean;
  confirm?: string | DisplayDialogConfirmOptions;
  handle: (context: DisplayDialogActionContext<TRecord>) => unknown | Promise<unknown>;
}

export interface DisplayDialogRuntimeActionButton<TRecord extends object = DisplayDialogRecord>
  extends DisplayDialogActionButton<TRecord> {
  isVisible: boolean;
  isDisabled: boolean;
}

export interface DisplayDialogDataCommon<TRecord extends object> {
  title?: DisplayDialogTitle<TRecord>;
  subtitle?: DisplayDialogTitle<TRecord>;
  loadingLabel?: string;
  errorLabel?: string;
  emptyLabel?: string;
  closeLabel?: string;
  showCloseButton?: boolean;
  showJsonDataButton?: boolean;
  actions?: DisplayDialogAction<TRecord>[];
  connect?: () => DisplayDialogConnection<TRecord>;
  displayOptions: DisplayDialogOptionsSource<TRecord>;
}

export type DisplayDialogDataWithRecord<TRecord extends object> = DisplayDialogDataCommon<TRecord> & {
  record: TRecord;
  loadRecord?: never;
};

export type DisplayDialogDataWithLoader<TRecord extends object> = DisplayDialogDataCommon<TRecord> & {
  record?: never;
  loadRecord: DisplayDialogRecordLoader<TRecord>;
};

export type DisplayDialogData<TRecord extends object = DisplayDialogRecord> =
  | DisplayDialogDataWithRecord<TRecord>
  | DisplayDialogDataWithLoader<TRecord>;


export interface DisplayDialogConnection<TRecord extends object> {
  actions?: readonly DisplayDialogAction<TRecord>[];
  recordChanged?(record: TRecord): void;
  destroy?(): void;
}
export interface DisplayDialogActionComponent<TRecord extends object = DisplayDialogRecord> {
  component: Type<unknown>;
  position?: DisplayDialogActionPosition;
  input?: Record<string, unknown> | ((context: {record: TRecord; data: DisplayDialogData<TRecord>}) => Record<string, unknown>);
}
export type DisplayDialogAction<TRecord extends object = DisplayDialogRecord> = DisplayDialogActionButton<TRecord> | DisplayDialogActionComponent<TRecord>;
