/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  Type,
  inject,
  reflectComponentType,
  ErrorHandler,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, firstValueFrom, isObservable, takeUntil } from 'rxjs';
import {
  SectionTabsDisplayCard,
  SectionTabsDisplayCardAction,
  SectionTabsDisplayOptions,
  SectionTabsDisplaySection,
} from '@eherve/angular-material-section-tabs';

import {
  DisplayDialogCardMenuOption,
  DisplayDialogCardActionContext,
  DisplayDialogCardActionState,
  DisplayDialogCardAction,
  DisplayDialogSectionCard,
  DisplayDialogSection,
  DisplayDialogSectionsOptions,
  DisplayDialogComponentOptions,
  DisplayDialogSingleSectionOptions,
  DisplayDialogTabOptions,
  DisplayDialogTabsOptions,
  DisplayDialogOptions,
  DisplayDialogTitle,
  DisplayDialogActionPosition,
  DisplayDialogConfirmOptions,
  DisplayDialogActionContext,
  DisplayDialogActionState,
  DisplayDialogActionButton,
  DisplayDialogRuntimeActionButton,
  DisplayDialogData,
  DisplayDialogConnection,
  DisplayDialogActionComponent,
} from './display-dialog.types';
import { DISPLAY_DIALOG_HOST } from './display-dialog-host';
import { DisplayDialogIntl } from './display-dialog.intl';

type ComponentInputs = Record<string, unknown>;

type DisplayDialogRuntimeAction<TRecord extends object> = DisplayDialogRuntimeActionButton<TRecord> | (DisplayDialogActionComponent<TRecord> & {componentInputs: ComponentInputs; isVisible: boolean});

interface DisplayDialogRuntimeCardMenuOption {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  ariaLabel?: string;
  disabled: boolean;
  handle: () => void;
}

interface DisplayDialogRuntimeCardAction {
  id?: string;
  type: 'icon' | 'button';
  icon?: string;
  label?: string;
  tooltip?: string;
  ariaLabel?: string;
  color?: string;
  disabled: boolean;
  menuOptions?: DisplayDialogRuntimeCardMenuOption[];
  handle: () => void;
}

type DisplayDialogRenderKind = 'tabs' | 'sections' | 'component' | 'section' | 'empty';

interface DisplayDialogTabRenderState<TRecord extends object> {
  label: string;
  icon?: string;
  svgIcon?: string;
  badge?: number;
  renderState: DisplayDialogRenderState<TRecord>;
}

interface DisplayDialogRenderState<TRecord extends object> {
  kind: DisplayDialogRenderKind;
  tabs?: DisplayDialogTabRenderState<TRecord>[];
  sectionsOptions?: SectionTabsDisplayOptions;
  sectionsMenuHeader?: string;
  component?: Type<unknown>;
  componentInputs?: ComponentInputs;
  componentOverflow?: boolean;
  singleSectionOptions?: SectionTabsDisplayOptions;
}

