import { readPath as get } from "../internal/value.helpers";
/** @format */

import { EditEntityDialogIntl } from "../edit-entity-dialog.intl";
import { Injectable, Type, reflectComponentType } from "@angular/core";
import { Validators } from "@angular/forms";
import { has } from "lodash-es";
import {
  EditEntityControlStateApi,
  EditEntityFormGroup,
} from "../classes/edit-entity-form-group";
import {
  EditEntityCard,
  EditEntityCardAction,
  EditEntityComponentDisplayOptions,
  EditEntityComponentOptions,
  EditEntityDisplayOptions,
  EditEntityField,
  EditEntityGridOptions,
  EditEntityRecord,
  EditEntityRenderState,
  EditEntityRuntimeCard,
  EditEntityRuntimeCardAction,
  EditEntityRuntimeCardItem,
  EditEntityRuntimeField,
  EditEntityRuntimeFieldItem,
  EditEntityRuntimeMenuOption,
  EditEntityRuntimeSection,
  EditEntitySection,
  EditEntitySingleSectionOptions,
  EditEntityTabOptions,
  EditEntityTabRenderState,
  EditEntityTabsOptions,
  EditEntityValidationStats,
  EditEntityValidationSummary,
} from "../edit-entity-dialog.types";
import { EditEntityConditionalStateService } from "./edit-entity-conditional-state.service";

interface CompletionState {
  done?: number | string | null;
  total?: number | string | null;
  label?: string;
  enabled: boolean;
}

const EDIT_ENTITY_VALIDATION_ERROR_COLOR = "#b42318";
const EDIT_ENTITY_VALIDATION_MISSING_COLOR = "#b54708";
const EDIT_ENTITY_VALIDATION_DEFAULT_COLOR = "#607286";

