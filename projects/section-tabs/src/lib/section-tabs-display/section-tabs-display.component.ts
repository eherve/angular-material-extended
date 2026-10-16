/** @format */

import { formatDate } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { SafeHtml } from '@angular/platform-browser';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  ChangeDetectorRef,
  DestroyRef,
  Input,
  LOCALE_ID,
  OnChanges,
  Output,
  Type,
  reflectComponentType,
} from '@angular/core';

import { SectionTabsIntl } from '../section-tabs-intl';
import {
  SectionTabsDisplayCard, SectionTabsDisplayCardAction, SectionTabsDisplayCardComponentContext,
  SectionTabsDisplayCardKind, SectionTabsDisplayChipConfig, SectionTabsDisplayChipViewModel,
  SectionTabsDisplayCompletion, SectionTabsDisplayCounter, SectionTabsDisplayField,
  SectionTabsDisplayFieldComponentContext, SectionTabsDisplayFieldKind, SectionTabsDisplayFieldLabelAction,
  SectionTabsDisplayGrid, SectionTabsDisplayLayout, SectionTabsDisplayOptions,
  SectionTabsDisplaySection, SectionTabsDisplaySectionMode, SectionTabsDisplaySelectOption,
} from './section-tabs-display.types';

interface SectionTabsDisplayCompletionState {
  enabled: boolean;
  done?: SectionTabsDisplayCounter;
  total?: SectionTabsDisplayCounter;
  label?: string;
}

interface SectionTabsDisplayNumericCompletion {
  done: number;
  total: number;
}

interface SectionTabsDisplayRenderBreak {
  id: string;
  type: 'break';
}

interface SectionTabsDisplayRenderField {
  id: string;
  type: 'field';
  source: SectionTabsDisplayField;
  label: string;
  labelAction?: SectionTabsDisplayFieldLabelAction;
  kind: SectionTabsDisplayFieldKind;
  value: unknown;
  filled: boolean;
  displayValue: string | SafeHtml;
  chipsValue: SectionTabsDisplayChipViewModel[];
  color?: string;
  suffix?: string;
  component?: Type<unknown>;
  componentInputs?: Record<string, unknown>;
  styles: Record<string, string>;
  classes: Record<string, boolean>;
  onClick?: (value: any) => void;
}

type SectionTabsDisplayFieldItem = SectionTabsDisplayRenderBreak | SectionTabsDisplayRenderField;

interface SectionTabsDisplayRenderCard {
  id: string;
  type: 'card';
  source: SectionTabsDisplayCard;
  responsiveGrid: boolean;
  label: string;
  icon?: string;
  tooltip?: string;
  kind: SectionTabsDisplayCardKind;
  component?: Type<unknown>;
  componentInputs?: Record<string, unknown>;
  gridStyles: Record<string, string>;
  styles: Record<string, string>;
  classes: Record<string, boolean>;
  items: SectionTabsDisplayFieldItem[];
  completion: SectionTabsDisplayCompletionState;
  actions?: SectionTabsDisplayCardAction[];
}

interface SectionTabsDisplayRenderCardBreak {
  id: string;
  type: 'break';
}

type SectionTabsDisplayCardItem = SectionTabsDisplayRenderCard | SectionTabsDisplayRenderCardBreak;

interface SectionTabsDisplayRenderSection {
  id: string;
  queryParamValue: string;
  source: SectionTabsDisplaySection;
  responsiveGrid: boolean;
  label: string;
  icon?: string;
  tooltip?: string;
  sectionMode: SectionTabsDisplaySectionMode;
  cardCount: number;
  gridStyles: Record<string, string>;
  items: SectionTabsDisplayCardItem[];
  done?: SectionTabsDisplayCounter;
  total?: SectionTabsDisplayCounter;
}

interface SectionTabsDisplayCardBuildResult {
  items: SectionTabsDisplayCardItem[];
  cards: SectionTabsDisplayRenderCard[];
}

interface SectionTabsDisplayViewModel {
  sections: SectionTabsDisplayRenderSection[];
  empty: boolean;
}