@Component({
  selector: 'app-display-dialog',
  templateUrl: './display-dialog.component.html',
  styleUrls: ['./display-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DisplayDialog<TRecord extends object> implements OnInit, OnChanges, OnDestroy {
  readonly intl = inject(DisplayDialogIntl);
  @Input() data?: DisplayDialogData<TRecord>;

  loading = true;
  loadingLabel = this.intl.messages.loadingLabel;
  errorLabel = '';
  title = '';
  subtitle = '';
  closeLabel = this.intl.messages.closeLabel;
  showCloseButton = false;
  handlingAction = false;
  actions: DisplayDialogRuntimeAction<TRecord>[] = [];
  actionErrorLabel = '';
  renderState: DisplayDialogRenderState<TRecord> = { kind: 'empty' };
  readonly recordChange = new EventEmitter<TRecord>();
  readonly isDialog: boolean;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly componentInputNamesByType = new WeakMap<Type<unknown>, ReadonlySet<string>>();
  private initializeVersion = 0;
  private destroyed = false;
  private recordErrorKind?: 'empty' | 'error';
  private actionFailed = false;
  private connection?: DisplayDialogConnection<TRecord>;
  private readonly cancelLoad = new Subject<void>();
  private dialogDataResolved?: DisplayDialogData<TRecord>;
  private record?: TRecord;
  private readonly host = inject(DISPLAY_DIALOG_HOST);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly intlSubscription = this.intl.changes.subscribe(() => this.refreshIntlLabels());

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly dialogData: DisplayDialogData<TRecord> | null,
    @Optional() private readonly dialogRef: MatDialogRef<DisplayDialog<TRecord>> | null,
  ) {
    this.isDialog = this.dialogRef !== null;
  }

  ngOnInit(): void {
    if (!this.data && this.dialogData) this.data = this.dialogData;
    void this.initialize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) void this.initialize();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.intlSubscription.unsubscribe();
    ++this.initializeVersion;
    this.cancelLoad.next();
    this.cancelLoad.complete();
    this.releaseConnection();
    this.recordChange.complete();
  }

  openJsonDataDialog(): void {
    if (this.record === undefined) return;
    this.host.showJson(this.resolveJsonDialogTitle(), [{label: this.intl.messages.recordLabel, value: this.record}]);
  }

  close(result?: unknown): void {
    this.dialogRef?.close(result);
  }

  getActions(position: DisplayDialogActionPosition): DisplayDialogRuntimeAction<TRecord>[] {
    return this.actions.filter(action => (action.position ?? 'bottom') === position && action.isVisible);
  }

  trackAction(index: number, action: DisplayDialogRuntimeAction<TRecord>): string | number {
    return 'component' in action ? index : action.label || action.icon || index;
  }

  async handleAction(action: DisplayDialogRuntimeActionButton<TRecord>): Promise<void> {
    if (this.record === undefined || this.destroyed || !this.dialogDataResolved) return;
    const context = this.buildActionContext(action);
    if (!this.resolveActionState(action.visible, context, true) || this.resolveActionState(action.disabled, context, false)) return;
    await this.runAction(action.confirm, () => action.handle(context), action.closeOnHandle);
  }

  private async runAction(confirm: string | DisplayDialogConfirmOptions | undefined, handle: () => unknown | Promise<unknown>, closeOnHandle?: boolean): Promise<void> {
    if (this.handlingAction || this.destroyed) return;
    const version = this.initializeVersion;
    this.handlingAction = true;
    this.actionErrorLabel = '';
    this.actionFailed = false;
    this.changeDetectorRef.markForCheck();
    try {
      if (!(await this.confirmAction(confirm)) || this.destroyed || version !== this.initializeVersion) return;
      const result = await handle();
      if (this.destroyed || version !== this.initializeVersion) return;
      this.refreshDisplayState();
      if (closeOnHandle) this.close(result);
    } catch (error) {
      this.reportError(error);
      if (!this.destroyed && version === this.initializeVersion) {
        this.actionFailed = true;
        this.actionErrorLabel = this.intl.messages.actionErrorLabel;
      }
    } finally {
      if (!this.destroyed && version === this.initializeVersion) {
        this.handlingAction = false;
        this.changeDetectorRef.markForCheck();
      }
    }
  }

  private resolveJsonDialogTitle(): string {
    const title = (this.elementRef.nativeElement as HTMLElement)
      .querySelector<HTMLElement>('.display-dialog-title-content h2')
      ?.textContent?.trim();
    return title || this.intl.messages.jsonTitle;
  }

  private async initialize(): Promise<void> {
    if (this.destroyed) return;
    const version = ++this.initializeVersion;
    this.cancelLoad.next();
    this.releaseConnection();
    const data = this.data ?? this.dialogData ?? undefined;

    this.loading = true;
    this.errorLabel = '';
    this.recordErrorKind = undefined;
    this.actionErrorLabel = '';
    this.actionFailed = false;

    this.record = undefined;
    this.dialogDataResolved = data;
    this.actions = [];
    this.handlingAction = false;
    this.renderState = { kind: 'empty' };
    this.changeDetectorRef.markForCheck();

    if (!data) {
      this.finishWithoutRecord('empty');
      return;
    }

    this.loadingLabel = data.loadingLabel ?? this.intl.messages.loadingLabel;
    this.closeLabel = data.closeLabel ?? this.intl.messages.closeLabel;
    this.showCloseButton = data.showCloseButton ?? !!this.dialogRef;

    try {
      this.connection = data.connect?.();
      const record = 'record' in data && data.record != null ? data.record : await this.resolveRecord(data);
      if (this.destroyed || version !== this.initializeVersion) return;

      if (!record) {
        this.finishWithoutRecord('empty');
        return;
      }

      this.record = record;
      this.notifyRecord(record);

      this.refreshDisplayState();
      this.loading = false;
      this.changeDetectorRef.detectChanges();
    } catch (err) {
      if (this.destroyed || version !== this.initializeVersion) return;
      this.reportError(err);
      this.finishWithoutRecord('error');
    }
  }

  private async resolveRecord(data: DisplayDialogData<TRecord>): Promise<TRecord | null> {
    if ('record' in data && data.record !== undefined && data.record !== null) return data.record;

    if (!data.loadRecord) return null;

    const loadedRecord = data.loadRecord();
    if (isObservable(loadedRecord)) return firstValueFrom(loadedRecord.pipe(takeUntil(this.cancelLoad)), {defaultValue: null});
    return loadedRecord;
  }

  private buildRenderState(data: DisplayDialogData<TRecord>, record: TRecord): DisplayDialogRenderState<TRecord> {
    return this.buildOptionsRenderState(data, this.resolveDisplayOptions(data, record), record);
  }

  private resolveDisplayOptions(
    data: DisplayDialogData<TRecord>,
    record: TRecord,
  ): DisplayDialogOptions<TRecord> {
    if (typeof data.displayOptions !== 'function') return data.displayOptions;
    return data.displayOptions({ record, data });
  }

  private buildOptionsRenderState(
    data: DisplayDialogData<TRecord>,
    displayOptions: DisplayDialogOptions<TRecord>,
    record: TRecord,
  ): DisplayDialogRenderState<TRecord> {
    if (this.isTabsOptions(displayOptions)) {
      return {
        kind: 'tabs',
        tabs: displayOptions.tabs.map(tab => this.buildTabRenderState(data, tab, record)),
      };
    }

    if (this.isSectionsOptions(displayOptions)) {
      return {
        kind: 'sections',
        sectionsMenuHeader: displayOptions.menuHeader,
        sectionsOptions: this.buildSectionsOptions(displayOptions, record),
      };
    }

    if (this.isComponentOptions(displayOptions)) {
      return {
        kind: 'component',
        component: displayOptions.component,
        componentInputs: this.buildComponentInputs(data, displayOptions, record),
        componentOverflow: displayOptions.overflow ?? true,
      };
    }

    if (this.isSingleSectionOptions(displayOptions)) {
      return {
        kind: 'section',
        singleSectionOptions: this.buildSingleSectionOptions(displayOptions, record),
      };
    }

    return { kind: 'empty' };
  }

  private buildTabRenderState(
    data: DisplayDialogData<TRecord>,
    tab: DisplayDialogTabOptions<TRecord>,
    record: TRecord,
  ): DisplayDialogTabRenderState<TRecord> {
    return {
      label: tab.label,
      icon: tab.icon,
      svgIcon: tab.svgIcon,
      badge: tab.badge,
      renderState: this.buildOptionsRenderState(data, tab.displayOptions, record),
    };
  }

  private isTabsOptions(options: DisplayDialogOptions<TRecord>): options is DisplayDialogTabsOptions<TRecord> {
    return 'tabs' in options;
  }

  private isSectionsOptions(options: DisplayDialogOptions<TRecord>): options is DisplayDialogSectionsOptions<TRecord> {
    return 'sections' in options;
  }

  private isComponentOptions(
    options: DisplayDialogOptions<TRecord>,
  ): options is DisplayDialogComponentOptions<TRecord> {
    return 'component' in options;
  }

  private isSingleSectionOptions(
    options: DisplayDialogOptions<TRecord>,
  ): options is DisplayDialogSingleSectionOptions<TRecord> {
    return 'section' in options;
  }

  private buildSectionsOptions(
    options: DisplayDialogSectionsOptions<TRecord>,
    record: TRecord,
  ): SectionTabsDisplayOptions {
    const { menuHeader, sections, ...sectionTabsOptions } = options;

    return {
      ...sectionTabsOptions,
      data: record,
      sections: this.buildRuntimeSections(sections),
    };
  }

  private buildSingleSectionOptions(
    options: DisplayDialogSingleSectionOptions<TRecord>,
    record: TRecord,
  ): SectionTabsDisplayOptions {
    return {
      data: record,
      sections: this.buildRuntimeSections([options.section]),
      showEmptyFields: options.showEmptyFields,
      showEmptyFieldsToggle: options.showEmptyFieldsToggle,
      showEmptyFieldsLabel: options.showEmptyFieldsLabel,
    };
  }

  private buildRuntimeSections(sections: DisplayDialogSection<TRecord>[]): SectionTabsDisplaySection[] {
    return sections.map(section => ({
      ...section,
      cards: section.cards.map(card => this.buildRuntimeCard(section, card)),
    })) as SectionTabsDisplaySection[];
  }

  private buildRuntimeCard(
    section: DisplayDialogSection<TRecord>,
    card: DisplayDialogSectionCard<TRecord>,
  ): SectionTabsDisplayCard {
    const { actions, ...sectionTabsCard } = card;

    return {
      ...sectionTabsCard,
      actions: this.buildRuntimeCardActions(section, card, actions ?? []),
    } as SectionTabsDisplayCard;
  }

  private buildRuntimeCardActions(
    section: DisplayDialogSection<TRecord>,
    card: DisplayDialogSectionCard<TRecord>,
    actions: Array<SectionTabsDisplayCardAction | DisplayDialogCardAction<TRecord>>,
  ): DisplayDialogRuntimeCardAction[] {
    return actions.flatMap(action => {
      if (this.isSectionTabsDisplayCardAction(action)) return [action];

      const context = this.buildCardActionContext(section, card, action);
      if (!this.resolveCardActionState(action.visible, context, true)) return [];

      const menuOptions = this.buildRuntimeCardMenuOptions(section, card, action);
      if (action.menuOptions?.length && !menuOptions.length) return [];

      return [
        {
          id: action.id,
          type: action.type,
          icon: action.icon,
          label: action.label,
          tooltip: action.tooltip,
          ariaLabel: action.ariaLabel,
          color: action.color,
          disabled: this.resolveCardActionState(action.disabled, context, false),
          menuOptions: menuOptions.length ? menuOptions : undefined,
          handle: () => {
            if (!menuOptions.length) void this.handleCardAction(section, card, action);
          },
        },
      ];
    });
  }

  private isSectionTabsDisplayCardAction(
    action: SectionTabsDisplayCardAction | DisplayDialogCardAction<TRecord>,
  ): action is SectionTabsDisplayCardAction {
    return 'handle' in action && typeof action.handle === 'function';
  }

  private buildRuntimeCardMenuOptions(
    section: DisplayDialogSection<TRecord>,
    card: DisplayDialogSectionCard<TRecord>,
    action: DisplayDialogCardAction<TRecord>,
  ): DisplayDialogRuntimeCardMenuOption[] {
    return (action.menuOptions ?? []).flatMap(option => {
      const context = this.buildCardActionContext(section, card, action, option);
      if (!this.resolveCardActionState(option.visible, context, true)) return [];

      return [
        {
          id: option.id,
          label: option.label,
          icon: option.icon,
          tooltip: option.tooltip,
          ariaLabel: option.ariaLabel,
          disabled: this.resolveCardActionState(option.disabled, context, false),
          handle: () => void this.handleCardMenuOption(section, card, action, option),
        },
      ];
    });
  }

  private buildComponentInputs(
    data: DisplayDialogData<TRecord>,
    displayOptions: DisplayDialogComponentOptions<TRecord>,
    record: TRecord,
  ): ComponentInputs {
    const baseInputs: ComponentInputs = {
      record,
      data,
      displayOptions,
    };
    if (!displayOptions.input) {
      return this.pickDeclaredComponentInputs(displayOptions.component, baseInputs);
    }

    const customInputs =
      typeof displayOptions.input === 'function' ?
        displayOptions.input({ record, data, displayOptions })
      : displayOptions.input;

    return this.pickDeclaredComponentInputs(displayOptions.component, {
      ...baseInputs,
      ...customInputs,
    });
  }

  private pickDeclaredComponentInputs<TComponent>(
    component: Type<TComponent> | undefined,
    inputs: ComponentInputs | undefined,
  ): ComponentInputs {
    if (!component || !inputs) return {};

    const declaredInputNames = this.getDeclaredComponentInputNames(component as Type<unknown>);
    if (!declaredInputNames.size) return {};

    return Object.entries(inputs).reduce<ComponentInputs>((filteredInputs, [name, value]) => {
      if (declaredInputNames.has(name)) filteredInputs[name] = value;
      return filteredInputs;
    }, {});
  }

  private getDeclaredComponentInputNames(component: Type<unknown>): ReadonlySet<string> {
    const cachedInputNames = this.componentInputNamesByType.get(component);
    if (cachedInputNames) return cachedInputNames;

    const componentMirror = reflectComponentType(component);
    const inputNames = new Set(componentMirror?.inputs.map(input => input.templateName) ?? []);
    this.componentInputNamesByType.set(component, inputNames);
    return inputNames;
  }

  private resolveText(value: DisplayDialogTitle<TRecord> | undefined, record: TRecord): string {
    if (!value) return '';
    return typeof value === 'function' ? value(record) : value;
  }

  private refreshDisplayState(): void {
    if (this.record === undefined || !this.dialogDataResolved) return;

    this.title = this.resolveText(this.dialogDataResolved.title, this.record);
    this.subtitle = this.resolveText(this.dialogDataResolved.subtitle, this.record);
    this.renderState = this.buildRenderState(this.dialogDataResolved, this.record);
    this.refreshActions();
  }

  private refreshActions(): void {
    if (this.record === undefined || !this.dialogDataResolved) {
      this.actions = [];
      return;
    }

    const data = this.dialogDataResolved;
    const record = this.record;
    this.actions = [...(data.actions ?? []), ...(this.connection?.actions ?? [])].map(action => {
      if ('component' in action) {
        const custom = typeof action.input === 'function' ? action.input({record, data}) : action.input;
        return {...action, isVisible: true, componentInputs: this.pickDeclaredComponentInputs(action.component, {record, data, ...custom})};
      }
      const context = this.buildActionContext(action);
      return {...action, isVisible: this.resolveActionState(action.visible, context, true), isDisabled: this.resolveActionState(action.disabled, context, false)};
    });
  }

  private resolveActionState(
    state: DisplayDialogActionState<TRecord> | undefined,
    context: DisplayDialogActionContext<TRecord>,
    defaultValue: boolean,
  ): boolean {
    if (state === undefined) return defaultValue;
    return typeof state === 'function' ? state(context) : state;
  }

  private buildActionContext(action: DisplayDialogActionButton<TRecord>): DisplayDialogActionContext<TRecord> {
    const version = this.initializeVersion;
    return {
      record: this.record as TRecord,
      data: this.dialogDataResolved as DisplayDialogData<TRecord>,
      action,
      close: result => {if (!this.destroyed && version === this.initializeVersion) this.close(result);},
      setRecord: record => {if (!this.destroyed && version === this.initializeVersion) this.setRecord(record);},
    };
  }

  private async handleCardAction(section: DisplayDialogSection<TRecord>, card: DisplayDialogSectionCard<TRecord>, action: DisplayDialogCardAction<TRecord>): Promise<void> {
    if (this.record === undefined || this.destroyed || !this.dialogDataResolved) return;
    const context = this.buildCardActionContext(section, card, action);
    if (!this.resolveCardActionState(action.visible, context, true) || this.resolveCardActionState(action.disabled, context, false)) return;
    await this.runAction(action.confirm, () => action.handler?.(context), action.closeOnHandle);
  }

  private async handleCardMenuOption(section: DisplayDialogSection<TRecord>, card: DisplayDialogSectionCard<TRecord>, action: DisplayDialogCardAction<TRecord>, option: DisplayDialogCardMenuOption<TRecord>): Promise<void> {
    if (this.record === undefined || this.destroyed || !this.dialogDataResolved) return;
    const context = this.buildCardActionContext(section, card, action, option);
    if (!this.resolveCardActionState(action.visible, context, true) || !this.resolveCardActionState(option.visible, context, true) || this.resolveCardActionState(action.disabled, context, false) || this.resolveCardActionState(option.disabled, context, false)) return;
    await this.runAction(action.confirm, () => action.menuHandler?.(option.id, context), action.closeOnHandle);
  }

  private resolveCardActionState(
    state: DisplayDialogCardActionState<TRecord> | undefined,
    context: DisplayDialogCardActionContext<TRecord>,
    defaultValue: boolean,
  ): boolean {
    if (state === undefined) return defaultValue;
    return typeof state === 'function' ? state(context) : state;
  }

  private buildCardActionContext(
    section: DisplayDialogSection<TRecord>,
    card: DisplayDialogSectionCard<TRecord>,
    action: DisplayDialogCardAction<TRecord>,
    option?: DisplayDialogCardMenuOption<TRecord>,
  ): DisplayDialogCardActionContext<TRecord> {
    const version = this.initializeVersion;
    return {
      record: this.record as TRecord,
      data: this.dialogDataResolved as DisplayDialogData<TRecord>,
      section,
      card,
      action,
      option,
      close: result => {if (!this.destroyed && version === this.initializeVersion) this.close(result);},
      setRecord: record => {if (!this.destroyed && version === this.initializeVersion) this.setRecord(record);},
    };
  }

  private notifyRecord(record: TRecord): void {
    this.recordChange.emit(record);
    try { this.connection?.recordChanged?.(record); } catch (error) { this.reportError(error); }
  }

  private releaseConnection(): void {
    const connection = this.connection;
    this.connection = undefined;
    try { connection?.destroy?.(); } catch (error) { this.reportError(error); }
  }

  private reportError(error: unknown): void {
    try { this.errorHandler.handleError(error); } catch { /* Resource cleanup must continue even if an application handler throws. */ }
  }

  private setRecord(record: TRecord): void {
    if (this.destroyed) return;
    this.record = record;
    this.notifyRecord(record);

    this.refreshDisplayState();
    this.changeDetectorRef.markForCheck();
  }

  private async confirmAction(confirmOptions: string | DisplayDialogConfirmOptions | undefined): Promise<boolean> {
    if (!confirmOptions) return true;
    if (typeof confirmOptions === 'string') return this.confirm({ message: confirmOptions });
    return this.confirm(confirmOptions);
  }

  private async confirm(confirmOptions: DisplayDialogConfirmOptions): Promise<boolean> {
    return (await this.host.confirm(confirmOptions)) === true;
  }

  private refreshIntlLabels(): void {
    const data = this.dialogDataResolved;
    const messages = this.intl.messages;
    this.loadingLabel = data?.loadingLabel ?? messages.loadingLabel;
    this.closeLabel = data?.closeLabel ?? messages.closeLabel;
    if (this.recordErrorKind === 'empty') this.errorLabel = data?.emptyLabel ?? data?.errorLabel ?? messages.emptyLabel;
    if (this.recordErrorKind === 'error') this.errorLabel = data?.errorLabel ?? messages.errorLabel;
    if (this.actionFailed) this.actionErrorLabel = messages.actionErrorLabel;
    this.changeDetectorRef.markForCheck();
  }

  private finishWithoutRecord(kind: 'empty' | 'error'): void {
    this.loading = false;
    this.handlingAction = false;
    this.recordErrorKind = kind;
    this.refreshIntlLabels();
    this.title = '';
    this.subtitle = '';
    this.actions = [];
    this.renderState = { kind: 'empty' };
    this.changeDetectorRef.detectChanges();
  }
}