@Injectable()
export class EditEntityRenderService<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  private readonly componentInputNamesByType = new WeakMap<
    Type<unknown>,
    ReadonlySet<string>
  >();

  constructor(
    private readonly conditionalStateService: EditEntityConditionalStateService<TRecord>,
    private readonly intl: EditEntityDialogIntl = new EditEntityDialogIntl(),
  ) {}

  buildRenderState(
    options: EditEntityComponentOptions<TRecord>,
    formGroup: EditEntityFormGroup,
    showEmptyFields: boolean,
  ): EditEntityRenderState<TRecord> {
    return this.buildOptionsRenderState(
      options,
      options.displayOptions,
      formGroup,
      showEmptyFields,
    );
  }

  filterDeclaredComponentInputs<TComponent>(
    component: Type<TComponent> | undefined,
    inputs: Record<string, unknown> | undefined,
  ): Record<string, unknown> {
    if (!component || !inputs) return {};

    const declaredInputNames = this.getDeclaredComponentInputNames(
      component as Type<unknown>,
    );
    if (!declaredInputNames.size) return {};

    return Object.entries(inputs).reduce<Record<string, unknown>>(
      (filteredInputs, [name, value]) => {
        if (declaredInputNames.has(name)) filteredInputs[name] = value;
        return filteredInputs;
      },
      {},
    );
  }

  collectFields(
    displayOptions: EditEntityDisplayOptions<TRecord>,
  ): EditEntityField<TRecord>[] {
    if (this.isTabsOptions(displayOptions)) {
      return displayOptions.tabs.flatMap((tab) =>
        this.collectFields(tab.displayOptions),
      );
    }

    if (this.isSectionsOptions(displayOptions)) {
      return displayOptions.sections.flatMap((section) =>
        this.collectSectionFields(section),
      );
    }

    if (this.isSingleSectionOptions(displayOptions)) {
      return this.collectSectionFields(displayOptions.section);
    }

    return [];
  }

  private getDeclaredComponentInputNames(
    component: Type<unknown>,
  ): ReadonlySet<string> {
    const cachedInputNames = this.componentInputNamesByType.get(component);
    if (cachedInputNames) return cachedInputNames;

    const componentMirror = reflectComponentType(component);
    const inputNames = new Set(
      componentMirror?.inputs.map((input) => input.templateName) ?? [],
    );
    this.componentInputNamesByType.set(component, inputNames);
    return inputNames;
  }

  private buildOptionsRenderState(
    options: EditEntityComponentOptions<TRecord>,
    displayOptions: EditEntityDisplayOptions<TRecord>,
    formGroup: EditEntityFormGroup,
    showEmptyFields: boolean,
  ): EditEntityRenderState<TRecord> {
    if (this.isTabsOptions(displayOptions)) {
      const tabs = displayOptions.tabs.map((tab) =>
        this.buildTabRenderState(options, tab, formGroup, showEmptyFields),
      );
      const validationStats = this.calculateTabsValidationStats(tabs);

      return {
        kind: "tabs",
        tabs,
        validationStats,
        validationSummary: this.buildValidationSummary(validationStats),
      };
    }

    if (this.isSectionsOptions(displayOptions)) {
      const sections = this.buildSections(
        options,
        displayOptions.sections,
        formGroup,
        showEmptyFields,
      );
      const validationStats = this.calculateSectionsValidationStats(sections);

      return {
        kind: "sections",
        sectionsMenuHeader: displayOptions.menuHeader,
        sections,
        showEmptyFieldsToggle: displayOptions.showEmptyFieldsToggle,
        showEmptyFieldsLabel: displayOptions.showEmptyFieldsLabel,
        validationStats,
        validationSummary: this.buildValidationSummary(validationStats),
      };
    }

    if (this.isSingleSectionOptions(displayOptions)) {
      const sections = this.buildSections(
        options,
        [displayOptions.section],
        formGroup,
        showEmptyFields,
      );
      const validationStats = this.calculateSectionsValidationStats(sections);

      return {
        kind: "section",
        sections,
        showEmptyFieldsToggle: displayOptions.showEmptyFieldsToggle,
        showEmptyFieldsLabel: displayOptions.showEmptyFieldsLabel,
        validationStats,
        validationSummary: this.buildValidationSummary(validationStats),
      };
    }

    if (this.isComponentOptions(displayOptions)) {
      const validationStats = this.createEmptyValidationStats();

      return {
        kind: "component",
        component: displayOptions.component,
        componentInputs: this.buildComponentInputs(
          options,
          displayOptions,
          formGroup,
        ),
        componentOverflow: displayOptions.overflow ?? true,
        validationStats,
        validationSummary: this.buildValidationSummary(validationStats),
      };
    }

    const validationStats = this.createEmptyValidationStats();
    return {
      kind: "empty",
      validationStats,
      validationSummary: this.buildValidationSummary(validationStats),
    };
  }

  private buildTabRenderState(
    options: EditEntityComponentOptions<TRecord>,
    tab: EditEntityTabOptions<TRecord>,
    formGroup: EditEntityFormGroup,
    showEmptyFields: boolean,
  ): EditEntityTabRenderState<TRecord> {
    const renderState = this.buildOptionsRenderState(
      options,
      tab.displayOptions,
      formGroup,
      showEmptyFields,
    );
    const validationStats =
      renderState.validationStats ?? this.createEmptyValidationStats();

    return {
      label: tab.label,
      icon: tab.icon,
      svgIcon: tab.svgIcon,
      badge: tab.badge,
      isVisible: this.conditionalStateService.resolve(
        tab.visible,
        options.record,
        formGroup,
        true,
      ),
      validationStats,
      validationSummary: this.buildValidationSummary(validationStats),
      renderState,
    };
  }

  private buildSections(
    options: EditEntityComponentOptions<TRecord>,
    sections: EditEntitySection<TRecord>[],
    formGroup: EditEntityFormGroup,
    showEmptyFields: boolean,
  ): EditEntityRuntimeSection<TRecord>[] {
    return sections
      .filter((section) =>
        this.conditionalStateService.resolve(
          section.visible,
          options.record,
          formGroup,
          true,
        ),
      )
      .map((section) =>
        this.buildSection(options, section, formGroup, showEmptyFields),
      );
  }

  private buildSection(
    options: EditEntityComponentOptions<TRecord>,
    section: EditEntitySection<TRecord>,
    formGroup: EditEntityFormGroup,
    showEmptyFields: boolean,
  ): EditEntityRuntimeSection<TRecord> {
    const grid = this.resolveGrid(section.grid);
    const cards = section.cards
      .filter((card) =>
        this.conditionalStateService.resolve(
          card.visible,
          options.record,
          formGroup,
          true,
        ),
      )
      .map((card, index): EditEntityRuntimeCardItem<TRecord>[] => {
        const items: EditEntityRuntimeCardItem<TRecord>[] = [];
        if (card.layout?.breakBefore)
          items.push({ id: `${card.id || index}-before`, type: "break" });
        items.push(
          this.buildCard(
            options,
            section,
            grid,
            card,
            formGroup,
            showEmptyFields,
          ),
        );
        if (card.layout?.breakAfter)
          items.push({ id: `${card.id || index}-after`, type: "break" });
        return items;
      })
      .flat();

    const runtimeCards = cards.filter(
      (item): item is EditEntityRuntimeCard<TRecord> => item.type === "card",
    );
    const completion = this.resolveCompletion(
      section.completion,
      this.calculateSectionCompletion(runtimeCards),
    );
    const validationStats = this.calculateCardsValidationStats(runtimeCards);
    const validationSummary = this.buildValidationSummary(validationStats);
    const hasValidationIssue =
      validationSummary.status === "invalid" ||
      validationSummary.status === "missing";

    return {
      id: section.id,
      source: section,
      label: section.label,
      icon: section.icon,
      tooltip: section.tooltip,
      sectionMode: section.sectionMode ?? "default",
      cardCount: runtimeCards.length,
      grid,
      gridStyles: this.buildGridStyles(grid),
      items: cards,
      validationStats,
      validationSummary,
      done: hasValidationIssue ? validationSummary.label : completion.done,
      total: hasValidationIssue ? undefined : completion.total,
      progress: !hasValidationIssue,
      statusColor:
        validationSummary.color ?? EDIT_ENTITY_VALIDATION_DEFAULT_COLOR,
    };
  }

  private buildCard(
    options: EditEntityComponentOptions<TRecord>,
    section: EditEntitySection<TRecord>,
    sectionGrid: EditEntityGridOptions,
    card: EditEntityCard<TRecord>,
    formGroup: EditEntityFormGroup,
    showEmptyFields: boolean,
  ): EditEntityRuntimeCard<TRecord> {
    const kind = card.kind ?? (card.component ? "component" : "fields");
    const fieldGrid = this.resolveCardFieldGrid(section, card);
    const fields =
      kind === "fields"
        ? this.buildFieldItems(
            options,
            card,
            fieldGrid,
            formGroup,
            showEmptyFields,
          )
        : [];
    const validationFields =
      kind === "component"
        ? this.buildFieldItems(options, card, fieldGrid, formGroup, true)
        : fields;
    const runtimeFields = validationFields.filter(
      (item): item is EditEntityRuntimeField<TRecord> => item.type === "field",
    );
    const completionFallback =
      kind === "component"
        ? this.calculateComponentCardCompletion(options, card, formGroup)
        : this.calculateFieldsCompletion(runtimeFields);
    const completion = this.resolveCompletion(
      card.completion,
      completionFallback,
    );
    const validationStats = this.calculateFieldsValidationStats(runtimeFields);
    const validationSummary = this.buildValidationSummary(validationStats);
    const validationLabel =
      validationSummary.status === "invalid" ||
      validationSummary.status === "missing"
        ? validationSummary.label
        : undefined;

    return {
      id: card.id,
      type: "card",
      source: card,
      label: card.label,
      icon: card.icon,
      tooltip: card.tooltip,
      kind,
      component: card.component,
      componentInputs:
        kind === "component"
          ? this.buildCardComponentInputs(options, section, card, formGroup)
          : undefined,
      grid: fieldGrid,
      gridStyles: this.buildGridStyles(fieldGrid),
      styles: this.buildLayoutStyles(card.layout, sectionGrid),
      classes: this.buildLayoutClasses(card.layout),
      items: fields,
      headerValueLabel: this.formatCardHeaderValue(
        card,
        options.record,
        formGroup,
      ),
      completionLabel:
        card.completion === false
          ? undefined
          : (validationLabel ?? completion.label),
      completionColor: validationLabel ? validationSummary.color : undefined,
      validationStats,
      validationSummary,
      done: completion.done,
      total: completion.total,
      runtimeActions: this.buildRuntimeCardActions(options, card, formGroup),
    };
  }

  private formatCardHeaderValue(
    card: EditEntityCard<TRecord>,
    record: TRecord | undefined,
    formGroup: EditEntityFormGroup,
  ): string | undefined {
    const headerValue = card.headerValue;
    if (!headerValue) return undefined;

    const value =
      typeof headerValue.value === "function"
        ? headerValue.value(record, formGroup)
        : headerValue.value;
    if (value === null || value === undefined) return undefined;
    if (headerValue.format === "percentage" && typeof value === "number")
      return `${Math.round(value * 100)} %`;
    return String(value);
  }

  private buildFieldItems(
    options: EditEntityComponentOptions<TRecord>,
    card: EditEntityCard<TRecord>,
    grid: EditEntityGridOptions,
    formGroup: EditEntityFormGroup,
    showEmptyFields: boolean,
  ): EditEntityRuntimeFieldItem<TRecord>[] {
    return (card.fields ?? []).flatMap(
      (field, index): EditEntityRuntimeFieldItem<TRecord>[] => {
        if (field.kind === "metadata") return [];

        const item = this.buildField(
          options,
          card,
          field,
          index,
          grid,
          formGroup,
        );
        if (!this.shouldRenderField(item, showEmptyFields)) return [];

        const items: EditEntityRuntimeFieldItem<TRecord>[] = [];
        if (field.layout?.breakBefore)
          items.push({ id: `${item.id}-before`, type: "break" });
        items.push(item);
        if (field.layout?.breakAfter)
          items.push({ id: `${item.id}-after`, type: "break" });
        return items;
      },
    );
  }

  private buildField(
    options: EditEntityComponentOptions<TRecord>,
    card: EditEntityCard<TRecord>,
    field: Exclude<EditEntityField<TRecord>, { kind: "metadata" }>,
    index: number,
    grid: EditEntityGridOptions,
    formGroup: EditEntityFormGroup,
  ): EditEntityRuntimeField<TRecord> {
    const control =
      field.kind === "separator"
        ? undefined
        : (formGroup.getControl<EditEntityControlStateApi>(field.name) ??
          undefined);
    const visible =
      field.kind === "separator"
        ? this.conditionalStateService.resolve(
            field.visible,
            options.record,
            formGroup,
            true,
          )
        : (control?.isVisible ?? true);
    const value =
      field.kind === "separator" ? undefined : control?.getRawValue();
    const enabled = field.kind !== "separator" && !!control?.enabled;
    const countable = field.kind !== "separator" && field.kind !== "display";
    const filled =
      field.kind === "separator"
        ? false
        : field.isFilled
          ? field.isFilled(value, options.record, formGroup)
          : this.isFilled(value);
    const required =
      countable && enabled && !!control?.hasValidator(Validators.required);
    const missing = visible && countable && enabled && required && !filled;
    const invalid = visible && countable && enabled && !!control?.invalid;
    const dirty = countable && this.isFieldUpdated(formGroup, field.name);

    return {
      id: this.buildFieldId(card, field, index),
      type: "field",
      source: field,
      field: field.kind === "separator" ? undefined : field,
      separator: field.kind === "separator" ? field : undefined,
      kind: field.kind,
      visible,
      enabled,
      countable,
      filled,
      required,
      missing,
      invalid,
      dirty,
      styles: this.buildLayoutStyles(field.layout, grid),
      classes: {
        ...this.buildLayoutClasses(field.layout),
        "edit-entity-field-cell--empty": !filled,
        "edit-entity-field-cell--invalid": invalid,
      },
    };
  }

  private buildRuntimeCardActions(
    options: EditEntityComponentOptions<TRecord>,
    card: EditEntityCard<TRecord>,
    formGroup: EditEntityFormGroup,
  ): EditEntityRuntimeCardAction<TRecord>[] {
    return (card.actions ?? []).map(
      (action): EditEntityRuntimeCardAction<TRecord> => {
        return {
          ...action,
          isVisible: this.conditionalStateService.resolve(
            action.visible,
            options.record,
            formGroup,
            true,
          ),
          isDisabled: this.conditionalStateService.resolve(
            action.disabled,
            options.record,
            formGroup,
            false,
          ),
          runtimeMenuOptions: this.buildRuntimeMenuOptions(
            options,
            action,
            formGroup,
          ),
        };
      },
    );
  }

  private buildRuntimeMenuOptions(
    options: EditEntityComponentOptions<TRecord>,
    action: EditEntityCardAction<TRecord>,
    formGroup: EditEntityFormGroup,
  ): EditEntityRuntimeMenuOption<TRecord>[] | undefined {
    if (!action.menuOptions) return undefined;

    return action.menuOptions.map(
      (option): EditEntityRuntimeMenuOption<TRecord> => {
        return {
          ...option,
          isVisible: this.conditionalStateService.resolve(
            option.visible,
            options.record,
            formGroup,
            true,
          ),
          isDisabled: this.conditionalStateService.resolve(
            option.disabled,
            options.record,
            formGroup,
            false,
          ),
        };
      },
    );
  }

  private buildComponentInputs(
    options: EditEntityComponentOptions<TRecord>,
    displayOptions: EditEntityComponentDisplayOptions<TRecord>,
    formGroup: EditEntityFormGroup,
  ): Record<string, unknown> {
    const baseInputs = {
      record: options.record,
      formGroup,
      options,
      displayOptions,
    };
    const customInputs =
      typeof displayOptions.input === "function"
        ? displayOptions.input({
            record: options.record,
            formGroup,
            options,
            displayOptions,
          })
        : displayOptions.input;
    return { ...baseInputs, ...(customInputs ?? {}) };
  }

  private buildCardComponentInputs(
    options: EditEntityComponentOptions<TRecord>,
    section: EditEntitySection<TRecord>,
    card: EditEntityCard<TRecord>,
    formGroup: EditEntityFormGroup,
  ): Record<string, unknown> {
    const baseInputs = {
      record: options.record,
      formGroup,
      options,
      section,
      card,
    };
    const input = card.input ?? card.componentInputs;
    const customInputs =
      typeof input === "function"
        ? input({ record: options.record, formGroup, options, section, card })
        : input;
    return { ...baseInputs, ...(customInputs ?? {}) };
  }

  private resolveCompletion(
    source:
      | false
      | {
          done?: number | string | null;
          total?: number | string | null;
          disabled?: boolean;
        }
      | undefined,
    fallback: CompletionState,
  ): CompletionState {
    if (source === false || source?.disabled) return { enabled: false };

    const hasSourceDone = this.hasCounterValue(source?.done);
    const hasSourceTotal = this.hasCounterValue(source?.total);
    const hasSourceCompletion = hasSourceDone || hasSourceTotal;

    if (!hasSourceCompletion && !fallback.enabled) return { enabled: false };

    const done = hasSourceDone ? source?.done : fallback.done;
    const total = hasSourceTotal ? source?.total : fallback.total;
    const enabled = hasSourceCompletion || fallback.enabled;

    return {
      enabled,
      done: enabled ? done : undefined,
      total: enabled ? total : undefined,
      label: enabled ? this.buildCompletionLabel(done, total) : undefined,
    };
  }

  private calculateFieldsCompletion(
    fields: EditEntityRuntimeField<TRecord>[],
  ): CompletionState {
    const countableFields = fields.filter(
      (field) => field.visible && field.countable,
    );
    const done = countableFields.filter((field) => field.filled).length;
    return {
      enabled: countableFields.length > 0,
      done,
      total: countableFields.length,
    };
  }

  private calculateComponentCardCompletion(
    options: EditEntityComponentOptions<TRecord>,
    card: EditEntityCard<TRecord>,
    formGroup: EditEntityFormGroup,
  ): CompletionState {
    const completion = card.completion === false ? undefined : card.completion;
    if (!completion?.name) return { enabled: false };

    const value = this.getCompletionControlValue(
      options,
      formGroup,
      completion.name,
    );
    if (completion.countItems) {
      const done = Array.isArray(value) ? value.length : 0;
      return { enabled: true, done, total: done };
    }

    return { enabled: true, done: this.isFilled(value) ? 1 : 0, total: 1 };
  }

  private getCompletionControlValue(
    options: EditEntityComponentOptions<TRecord>,
    formGroup: EditEntityFormGroup,
    name: string,
  ): unknown {
    const control = formGroup.getControl(name);
    if (control) return control.getRawValue();

    const formValue = get(formGroup.getRawValue(), name);
    if (formValue !== undefined) return formValue;

    const recordValue = get(options.record, name);
    if (recordValue !== undefined) return recordValue;

    return get(options.defaultValues, name);
  }

  private calculateSectionCompletion(
    cards: EditEntityRuntimeCard<TRecord>[],
  ): CompletionState {
    const done = cards.reduce(
      (total, card): number =>
        total + (typeof card.done === "number" ? card.done : 0),
      0,
    );
    const total = cards.reduce(
      (sum, card): number =>
        sum + (typeof card.total === "number" ? card.total : 0),
      0,
    );
    return { enabled: total > 0, done, total };
  }

  private calculateFieldsValidationStats(
    fields: EditEntityRuntimeField<TRecord>[],
  ): EditEntityValidationStats {
    const countableFields = fields.filter(
      (field) => field.visible && field.countable,
    );
    const requiredFields = countableFields.filter((field) => field.required);
    const missingFields = countableFields.filter((field) => field.missing);
    const invalidFields = countableFields.filter(
      (field) => field.invalid && !field.missing,
    );
    const dirtyFields = countableFields.filter((field) => field.dirty);

    return {
      total: countableFields.length,
      completed: countableFields.filter((field) => field.filled).length,
      required: requiredFields.length,
      missing: missingFields.length,
      invalid: invalidFields.length,
      dirty: dirtyFields.length,
    };
  }

  private calculateCardsValidationStats(
    cards: EditEntityRuntimeCard<TRecord>[],
  ): EditEntityValidationStats {
    return this.mergeValidationStats(cards.map((card) => card.validationStats));
  }

  private calculateSectionsValidationStats(
    sections: EditEntityRuntimeSection<TRecord>[],
  ): EditEntityValidationStats {
    return this.mergeValidationStats(
      sections.map((section) => section.validationStats),
    );
  }

  private calculateTabsValidationStats(
    tabs: Array<{
      isVisible: boolean;
      validationStats: EditEntityValidationStats;
    }>,
  ): EditEntityValidationStats {
    return this.mergeValidationStats(
      tabs.filter((tab) => tab.isVisible).map((tab) => tab.validationStats),
    );
  }

  private mergeValidationStats(
    items: EditEntityValidationStats[],
  ): EditEntityValidationStats {
    return items.reduce(
      (stats, item): EditEntityValidationStats => ({
        total: stats.total + item.total,
        completed: stats.completed + item.completed,
        required: stats.required + item.required,
        missing: stats.missing + item.missing,
        invalid: stats.invalid + item.invalid,
        dirty: stats.dirty + item.dirty,
      }),
      this.createEmptyValidationStats(),
    );
  }

  private createEmptyValidationStats(): EditEntityValidationStats {
    return {
      total: 0,
      completed: 0,
      required: 0,
      missing: 0,
      invalid: 0,
      dirty: 0,
    };
  }

  private buildValidationSummary(
    stats: EditEntityValidationStats,
  ): EditEntityValidationSummary {
    if (stats.invalid > 0) {
      return {
        status: "invalid",
        label: `${stats.invalid + stats.missing}`,
        color: EDIT_ENTITY_VALIDATION_ERROR_COLOR,
        tooltip: this.buildInvalidValidationTooltip(stats),
      };
    }

    if (stats.missing > 0) {
      return {
        status: "missing",
        label: `${stats.missing}`,
        color: EDIT_ENTITY_VALIDATION_MISSING_COLOR,
        tooltip: this.buildMissingValidationTooltip(stats.missing),
      };
    }

    return { status: stats.total > 0 ? "valid" : "none" };
  }

  private buildInvalidValidationTooltip(
    stats: EditEntityValidationStats,
  ): string {
    const invalidLabel =
      stats.invalid === 1
        ? this.intl.messages.invalidField
        : this.intl.messages.invalidFields.replace(
            "{count}",
            String(stats.invalid),
          );
    if (stats.missing <= 0) return invalidLabel;
    return `${invalidLabel} - ${this.buildMissingValidationTooltip(stats.missing)}`;
  }

  private buildMissingValidationTooltip(count: number): string {
    return count === 1
      ? this.intl.messages.missingField
      : this.intl.messages.missingFields.replace("{count}", String(count));
  }

  private shouldRenderField(
    field: EditEntityRuntimeField<TRecord>,
    showEmptyFields: boolean,
  ): boolean {
    if (!field.visible) return false;
    if (field.kind === "separator") return true;
    if (showEmptyFields) return true;
    return field.kind !== "display" || field.filled;
  }

  private buildFieldId(
    card: EditEntityCard<TRecord>,
    field: Exclude<EditEntityField<TRecord>, { kind: "metadata" }>,
    index: number,
  ): string {
    const key =
      field.kind === "separator"
        ? (field.id ?? field.label ?? "separator")
        : field.name;
    return `${card.id}-${key}-${index}`;
  }

  private buildGridStyles(grid: EditEntityGridOptions): Record<string, string> {
    return {
      "--edit-entity-grid-columns": `${grid.columns}`,
      "--edit-entity-grid-effective-columns": `${grid.columns}`,
      "--edit-entity-grid-gap": grid.gap || "12px",
      "--edit-entity-grid-min-column-width": grid.minColumnWidth || "0px",
    };
  }

  private resolveGrid(grid?: EditEntityGridOptions): EditEntityGridOptions {
    return {
      columns: this.normalizePositiveInteger(grid?.columns, 1),
      gap: grid?.gap || "12px",
      minColumnWidth: grid?.minColumnWidth || "0px",
    };
  }

  private resolveCardFieldGrid(
    section: EditEntitySection<TRecord>,
    card: EditEntityCard<TRecord>,
  ): EditEntityGridOptions {
    const maxFieldColSpan = this.resolveMaxFieldColSpan(card.fields);
    const columns = Math.max(
      this.normalizePositiveInteger(
        card.grid?.columns ?? section.grid?.columns,
        1,
      ),
      maxFieldColSpan,
    );

    return {
      columns,
      gap: card.grid?.gap ?? "12px",
      minColumnWidth: card.grid?.minColumnWidth ?? "0px",
    };
  }

  private resolveMaxFieldColSpan(fields?: EditEntityField<TRecord>[]): number {
    return (fields ?? []).reduce((max, field): number => {
      if (field.kind === "metadata") return max;

      const colSpan = this.normalizePositiveInteger(field.layout?.colSpan, 1);
      return Math.max(max, colSpan);
    }, 1);
  }

  private buildLayoutStyles(
    layout:
      | { colSpan?: number; rowSpan?: number; styles?: Record<string, string> }
      | undefined,
    grid?: EditEntityGridOptions,
  ): Record<string, string> {
    const styles: Record<string, string> = { ...(layout?.styles ?? {}) };
    const columns = this.normalizePositiveInteger(grid?.columns, 1);
    const colSpan = Math.min(
      this.normalizePositiveInteger(layout?.colSpan, 1),
      columns,
    );
    const rowSpan = this.normalizePositiveInteger(layout?.rowSpan);
    styles["--edit-entity-item-col-span"] = `${colSpan}`;
    styles["--edit-entity-item-row-span"] = `${rowSpan ?? 1}`;
    styles["grid-column"] = `span ${colSpan}`;
    if (rowSpan) styles["grid-row"] = `span ${rowSpan}`;

    return styles;
  }

  private buildLayoutClasses(layout?: {
    breakBefore?: boolean;
    classes?: string;
  }): Record<string, boolean> {
    const classes: Record<string, boolean> = {
      "edit-entity-item--break-before": !!layout?.breakBefore,
    };
    if (layout?.classes)
      layout.classes
        .split(" ")
        .forEach((cssClass) => (classes[cssClass] = true));
    return classes;
  }

  private buildCompletionLabel(
    done?: number | string | null,
    total?: number | string | null,
  ): string | undefined {
    if (!this.hasCounterValue(done)) return undefined;
    if (!this.hasCounterValue(total)) return `${done}`;
    return `${done}/${total}`;
  }

  private hasCounterValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== "";
  }

  private isFilled(value: unknown): boolean {
    if (value === null || value === undefined || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  private isFieldUpdated(
    formGroup: EditEntityFormGroup,
    name: string,
  ): boolean {
    return (
      Object.prototype.hasOwnProperty.call(formGroup.updatedValue, name) ||
      has(formGroup.updatedValue, name)
    );
  }

  private normalizePositiveInteger(value: unknown): number | undefined;
  private normalizePositiveInteger(value: unknown, fallback: number): number;
  private normalizePositiveInteger(
    value: unknown,
    fallback?: number,
  ): number | undefined {
    const numberValue = Number(value ?? fallback);
    if (!Number.isFinite(numberValue) || numberValue <= 0) return fallback;
    return Math.floor(numberValue);
  }

  private collectSectionFields(
    section: EditEntitySection<TRecord>,
  ): EditEntityField<TRecord>[] {
    return section.cards.flatMap((card) => card.fields ?? []);
  }

  private isTabsOptions(
    options: EditEntityDisplayOptions<TRecord>,
  ): options is EditEntityTabsOptions<TRecord> {
    return "tabs" in options;
  }

  private isSectionsOptions(
    options: EditEntityDisplayOptions<TRecord>,
  ): options is { sections: EditEntitySection<TRecord>[] } {
    return "sections" in options;
  }

  private isSingleSectionOptions(
    options: EditEntityDisplayOptions<TRecord>,
  ): options is EditEntitySingleSectionOptions<TRecord> {
    return "section" in options;
  }

  private isComponentOptions(
    options: EditEntityDisplayOptions<TRecord>,
  ): options is EditEntityComponentDisplayOptions<TRecord> {
    return "component" in options;
  }
}