@Component({
  selector: 'app-section-tabs-display',
  templateUrl: './section-tabs-display.component.html',
  styleUrl: './section-tabs-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SectionTabsDisplayComponent implements OnChanges {
  // section-tabs-declared-component-inputs-v9
  private readonly componentInputNamesByType = new WeakMap<Type<unknown>, ReadonlySet<string>>();

  private pickDeclaredComponentInputs<TComponent>(
    component: Type<TComponent> | undefined,
    inputs: Record<string, unknown> | undefined,
  ): Record<string, unknown> {
    if (!component || !inputs) return {};

    const declaredInputNames = this.getDeclaredComponentInputNames(component as Type<unknown>);
    if (!declaredInputNames.size) return {};

    return Object.entries(inputs).reduce<Record<string, unknown>>((filteredInputs, [name, value]) => {
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

  @Input({ required: true }) options!: SectionTabsDisplayOptions;
  @Input() selectedIndex = 0;
  @Input() queryParamKey?: string;
  @Input() menuHeader?: string;
  @Input() showEmptyFields?: boolean;

  @Output() selectedIndexChange = new EventEmitter<number>();
  @Output() showEmptyFieldsChange = new EventEmitter<boolean>();

  viewModel: SectionTabsDisplayViewModel = { sections: [], empty: true };
  showEmptyFieldsState = false;
  showEmptyFieldsToggle = false;
  showEmptyFieldsLabel = "";

  private emptyFieldsStateInitialized = false;
  private lastOptionShowEmptyFields?: boolean;

  constructor(
    @Inject(LOCALE_ID) private readonly locale: string,
    public readonly intl: SectionTabsIntl,
    changeDetector: ChangeDetectorRef,
    destroyRef: DestroyRef,
  ) {
    this.intl.changes.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      this.syncEmptyFieldsLabel();
      changeDetector.markForCheck();
    });
  }

  ngOnChanges(): void {
    this.syncEmptyFieldsOptions();
    this.viewModel = this.buildViewModel();
  }

  onSelectedIndexChange(index: number): void {
    this.selectedIndex = index;
    this.selectedIndexChange.emit(index);
  }

  onShowEmptyFieldsChange(checked: boolean): void {
    this.showEmptyFieldsState = checked;
    this.showEmptyFieldsChange.emit(checked);
    this.viewModel = this.buildViewModel();
  }

  onClickFieldItem(fieldItem: SectionTabsDisplayRenderField) {
    if (typeof fieldItem.onClick === 'function') fieldItem.onClick(fieldItem.value);
  }

  private syncEmptyFieldsLabel(): void {
    this.showEmptyFieldsLabel = this.options?.showEmptyFieldsLabel ?? this.intl.messages.showEmptyFields;
  }

  private syncEmptyFieldsOptions(): void {
    this.syncEmptyFieldsLabel();
    this.showEmptyFieldsToggle = this.options?.showEmptyFieldsToggle ?? false;
    const optionShowEmptyFields = this.options?.showEmptyFields;
    if (this.showEmptyFields !== undefined) {
      this.showEmptyFieldsState = this.showEmptyFields;
      this.emptyFieldsStateInitialized = true;
      this.lastOptionShowEmptyFields = optionShowEmptyFields;
      return;
    }

    if (!this.emptyFieldsStateInitialized || optionShowEmptyFields !== this.lastOptionShowEmptyFields) {
      this.showEmptyFieldsState = optionShowEmptyFields ?? false;
      this.emptyFieldsStateInitialized = true;
      this.lastOptionShowEmptyFields = optionShowEmptyFields;
    }
  }

  private buildViewModel(): SectionTabsDisplayViewModel {
    const sections = this.options?.sections ?? [];
    const renderSections = sections
      .filter((section): boolean => this.isVisible(section.visible))
      .map((section): SectionTabsDisplayRenderSection => this.buildSection(section));
    return { sections: renderSections, empty: renderSections.length === 0 };
  }

  private buildSection(section: SectionTabsDisplaySection): SectionTabsDisplayRenderSection {
    const cardBuildResult = this.buildCardItems(section);
    const completion = this.resolveCompletion(section.completion, (): SectionTabsDisplayNumericCompletion => {
      return this.calculateSectionCompletion(cardBuildResult.cards);
    });
    const preserveRows = this.hasRowSpan(section.cards);

    return {
      id: section.id,
      queryParamValue: section.queryParamValue ?? section.id,
      source: section,
      responsiveGrid: !preserveRows,
      label: section.label,
      icon: section.icon,
      tooltip: section.tooltip,
      sectionMode: section.sectionMode ?? 'default',
      cardCount: cardBuildResult.cards.length,
      gridStyles: this.buildGridStyles(section.grid, preserveRows),
      items: cardBuildResult.items,
      done: completion.done,
      total: completion.total,
    };
  }

  private buildCardItems(section: SectionTabsDisplaySection): SectionTabsDisplayCardBuildResult {
    const cards: SectionTabsDisplayRenderCard[] = [];
    const items = (section.cards ?? []).flatMap((card, index): SectionTabsDisplayCardItem[] => {
      if (!this.isVisible(card.visible)) return [];

      const cardItems: SectionTabsDisplayCardItem[] = [];
      const renderCard = this.buildCard(card, section);
      cards.push(renderCard);
      if (card.layout?.breakBefore) cardItems.push({ id: `${card.id || index}-before`, type: 'break' });
      cardItems.push(renderCard);
      if (card.layout?.breakAfter) cardItems.push({ id: `${card.id || index}-after`, type: 'break' });
      return cardItems;
    });

    return { items, cards };
  }

  private buildCard(card: SectionTabsDisplayCard, section: SectionTabsDisplaySection): SectionTabsDisplayRenderCard {
    const kind = this.getCardKind(card);
    const renderFields = kind === 'fields' ? this.buildFields(section, card) : [];
    const completion = this.resolveCompletion(card.completion, (): SectionTabsDisplayNumericCompletion => {
      return this.calculateFieldsCompletion(renderFields);
    });
    const preserveRows = this.hasRowSpan(card.fields);

    return {
      actions: card.actions,
      id: card.id,
      type: 'card',
      source: card,
      responsiveGrid: !preserveRows,
      label: card.label,
      icon: card.icon,
      tooltip: card.tooltip,
      kind,
      component: card.component,
      componentInputs: this.pickDeclaredComponentInputs(
        card.component,
        kind === 'component' ? this.buildCardComponentInputs(section, card) : undefined,
      ),
      gridStyles: this.buildGridStyles(card.grid, preserveRows),
      styles: this.buildLayoutStyles(card.layout, section.grid),
      classes: this.buildLayoutClasses(card.layout),
      items: this.buildVisibleFieldItems(renderFields),
      completion,
    };
  }

  private buildFields(
    section: SectionTabsDisplaySection,
    card: SectionTabsDisplayCard,
  ): SectionTabsDisplayRenderField[] {
    return (card.fields ?? []).flatMap((field, index): SectionTabsDisplayRenderField[] => {
      if (!this.isVisible(field.visible)) return [];

      const fieldId = this.buildFieldId(card, field, index);
      return [this.buildField(fieldId, section, card, field)];
    });
  }

  private buildVisibleFieldItems(fields: SectionTabsDisplayRenderField[]): SectionTabsDisplayFieldItem[] {
    return fields.flatMap((field): SectionTabsDisplayFieldItem[] => {
      if (!this.shouldRenderField(field)) return [];

      const items: SectionTabsDisplayFieldItem[] = [];
      if (field.source.layout?.breakBefore) items.push({ id: `${field.id}-before`, type: 'break' });
      items.push(field);
      if (field.source.layout?.breakAfter) items.push({ id: `${field.id}-after`, type: 'break' });
      return items;
    });
  }

  private buildField(
    id: string,
    section: SectionTabsDisplaySection,
    card: SectionTabsDisplayCard,
    field: SectionTabsDisplayField,
  ): SectionTabsDisplayRenderField {
    const value = this.getPathValue(this.options?.data, field.path);
    const selectOption = field.kind === 'select' ? this.findSelectOption(value, field.options) : undefined;
    const color = field.color ?? selectOption?.color;
    const filled = this.isFilled(value);
    const displayValue = this.formatFieldValue(field, value, selectOption);
    const chipsValue = field.kind === 'chips' ? this.buildChipViewModels(field, value) : [];
    const componentInputs = this.pickDeclaredComponentInputs(
      field.component,
      this.buildFieldComponentInputs(section, card, field, value),
    );

    return {
      id,
      type: 'field',
      source: field,
      label: field.label,
      labelAction: field.labelAction,
      kind: field.kind,
      value,
      filled,
      displayValue,
      chipsValue,
      color,
      suffix: field.kind === 'text' ? field.suffix : undefined,
      component: field.component,
      componentInputs,
      styles: this.buildLayoutStyles(field.layout, card.grid),
      classes: {
        ...this.buildLayoutClasses(field.layout),
        'section-tabs-display__field-cell--empty': !filled,
      },
      onClick: field.onClick,
    };
  }

  private buildFieldComponentInputs(
    section: SectionTabsDisplaySection,
    card: SectionTabsDisplayCard,
    field: SectionTabsDisplayField,
    value: unknown,
  ): Record<string, unknown> {
    const context: SectionTabsDisplayFieldComponentContext = {
      data: this.options?.data,
      value,
      field,
      card,
      section,
      options: this.options,
    };

    return {
      data: context.data,
      record: context.data,
      value: context.value,
      field: context.field,
      card: context.card,
      section: context.section,
      options: context.options,
      ...(field.componentInputs ?? {}),
    };
  }

  private buildCardComponentInputs(
    section: SectionTabsDisplaySection,
    card: SectionTabsDisplayCard,
  ): Record<string, unknown> {
    const value = this.getPathValue(this.options?.data, card.path ?? '');
    const context: SectionTabsDisplayCardComponentContext = {
      data: this.options?.data,
      value,
      card,
      section,
      options: this.options,
    };

    return {
      data: context.data,
      record: context.data,
      value: context.value,
      card: context.card,
      section: context.section,
      options: context.options,
      ...(card.componentInputs ?? {}),
    };
  }

  private buildFieldId(card: SectionTabsDisplayCard, field: SectionTabsDisplayField, index: number): string {
    return `${card.id}-${field.path || field.label || index}-${index}`;
  }

  private buildGridStyles(grid?: SectionTabsDisplayGrid, preserveRows = false): Record<string, string> {
    const columns = this.normalizePositiveInteger(grid?.columns, 1);
    const minColumnWidth = grid?.minColumnWidth || '0px';

    return {
      '--section-tabs-display-grid-columns': `${columns}`,
      '--section-tabs-display-grid-gap': grid?.gap || '12px',
      '--section-tabs-display-grid-min-column-width': minColumnWidth,
      '--section-tabs-display-grid-track-min-column-width': preserveRows ? minColumnWidth : '0px',
    };
  }

  private buildLayoutStyles(
    layout: SectionTabsDisplayLayout | undefined,
    grid?: SectionTabsDisplayGrid,
  ): Record<string, string> {
    const styles: Record<string, string> = { ...(layout?.styles ?? {}) };
    const columns = this.normalizePositiveInteger(grid?.columns, 1);
    const colSpan = Math.min(this.normalizePositiveInteger(layout?.colSpan, 1), columns);
    const rowSpan = this.normalizePositiveInteger(layout?.rowSpan);

    styles['--section-tabs-display-item-col-span'] = `${colSpan}`;
    styles['grid-column'] = `span ${colSpan}`;
    if (rowSpan) styles['grid-row'] = `span ${rowSpan}`;

    return styles;
  }

  private hasRowSpan(items?: Array<{ layout?: SectionTabsDisplayLayout }>): boolean {
    return (items ?? []).some(item => this.normalizePositiveInteger(item.layout?.rowSpan, 1) > 1);
  }

  private buildLayoutClasses(layout?: SectionTabsDisplayLayout): Record<string, boolean> {
    const classes: Record<string, boolean> = { 'section-tabs-display__item--break-before': !!layout?.breakBefore };
    if (layout?.classes) layout.classes.split(' ').forEach(c => (classes[c] = true));
    return classes;
  }

  private resolveCompletion(
    source: false | SectionTabsDisplayCompletion | undefined,
    fallbackFactory: () => SectionTabsDisplayNumericCompletion,
  ): SectionTabsDisplayCompletionState {
    if (source === false || source?.disabled) return { enabled: false };

    const fallback = fallbackFactory();
    const doneOverride = this.resolveExplicitCounter(source?.done, source?.donePath);
    const totalOverride = this.resolveExplicitCounter(source?.total, source?.totalPath);
    const hasOverride = this.hasCounterValue(doneOverride) || this.hasCounterValue(totalOverride);

    if (!hasOverride && fallback.total <= 0) return { enabled: false };

    const done = this.hasCounterValue(doneOverride) ? doneOverride : fallback.done;
    const total = this.hasCounterValue(totalOverride) ? totalOverride : fallback.total;
    const enabled = this.hasCounterValue(done) || this.hasCounterValue(total);

    return {
      enabled,
      done: enabled ? done : undefined,
      total: enabled ? total : undefined,
      label: enabled ? this.buildCompletionLabel(done, total) : undefined,
    };
  }

  private calculateFieldsCompletion(fields: SectionTabsDisplayRenderField[]): SectionTabsDisplayNumericCompletion {
    return fields.reduce(
      (completion, field): SectionTabsDisplayNumericCompletion => {
        completion.total += 1;
        if (field.filled) completion.done += 1;
        return completion;
      },
      { done: 0, total: 0 },
    );
  }

  private calculateSectionCompletion(cards: SectionTabsDisplayRenderCard[]): SectionTabsDisplayNumericCompletion {
    return cards.reduce(
      (completion, card): SectionTabsDisplayNumericCompletion => {
        if (!card.completion.enabled) return completion;
        if (typeof card.completion.done === 'number') completion.done += card.completion.done;
        if (typeof card.completion.total === 'number') completion.total += card.completion.total;
        return completion;
      },
      { done: 0, total: 0 },
    );
  }

  private resolveExplicitCounter(value?: SectionTabsDisplayCounter, path?: string): SectionTabsDisplayCounter {
    if (this.hasCounterValue(value)) return value;
    if (path) return this.getPathValue(this.options?.data, path) as SectionTabsDisplayCounter;
    return undefined;
  }

  private buildCompletionLabel(
    done?: SectionTabsDisplayCounter,
    total?: SectionTabsDisplayCounter,
  ): string | undefined {
    if (!this.hasCounterValue(done)) return undefined;
    if (!this.hasCounterValue(total)) return `${done}`;
    return `${done}/${total}`;
  }

  private hasCounterValue(value: SectionTabsDisplayCounter): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private isVisible(predicate?: (record: any) => boolean): boolean {
    return predicate ? predicate(this.options?.data) : true;
  }

  private shouldRenderField(field: SectionTabsDisplayRenderField): boolean {
    if (this.showEmptyFieldsState) return true;
    if (field.kind === 'component') return true;
    return field.filled;
  }

  private getCardKind(card: SectionTabsDisplayCard): SectionTabsDisplayCardKind {
    return card.kind ?? (card.component ? 'component' : 'fields');
  }

  private formatFieldValue(
    field: SectionTabsDisplayField,
    value: unknown,
    selectOption?: SectionTabsDisplaySelectOption,
  ): string | SafeHtml {
    if (!this.isFilled(value)) return '—';
    if (field.kind === 'text' && !field.suffix && this.isSafeHtmlValue(value)) return value;

    switch (field.kind) {
      case 'number':
        return this.formatNumberValue(value, field);
      case 'date':
        return this.formatDateValue(value, field.dateFormat);
      case 'select':
        return selectOption?.label ?? this.formatUnknownValue(value);
      default:
        return this.formatTextValue(value, field.suffix);
    }
  }

  private formatTextValue(value: unknown, suffix?: string): string {
    const displayValue = this.formatUnknownValue(value);
    return suffix ? `${displayValue}${suffix}` : displayValue;
  }

  private formatNumberValue(value: unknown, field: SectionTabsDisplayField): string {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return this.formatUnknownValue(value);

    const formattedValue = new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: field.decimal,
      maximumFractionDigits: field.decimal,
    }).format(numberValue);

    return field.unit ? `${formattedValue} ${field.unit}` : formattedValue;
  }

  private formatDateValue(value: unknown, dateFormat?: string): string {
    try {
      return formatDate(value as string | number | Date, dateFormat || 'dd/MM/yyyy', this.locale);
    } catch {
      return this.formatUnknownValue(value);
    }
  }

  private buildChipViewModels(field: SectionTabsDisplayField, value: unknown): SectionTabsDisplayChipViewModel[] {
    const items = this.normalizeChipItems(value);
    return items
      .map((item, index): SectionTabsDisplayChipViewModel => {
        return {
          label: this.resolveChipLabel(item, field.chips),
          trackValue: this.resolveChipTrackValue(item, field.chips, index),
          icon: field.chips?.icon,
          color: this.resolveChipColor(item, field.chips),
        };
      })
      .filter((chip): boolean => !!chip.label);
  }

  private normalizeChipItems(value: unknown): unknown[] {
    if (!this.isFilled(value)) return [];
    return Array.isArray(value) ? value : [value];
  }

  private resolveChipLabel(item: unknown, chips?: SectionTabsDisplayChipConfig): string {
    if (chips?.labelPath) return this.formatOptionalValue(this.getPathValue(item, chips.labelPath));
    if (this.isPrimitiveValue(item)) return this.formatOptionalValue(item);

    return this.formatOptionalValue(
      this.getPathValue(item, 'label') ??
        this.getPathValue(item, 'name') ??
        this.getPathValue(item, 'title') ??
        this.getPathValue(item, 'displayName') ??
        this.getPathValue(item, 'fullname') ??
        this.getPathValue(item, '_id') ??
        this.getPathValue(item, 'id'),
    );
  }

  private resolveChipTrackValue(
    item: unknown,
    chips: SectionTabsDisplayChipConfig | undefined,
    index: number,
  ): unknown {
    if (chips?.trackByPath) return this.getPathValue(item, chips.trackByPath) ?? index;
    if (this.isPrimitiveValue(item)) return item ?? index;
    return (
      this.getPathValue(item, '_id') ?? this.getPathValue(item, 'id') ?? this.resolveChipLabel(item, chips) ?? index
    );
  }

  private resolveChipColor(item: unknown, chips?: SectionTabsDisplayChipConfig): string | undefined {
    if (chips?.colorPath) return this.formatOptionalValue(this.getPathValue(item, chips.colorPath)) || undefined;
    return chips?.color;
  }

  private formatOptionalValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '';
    return `${value}`;
  }

  // Pass Angular SafeHtml through unchanged; the innerHTML binding still applies Angular's security handling.
  private isSafeHtmlValue(value: unknown): value is SafeHtml {
    return typeof value === 'object' && value !== null &&
      Object.prototype.hasOwnProperty.call(value, 'changingThisBreaksApplicationSecurity');
  }

  private formatUnknownValue(value: unknown): string {
    if (Array.isArray(value)) return value.map((item): string => this.formatUnknownValue(item)).join(', ');
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return `${value}`;
  }

  private findSelectOption(
    value: unknown,
    options?: SectionTabsDisplaySelectOption[],
  ): SectionTabsDisplaySelectOption | undefined {
    return options?.find((option): boolean => this.areValuesEqual(option.value, value));
  }

  private areValuesEqual(first: unknown, second: unknown): boolean {
    if (first === second) return true;
    if (this.isPrimitiveValue(first) || this.isPrimitiveValue(second)) return false;

    try {
      return JSON.stringify(first) === JSON.stringify(second);
    } catch {
      return false;
    }
  }

  private getPathValue(data: unknown, path: string): unknown {
    if (!path) return data;

    return this.parsePath(path).reduce((current: unknown, pathPart: string): unknown => {
      if (current === null || current === undefined) return undefined;
      return (current as Record<string, unknown>)[pathPart];
    }, data);
  }

  private parsePath(path: string): string[] {
    return path
      .replace(
        /\[(\d+|"[^"]+"|'[^']+')\]/g,
        (_match: string, value: string): string => `.${value.replace(/["']/g, '')}`,
      )
      .split('.')
      .filter((pathPart): boolean => !!pathPart);
  }

  private normalizePositiveInteger(value: unknown): number | undefined;
  private normalizePositiveInteger(value: unknown, fallback: number): number;
  private normalizePositiveInteger(value: unknown, fallback?: number): number | undefined {
    const numberValue = Number(value ?? fallback);
    if (!Number.isFinite(numberValue) || numberValue <= 0) return fallback;
    return Math.floor(numberValue);
  }

  private isFilled(value: unknown): boolean {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  private isPrimitiveValue(value: unknown): boolean {
    return value === null || (typeof value !== 'object' && typeof value !== 'function');
  }
}
