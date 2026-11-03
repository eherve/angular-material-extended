/** @format */

import {
  ChangeDetectorRef,
  ElementRef,
  EventEmitter,
  inject,
  Injectable,
  signal,
} from "@angular/core";
import { cloneDeep, isEqual } from "lodash-es";

import { EDIT_ENTITY_LOGGER } from "@eherve/angular-material-forms/core";
import { DialogNavigationController } from "@eherve/angular-material-section-tabs";

import { ErrorHandler } from "@angular/core";
import { FormControlStatus } from "@angular/forms";
import {
  EDIT_ENTITY_DIALOG_HOST,
  EditEntityAction,
  EditEntityActionButton,
  EditEntityActionResult,
  EditEntityCardAction,
  EditEntityCardActionContext,
  EditEntityCardMenuOption,
  EditEntityComponentOptions,
  EditEntityConditionalStateService,
  EditEntityConfirmOptions,
  EditEntityDialogConnection,
  EditEntityDialogIntl,
  EditEntityDialogResult,
  EditEntityDisplayOptions,
  EditEntityField,
  EditEntityFormBuilderService,
  EditEntityFormGroup,
  EditEntityRecord,
  EditEntityRemovableState,
  EditEntityRenderService,
  EditEntityRenderState,
  EditEntityRuntimeAction,
  EditEntityRuntimeActionButton,
  EditEntityRuntimeActionComponent,
  EditEntityRuntimeCard,
  EditEntityRuntimeCardAction,
  EditEntityRuntimeCardItem,
  EditEntityRuntimeMenuOption,
  EditEntitySection,
  EditEntitySectionCardActionEvent,
  EditEntitySubmitValueService,
  EditEntityTitle,
  EditEntityTitleContext,
} from "@eherve/angular-material-forms/core";
import {
  firstValueFrom,
  isObservable,
  Observable,
  Subject,
  takeUntil,
} from "rxjs";
import { debounceTime } from "rxjs/operators";
import { SubSink } from "subsink";
import { DefaultEditEntityDialogHost } from "./default-edit-entity-dialog-host";

let nextEditEntityComponentId = 0;
export interface EntitySavePolicy<TRecord extends EditEntityRecord> {
  valid(): boolean;
  value(create: boolean): Record<string, unknown>;
  patch(record: TRecord, value: Record<string, unknown>): TRecord;
  saved(record: TRecord, value: Record<string, unknown>): Promise<void>;
  hydrate(record: TRecord): void;
  reset?(): void;
  refresh?(): void;
  componentUpdated?(): void;
  beforeClose?(): void;
  stickyResult?: boolean;
}
@Injectable()
export class EntityFormSession<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  options!: EditEntityComponentOptions<TRecord>;
  displayMode: "page" | "dialog" = "page";
  policy?: EntitySavePolicy<TRecord>;
  readonly result = new EventEmitter<EditEntityDialogResult<TRecord>>();
  readonly closeRequest = new EventEmitter<EditEntityDialogResult<TRecord>>();
  /** Successful independent component persistence participates in the close result. */
  readonly markComponentUpdated = (): void => {
    this.setSavedResult({ updated: true, record: this.options.record });
    this.policy?.componentUpdated?.();
    this.changeDetectorRef.markForCheck();
  };

  readonly navigationController = new DialogNavigationController();

  loading = true;
  _updating = false;
  get updating(): boolean {
    return this._updating;
  }
  set updating(value: boolean) {
    this._updating = value;
    this.policy?.refresh?.();
  }
  loadingLabel = "";
  errorLabel = "";
  title = "";
  subtitle = "";
  closeLabel = "";
  cancelLabel = "";
  createLabel = "";
  updateLabel = "";
  showEmptyFields = true;
  showEmptyFieldsToggle = false;
  showEmptyFieldsLabel = "";
  readonly intl = inject(EditEntityDialogIntl);
  connection?: EditEntityDialogConnection<TRecord>;
  readonly intlSub = this.intl.changes.subscribe(() => {
    this.refreshLabels();
    this.refreshRuntimeState();
    this.changeDetectorRef.markForCheck();
  });

  formGroup = new EditEntityFormGroup();
  formStatus: FormControlStatus = "VALID";
  readonly renderState = signal<EditEntityRenderState<TRecord>>({
    kind: "empty",
  });
  fields: EditEntityField<TRecord>[] = [];
  readonly actions = signal<EditEntityRuntimeAction<TRecord>[]>([]);
  isCreateEnabled = false;
  isUpdateEnabled = false;
  isRemoveEnabled = false;
  isArchiveEnabled = false;
  isRemovable?: EditEntityRemovableState;
  updated = false;
  valid = true;

  readonly changeDetectorRef = inject(ChangeDetectorRef);
  readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly host =
    inject(EDIT_ENTITY_DIALOG_HOST, { optional: true }) ??
    inject(DefaultEditEntityDialogHost);
  readonly errorHandler = inject(ErrorHandler);
  readonly logger = inject(EDIT_ENTITY_LOGGER);
  lastLoggedUpdates: Record<string, unknown> = {};
  readonly conditionalStateService = inject(
    EditEntityConditionalStateService,
  ) as unknown as EditEntityConditionalStateService<TRecord>;
  readonly formBuilderService = inject(
    EditEntityFormBuilderService,
  ) as unknown as EditEntityFormBuilderService<TRecord>;
  readonly renderService = inject(
    EditEntityRenderService,
  ) as unknown as EditEntityRenderService<TRecord>;
  readonly submitValueService = inject(
    EditEntitySubmitValueService,
  ) as unknown as EditEntitySubmitValueService<TRecord>;
  subsink = new SubSink();
  initializeVersion = 0;
  readonly loadCancelled = new Subject<void>();
  readonly cardBodyPrefix = `edit-entity-${nextEditEntityComponentId++}-card-`;
  readonly expandedCards = new Map<string, boolean>();
  focusTimer?: ReturnType<typeof setTimeout>;
  readonly cardActionEventSubjects = new Map<
    string,
    Subject<EditEntitySectionCardActionEvent<TRecord>>
  >();
  savedResult: EditEntityDialogResult<TRecord> = { updated: false };

  submitFromKeyboard(): boolean {
    if (!this.options?.validateOnEnter || this.loading || this.updating)
      return false;

    if (this.isCreateEnabled && this.valid) {
      void this.create();
      return true;
    }

    if (this.isUpdateEnabled && this.updated && this.valid) {
      void this.update();
      return true;
    }

    return false;
  }

  public refreshPresentation(): void {
    if (!this.formGroup) return;
    this.fields = this.renderService.collectFields(this.options.displayOptions);
    this.refreshRuntimeState();
  }

  destroy(): void {
    this.navigationController.destroy();
    this.destroyConnection();

    this.intlSub.unsubscribe();
    this.loadCancelled.next();
    this.loadCancelled.complete();
    clearTimeout(this.focusTimer);
    this.destroyCurrentForm();
    ++this.initializeVersion;
  }

  openJsonDataDialog(): void {
    const sources =
      this.options.record !== undefined && this.options.record !== null
        ? [
            { label: this.intl.messages.record, value: this.options.record },
            {
              label: this.intl.messages.formGroup,
              value: this.formGroup.getRawValue(),
            },
            {
              label: this.intl.messages.updatedValues,
              value: this.formGroup.updatedValue,
            },
          ]
        : [
            {
              label: this.intl.messages.formGroup,
              value: this.formGroup.getRawValue(),
            },
          ];

    this.host.showJson(this.resolveJsonDialogTitle(), sources);
  }

  async requestClose(): Promise<void> {
    if (this.updating) return;
    const isCurrent = this.captureCurrentOperation();
    if (!(await this.canClose()) || !isCurrent()) return;
    ++this.initializeVersion;
    this.closeRequest.emit(this.buildCloseResult());
  }

  async create(): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    if (
      this.updating ||
      !this.options?.service?.create ||
      this.options.record?._id
    )
      return;
    if (this.policy?.valid && !this.policy.valid()) return;

    this.updating = true;
    this.changeDetectorRef.markForCheck();

    try {
      const value = this.policy
        ? this.policy.value(true)
        : this.submitValueService.buildCreateValue(
            this.options,
            this.fields,
            this.formGroup,
          );
      const record = await this.options.service.create(
        value,
        this.formGroup,
        this.options,
      );
      if (!isCurrent() || !record) return;

      this.options.record = record;
      this.notifyConnection();
      this.setSavedResult({ updated: true, created: true, record });
      this.notify(this.intl.messages.created);

      if (this.options.service.closeOnUpsert) {
        this.closeRequest.emit(this.savedResult);
        return;
      }

      if (this.policy) await this.policy.saved(record, value);
      else await this.reloadFromRecord(record);
    } catch (error) {
      if (!isCurrent()) return;
      this.errorHandler.handleError(error);
      this.host.notify(
        this.options.errorLabel ?? this.intl.messages.mutationFailed,
      );
    } finally {
      if (isCurrent()) {
        this.updating = false;
        this.changeDetectorRef.markForCheck();
      }
    }
  }

  async update(): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    if (
      this.updating ||
      !this.options?.service?.update ||
      !this.options.record?._id
    )
      return;

    if (this.policy?.valid && !this.policy.valid()) return;
    this.updating = true;
    this.changeDetectorRef.markForCheck();

    try {
      const value = this.policy
        ? this.policy.value(false)
        : this.submitValueService.buildUpdateValue(this.fields, this.formGroup);
      const response = await this.options.service.update(
        this.options.record._id,
        value,
        this.formGroup,
        this.options,
      );
      if (!isCurrent() || !response) return;

      if (typeof response !== "boolean") {
        this.options.record = response;
        this.setSavedResult({ updated: true, record: response });
      } else {
        this.options.record = this.policy
          ? this.policy.patch(this.options.record, value)
          : this.syncRecordFromCurrentForm(this.options.record);
        this.setSavedResult({ updated: true, record: this.options.record });
      }

      this.notifyConnection();

      this.notify(this.intl.messages.updated);

      if (this.options.service.closeOnUpsert) {
        this.closeRequest.emit(this.savedResult);
        return;
      }

      if (this.policy) await this.policy.saved(this.options.record, value);
      else if (typeof response !== "boolean")
        await this.reloadFromRecord(response);
      else await this.markCurrentFormAsSaved();
    } catch (error) {
      if (!isCurrent()) return;
      this.errorHandler.handleError(error);
      this.host.notify(
        this.options.errorLabel ?? this.intl.messages.mutationFailed,
      );
    } finally {
      if (isCurrent()) {
        this.updating = false;
        this.changeDetectorRef.markForCheck();
      }
    }
  }

  async remove(): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    if (
      this.updating ||
      !this.options?.service?.remove ||
      !this.options.record?._id
    )
      return;
    if (
      !(await this.confirm({
        title: this.intl.messages.removalTitle,
        message: this.intl.messages.removalConfirm,
      }))
    )
      return;
    if (!isCurrent() || this.updating) return;

    this.updating = true;
    this.changeDetectorRef.markForCheck();

    try {
      const removed = await this.options.service.remove(
        this.options.record._id,
      );
      if (!isCurrent() || !removed) return;

      this.setSavedResult({
        updated: true,
        removed: true,
        record: this.options.record,
      });
      this.notify(this.intl.messages.removed);
      this.closeRequest.emit(this.savedResult);
    } catch (error) {
      if (!isCurrent()) return;
      this.errorHandler.handleError(error);
      this.host.notify(
        this.options.errorLabel ?? this.intl.messages.mutationFailed,
      );
    } finally {
      if (isCurrent()) {
        this.updating = false;
        this.changeDetectorRef.markForCheck();
      }
    }
  }

  async archive(): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    if (
      this.updating ||
      !this.options?.service?.archive ||
      !this.options.record?._id
    )
      return;
    if (
      !(await this.confirm({
        title: this.intl.messages.archive,
        message: this.intl.messages.archiveConfirm,
      }))
    )
      return;
    if (!isCurrent() || this.updating) return;

    this.updating = true;
    this.changeDetectorRef.markForCheck();

    try {
      const archived = await this.options.service.archive(
        this.options.record._id,
      );
      if (!isCurrent() || !archived) return;

      this.options.record.__archived = archived;
      this.notifyConnection();
      this.setSavedResult({
        updated: true,
        archived: true,
        record: this.options.record,
      });
      this.notify(
        archived.isArchived
          ? this.intl.messages.archived
          : this.intl.messages.unarchived,
      );
      this.refreshRuntimeState();

      if (this.options.service.closeOnUpsert)
        this.closeRequest.emit(this.savedResult);
    } catch (error) {
      if (!isCurrent()) return;
      this.errorHandler.handleError(error);
      this.host.notify(
        this.options.errorLabel ?? this.intl.messages.mutationFailed,
      );
    } finally {
      if (isCurrent()) {
        this.updating = false;
        this.changeDetectorRef.markForCheck();
      }
    }
  }

  async handleAction(action: EditEntityRuntimeAction<TRecord>): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    if (
      !this.isRuntimeButtonAction(action) ||
      action.isDisabled ||
      this.updating
    )
      return;
    if (
      !(await this.confirmAction(action.confirm)) ||
      !isCurrent() ||
      this.updating
    )
      return;

    this.updating = true;
    this.changeDetectorRef.markForCheck();

    try {
      const response = await action.handle({
        record: this.options.record,
        formGroup: this.formGroup,
        options: this.options,
        action,
      });
      if (!isCurrent()) return;
      await this.applyActionResult(response);
    } catch (error) {
      if (!isCurrent()) return;
      this.errorHandler.handleError(error);
      this.host.notify(
        this.options.errorLabel ?? this.intl.messages.mutationFailed,
      );
      return;
    } finally {
      if (isCurrent()) {
        this.updating = false;
        this.refreshRuntimeState();
        this.changeDetectorRef.markForCheck();
      }
    }

    if (isCurrent() && action.closeOnHandle)
      this.closeRequest.emit(this.buildCloseResult());
  }

  async handleCardAction(
    card: EditEntityRuntimeCard<TRecord>,
    action: EditEntityRuntimeCardAction<TRecord>,
    section: EditEntitySection<TRecord>,
  ): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    if (action.isDisabled || this.updating || action.runtimeMenuOptions) return;
    if (
      !(await this.confirmAction(action.confirm)) ||
      !isCurrent() ||
      this.updating
    )
      return;

    const context = this.buildCardActionContext(card, action, section);
    this.emitCardActionEvent(this.buildCardActionEvent(card, action, section));

    if (!action.handler) {
      if (action.closeOnHandle) this.closeRequest.emit(this.buildCloseResult());
      return;
    }

    this.updating = true;
    this.changeDetectorRef.markForCheck();

    try {
      const response = await action.handler(context);
      if (!isCurrent()) return;
      await this.applyActionResult(response);
    } catch (error) {
      if (!isCurrent()) return;
      this.errorHandler.handleError(error);
      this.host.notify(
        this.options.errorLabel ?? this.intl.messages.mutationFailed,
      );
      return;
    } finally {
      if (isCurrent()) {
        this.updating = false;
        this.refreshRuntimeState();
        this.changeDetectorRef.markForCheck();
      }
    }

    if (isCurrent() && action.closeOnHandle)
      this.closeRequest.emit(this.buildCloseResult());
  }

  async handleCardMenuOption(
    card: EditEntityRuntimeCard<TRecord>,
    action: EditEntityRuntimeCardAction<TRecord>,
    option: EditEntityRuntimeMenuOption<TRecord>,
    section: EditEntitySection<TRecord>,
  ): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    if (
      action.isDisabled ||
      option.isDisabled ||
      this.updating ||
      !action.runtimeMenuOptions
    )
      return;
    if (
      !(await this.confirmAction(action.confirm)) ||
      !isCurrent() ||
      this.updating
    )
      return;

    const context = this.buildCardActionContext(card, action, section, option);
    this.emitCardActionEvent(
      this.buildCardActionEvent(card, action, section, option),
    );

    if (!action.menuHandler) {
      if (action.closeOnHandle) this.closeRequest.emit(this.buildCloseResult());
      return;
    }

    this.updating = true;
    this.changeDetectorRef.markForCheck();

    try {
      const response = await action.menuHandler(option.id, context);
      if (!isCurrent()) return;
      await this.applyActionResult(response);
    } catch (error) {
      if (!isCurrent()) return;
      this.errorHandler.handleError(error);
      this.host.notify(
        this.options.errorLabel ?? this.intl.messages.mutationFailed,
      );
      return;
    } finally {
      if (isCurrent()) {
        this.updating = false;
        this.refreshRuntimeState();
        this.changeDetectorRef.markForCheck();
      }
    }

    if (isCurrent() && action.closeOnHandle)
      this.closeRequest.emit(this.buildCloseResult());
  }

  onShowEmptyFieldsChange(checked: boolean): void {
    this.showEmptyFields = checked;
    this.refreshRuntimeState();
  }

  isRuntimeButtonAction(
    action: EditEntityRuntimeAction<TRecord>,
  ): action is EditEntityRuntimeActionButton<TRecord> {
    return (
      typeof (action as EditEntityRuntimeActionButton<TRecord>).handle ===
      "function"
    );
  }

  isRuntimeComponentAction(
    action: EditEntityRuntimeAction<TRecord>,
  ): action is EditEntityRuntimeActionComponent<TRecord> {
    return !!(action as EditEntityRuntimeActionComponent<TRecord>).component;
  }

  getActions(
    position: "bottom" | "bottom-end" | "top",
  ): EditEntityRuntimeAction<TRecord>[] {
    return this.actions().filter(
      (action) =>
        (action.position ?? "bottom") === position && action.isVisible,
    );
  }

  trackRuntimeAction(
    index: number,
    action: EditEntityRuntimeAction<TRecord>,
  ): string | number {
    if (this.isRuntimeButtonAction(action))
      return action.label || action.icon || index;
    return (action.component as { name?: string } | undefined)?.name || index;
  }

  /** Server work may finish after replacement; only its current UI generation may resume. */
  captureCurrentOperation(): () => boolean {
    const version = this.initializeVersion;
    const options = this.options;
    const formGroup = this.formGroup;
    return () =>
      version === this.initializeVersion &&
      options === this.options &&
      formGroup === this.formGroup;
  }

  async initialize(): Promise<void> {
    const version = ++this.initializeVersion;
    this.navigationController.bind(this.options?.navigation, () =>
      this.changeDetectorRef.markForCheck(),
    );
    this.expandedCards.clear();
    this.loadCancelled.next();
    clearTimeout(this.focusTimer);
    this.destroyConnection();

    this.destroyCurrentForm();
    this.conditionalStateService.reset();
    this.savedResult = { updated: false };
    this.policy?.reset?.();

    this.updating = false;
    this.isRemovable = undefined;
    try {
      this.connection = this.options?.connect?.();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
    this.loading = true;
    this.errorLabel = "";
    this.renderState.set({ kind: "empty" });
    this.changeDetectorRef.markForCheck();

    if (!this.options) {
      this.finishWithError(this.intl.messages.noData);
      return;
    }

    this.loadingLabel = this.options.loadingLabel ?? this.intl.messages.loading;
    this.closeLabel = this.options.closeLabel ?? this.intl.messages.close;
    this.cancelLabel = this.options.cancelLabel ?? this.intl.messages.cancel;
    this.createLabel = this.options.createLabel ?? this.intl.messages.create;
    this.updateLabel = this.options.updateLabel ?? this.intl.messages.update;
    this.syncEmptyFieldsOptions();

    try {
      await this.resolveRecord(version);
      if (version !== this.initializeVersion) return;
      this.fields = this.renderService.collectFields(
        this.options.displayOptions,
      );
      this.formGroup = this.formBuilderService.buildFormGroup(
        this.options,
        this.fields,
        this.subsink,
        () => this.refreshRuntimeState(),
      );
      const isCurrent = this.captureCurrentOperation();
      this.renderService.markUpdated = () => {
        if (isCurrent()) this.markComponentUpdated();
      };
      this.options.ready?.(this.formGroup, this.options);

      this.notifyConnection();
      this.bindFormState();
      this.bindConditionalDisplayStates();
      this.refreshRuntimeState();
      this.refreshAllowedActions();
      await this.refreshRemovableState();
      if (version !== this.initializeVersion) return;

      this.loading = false;
      this.focusOnField();
    } catch {
      if (version !== this.initializeVersion) return;
      this.finishWithError(
        this.options.errorLabel ?? this.intl.messages.loadFailed,
      );
    }

    this.changeDetectorRef.markForCheck();
  }

  syncEmptyFieldsOptions(): void {
    const displayOptions = this.options.displayOptions;
    const sectionOptions =
      "tabs" in displayOptions ? undefined : displayOptions;
    this.showEmptyFields =
      (sectionOptions && "showEmptyFields" in sectionOptions
        ? sectionOptions.showEmptyFields
        : undefined) ?? true;
    this.showEmptyFieldsToggle =
      (sectionOptions && "showEmptyFieldsToggle" in sectionOptions
        ? sectionOptions.showEmptyFieldsToggle
        : undefined) ?? false;
    this.showEmptyFieldsLabel =
      (sectionOptions && "showEmptyFieldsLabel" in sectionOptions
        ? sectionOptions.showEmptyFieldsLabel
        : undefined) ?? this.intl.messages.showEmptyFields;
  }

  async resolveRecord(version: number): Promise<void> {
    const options = this.options;
    const loader = options.loadRecord ?? options.service?.loadRecord;
    if (!loader) return;

    const loadedRecord = loader();
    const record = isObservable(loadedRecord)
      ? await firstValueFrom(loadedRecord.pipe(takeUntil(this.loadCancelled)))
      : await loadedRecord;
    if (version === this.initializeVersion && options === this.options)
      options.record = record ?? undefined;
  }

  resolveJsonDialogTitle(): string {
    const title = (this.elementRef.nativeElement as HTMLElement)
      .querySelector<HTMLElement>(".edit-entity-title-content h2")
      ?.textContent?.trim();
    return title || this.intl.messages.jsonTitle;
  }

  destroyCurrentForm(): void {
    this.subsink.unsubscribe();
    this.subsink = new SubSink();
    this.formGroup.destroy();
    this.completeCardActionEventSubjects();
    this.formGroup = new EditEntityFormGroup();
    this.lastLoggedUpdates = {};
    this.actions.set([]);
    this.fields = [];
  }

  bindFormState(): void {
    if (this.policy)
      this.subsink.add(
        this.formGroup.statusChanges.subscribe(() => {
          this.policy?.refresh?.();
        }),
        this.formGroup.valueChanges.subscribe(() => {
          this.policy?.refresh?.();
        }),
      );
    this.formStatus = this.formGroup.status;
    this.valid = this.formGroup.valid;
    this.updated = this.formGroup.isUpdated;
    this.logDetectedChanges();

    this.subsink.add(
      this.formGroup.statusChanges
        .pipe(debounceTime(100))
        .subscribe((status) => {
          this.formStatus = status;
          this.valid = status === "VALID";
          this.refreshRuntimeState();
          this.changeDetectorRef.markForCheck();
        }),
    );

    this.subsink.add(
      this.formGroup.valueChanges.pipe(debounceTime(100)).subscribe(() => {
        this.updated = this.formGroup.isUpdated;
        this.logDetectedChanges();
        this.refreshActionStates();
        this.refreshRuntimeState();
        this.refreshTitles();
        this.changeDetectorRef.markForCheck();
      }),
    );
  }

  logDetectedChanges(): void {
    const updates = this.formGroup.isUpdated ? this.formGroup.updatedValue : {};
    if (isEqual(updates, this.lastLoggedUpdates)) return;
    this.lastLoggedUpdates = cloneDeep(updates);
    if (this.formGroup.isUpdated) {
      this.logger.debug(
        "[EditEntityDialog] Detected changes",
        cloneDeep(updates),
      );
    }
  }

  bindConditionalDisplayStates(): void {
    this.watchDisplayOptionsConditionalStates(this.options.displayOptions);
    this.watchActionsConditionalStates();
  }

  watchDisplayOptionsConditionalStates(
    displayOptions: EditEntityDisplayOptions<TRecord>,
  ): void {
    if ("tabs" in displayOptions) {
      displayOptions.tabs.forEach((tab) => {
        this.conditionalStateService.watch(tab.visible, this.subsink, () =>
          this.refreshRuntimeState(),
        );
        this.watchDisplayOptionsConditionalStates(tab.displayOptions);
      });
      return;
    }

    const sections =
      "section" in displayOptions
        ? [displayOptions.section]
        : "sections" in displayOptions
          ? displayOptions.sections
          : [];
    sections.forEach((section) => {
      this.conditionalStateService.watch(section.visible, this.subsink, () =>
        this.refreshRuntimeState(),
      );
      section.cards?.forEach((card) => {
        this.conditionalStateService.watch(card.visible, this.subsink, () =>
          this.refreshRuntimeState(),
        );
        card.actions?.forEach((action) => {
          this.conditionalStateService.watch(action.visible, this.subsink, () =>
            this.refreshRuntimeState(),
          );
          this.conditionalStateService.watch(
            action.disabled,
            this.subsink,
            () => this.refreshRuntimeState(),
          );
          action.menuOptions?.forEach((option) => {
            this.conditionalStateService.watch(
              option.visible,
              this.subsink,
              () => this.refreshRuntimeState(),
            );
            this.conditionalStateService.watch(
              option.disabled,
              this.subsink,
              () => this.refreshRuntimeState(),
            );
          });
        });
      });
    });
  }

  watchActionsConditionalStates(): void {
    this.allActions().forEach((action) => {
      if (!this.isActionButton(action)) return;
      this.conditionalStateService.watch(action.visible, this.subsink, () =>
        this.refreshActionStates(),
      );
      this.conditionalStateService.watch(action.disabled, this.subsink, () =>
        this.refreshActionStates(),
      );
    });
  }

  refreshRuntimeState(): void {
    if (!this.options || !this.formGroup) return;
    this.formBuilderService.applyControlStates(
      this.fields,
      this.formGroup,
      this.options,
    );
    this.renderState.set(
      this.filterRenderStateComponentInputs(
        this.renderService.buildRenderState(
          this.options,
          this.formGroup,
          this.showEmptyFields,
        ),
      ),
    );
    this.policy?.refresh?.();

    const state = this.renderState();
    if (state.kind === "tabs") {
      this.navigationController.setTabs(
        (state.tabs ?? []).filter((tab) => tab.isVisible).map((tab) => tab.id),
        "tabs" in this.options.displayOptions
          ? (this.options.displayOptions.tabIndex ?? 0)
          : 0,
      );
    }
    if (state.kind !== "tabs") this.navigationController.setTabs([]);
    this.renderState.set(this.attachNavigation(state));
    this.refreshTitles();
    this.refreshActionStates();
  }

  attachNavigation(
    state: EditEntityRenderState<TRecord>,
    tab?: string,
  ): EditEntityRenderState<TRecord> {
    if (!this.options.navigation) return state;
    if (state.kind === "tabs")
      return {
        ...state,
        tabs: state.tabs?.map((item) => ({
          ...item,
          renderState: this.attachNavigation(item.renderState, item.id),
        })),
      };
    const navigation = this.navigationController.child(tab);
    return {
      ...state,
      navigation,
      ...(state.kind === "component"
        ? {
            componentInputs: this.renderService.filterDeclaredComponentInputs(
              state.component,
              {
                navigation,
                ...state.componentInputs,
              },
            ),
          }
        : {}),
    };
  }

  refreshTitles(): void {
    const context = {
      record: this.options.record,
      formGroup: this.formGroup,
      value: this.formGroup.getRawValue(),
      updated: this.formGroup.isUpdated,
    };
    this.title = this.resolveTitle(this.options.title, context);
    this.subtitle = this.resolveTitle(this.options.subtitle, context);
  }

  refreshActionStates(): void {
    this.actions.set(
      this.allActions().map((action) => {
        if (this.isActionButton(action)) {
          return {
            ...action,
            isVisible: this.resolveActionVisibility(action),
            isDisabled: this.conditionalStateService.resolve(
              action.disabled,
              this.options.record,
              this.formGroup,
              false,
            ),
          };
        }

        const inputs =
          typeof action.input === "function"
            ? action.input(this.options)
            : action.input;
        return {
          ...action,
          isVisible: true,
          isDisabled: false,
          componentInputs: this.renderService.filterDeclaredComponentInputs(
            action.component,
            inputs,
          ),
        };
      }),
    );
  }

  filterRenderStateComponentInputs(
    renderState: EditEntityRenderState<TRecord>,
    path = "root",
  ): EditEntityRenderState<TRecord> {
    const state = renderState;

    if (state.kind === "tabs") {
      return {
        ...state,
        tabs: (state.tabs ?? []).map((tab, index: number) => ({
          ...tab,
          renderState: this.filterRenderStateComponentInputs(
            tab.renderState,
            `${path}/tab:${index}:${tab.label ?? ""}`,
          ),
        })),
      };
    }

    if (state.kind === "component") {
      return {
        ...state,
        componentInputs: this.renderService.filterDeclaredComponentInputs(
          state.component,
          state.componentInputs,
        ),
      };
    }

    if (state.kind === "section" || state.kind === "sections") {
      return {
        ...state,
        sections: (state.sections ?? []).map((section) => {
          const sectionPath = `${path}/section:${section.id ?? ""}`;
          return {
            ...section,
            items: this.filterRuntimeCardComponentInputs(
              section.items,
              sectionPath,
            ),
          };
        }),
      };
    }

    return renderState;
  }

  toggleCard(card: EditEntityRuntimeCard<TRecord>): void {
    if (!card.source.expandable || !card.cardActionEventsKey) return;
    this.expandedCards.set(card.cardActionEventsKey, !card.expanded);
    this.refreshRuntimeState();
  }

  filterRuntimeCardComponentInputs(
    items: EditEntityRuntimeCardItem<TRecord>[] | undefined,
    path: string,
  ): EditEntityRuntimeCardItem<TRecord>[] {
    return (items ?? []).map((item) => {
      if (item.type === "break") return item;

      const cardActionEventsKey = `${path}/card:${item.id ?? ""}`;
      const cardState = {
        cardActionEventsKey,
        bodyId: `${this.cardBodyPrefix}${encodeURIComponent(cardActionEventsKey)}`,
        expanded:
          !item.source.expandable ||
          (this.expandedCards.get(cardActionEventsKey) ??
            item.source.initiallyExpanded !== false),
      };
      if (item.kind !== "component") return { ...item, ...cardState };
      const componentInputs = {
        ...(item.componentInputs ?? {}),
        cardActionEvents$: this.getCardActionEvents$(cardActionEventsKey),
      };

      return {
        ...item,
        ...cardState,
        componentInputs: this.renderService.filterDeclaredComponentInputs(
          item.component,
          componentInputs,
        ),
      };
    });
  }

  refreshAllowedActions(): void {
    this.isCreateEnabled =
      !this.options.record?._id &&
      typeof this.options.service?.create === "function";
    this.isUpdateEnabled =
      !!this.options.record?._id &&
      typeof this.options.service?.update === "function";
    this.isRemoveEnabled =
      !!this.options.record?._id &&
      typeof this.options.service?.remove === "function";
    this.isArchiveEnabled =
      !!this.options.record?._id &&
      typeof this.options.service?.archive === "function";
  }

  async refreshRemovableState(): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    this.isRemovable = undefined;
    const record = this.options.record;
    const removable = this.options.service?.isRemovable;
    if (!record || removable === undefined) return;

    if (typeof removable === "boolean") {
      this.isRemovable = { removable };
      return;
    }

    const value =
      typeof removable === "function"
        ? await removable(record, this.formGroup.getRawValue())
        : await removable;
    if (!isCurrent()) return;
    this.isRemovable =
      typeof value === "boolean" ? { removable: value } : value;
  }

  resolveActionVisibility(action: EditEntityActionButton<TRecord>): boolean {
    if (action.visibility === "create" && this.options.record?._id)
      return false;
    if (action.visibility === "update" && !this.options.record?._id)
      return false;
    return this.conditionalStateService.resolve(
      action.visible,
      this.options.record,
      this.formGroup,
      true,
    );
  }

  async canClose(): Promise<boolean> {
    if (this.options.confirmOnWipClose === false) return true;
    this.policy?.beforeClose?.();
    if (!this.formGroup.isUpdated) return true;

    return this.confirm({
      title: this.intl.messages.discardTitle,
      message: this.intl.messages.discardConfirm,
      ok: this.intl.messages.yes,
      cancel: this.intl.messages.stay,
    });
  }

  async confirmAction(
    confirmOptions: string | EditEntityConfirmOptions | undefined,
  ): Promise<boolean> {
    if (!confirmOptions) return true;
    if (typeof confirmOptions === "string")
      return this.confirm({ message: confirmOptions });
    return this.confirm(confirmOptions);
  }

  async confirm(confirmOptions: EditEntityConfirmOptions): Promise<boolean> {
    const confirmed = await this.host.confirm({
      title: confirmOptions.title ?? this.intl.messages.confirmation,
      message: confirmOptions.message,
      ok: confirmOptions.ok ?? this.intl.messages.yes,
      cancel: confirmOptions.cancel ?? this.intl.messages.no,
    });
    return confirmed === true;
  }

  buildCardActionContext(
    card: EditEntityRuntimeCard<TRecord>,
    action: EditEntityRuntimeCardAction<TRecord>,
    section: EditEntitySection<TRecord>,
    option?: EditEntityCardMenuOption<TRecord>,
  ): EditEntityCardActionContext<TRecord> {
    return {
      record: this.options.record,
      formGroup: this.formGroup,
      options: this.options,
      section,
      card: card.source,
      action: action as EditEntityCardAction<TRecord>,
      option,
    };
  }

  buildCardActionEvent(
    card: EditEntityRuntimeCard<TRecord>,
    action: EditEntityRuntimeCardAction<TRecord>,
    section: EditEntitySection<TRecord>,
    option?: EditEntityRuntimeMenuOption<TRecord>,
  ): EditEntitySectionCardActionEvent<TRecord> {
    return {
      ...this.buildCardActionContext(card, action, section, option),
      optionId: option?.id,
      runtimeCard: card,
      runtimeAction: action,
      runtimeOption: option,
    };
  }

  emitCardActionEvent(event: EditEntitySectionCardActionEvent<TRecord>): void {
    const cardActionEventsKey = event.runtimeCard.cardActionEventsKey;
    if (!cardActionEventsKey) return;

    this.cardActionEventSubjects.get(cardActionEventsKey)?.next(event);
  }

  getCardActionEvents$(
    key: string,
  ): Observable<EditEntitySectionCardActionEvent<TRecord>> {
    let subject = this.cardActionEventSubjects.get(key);

    if (!subject) {
      subject = new Subject<EditEntitySectionCardActionEvent<TRecord>>();
      this.cardActionEventSubjects.set(key, subject);
    }

    return subject.asObservable();
  }

  completeCardActionEventSubjects(): void {
    this.cardActionEventSubjects.forEach((subject) => subject.complete());
    this.cardActionEventSubjects.clear();
  }

  async applyActionResult(
    response: EditEntityActionResult<TRecord>,
  ): Promise<void> {
    if (!response) return;

    if (typeof response === "boolean") {
      if (response)
        this.setSavedResult({ updated: true, record: this.options.record });
      return;
    }

    if (this.isDialogResult(response)) {
      this.setSavedResult(response);
      if (response.record) {
        this.options.record = response.record;
        this.notifyConnection();
        if (this.policy) {
          this.policy.hydrate(response.record);
          this.refreshRuntimeState();
        }
      }
      return;
    }

    if (this.isRecord(response)) {
      this.options.record = response;
      this.notifyConnection();
      this.setSavedResult({ updated: true, record: response });
      if (this.policy) {
        this.policy.hydrate(response);
        this.refreshRuntimeState();
      } else await this.reloadFromRecord(response);
    }
  }

  async reloadFromRecord(record: TRecord | undefined): Promise<void> {
    if (!record) return;
    this.options.record = record;
    this.formGroup.reset(this.buildRecordFormValue(record), {
      emitEvent: false,
    });
    await this.markCurrentFormAsSaved();
  }

  allActions(): readonly EditEntityAction<TRecord>[] {
    return [
      ...(this.options.actions ?? []),
      ...(this.connection?.actions ?? []),
    ];
  }
  notifyConnection(): void {
    try {
      this.connection?.recordChanged?.(this.options.record);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
  destroyConnection(): void {
    const connection = this.connection;
    this.connection = undefined;
    try {
      connection?.destroy?.();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
  refreshLabels(): void {
    if (!this.options) return;
    this.loadingLabel = this.options.loadingLabel ?? this.intl.messages.loading;
    this.closeLabel = this.options.closeLabel ?? this.intl.messages.close;
    this.cancelLabel = this.options.cancelLabel ?? this.intl.messages.cancel;
    this.createLabel = this.options.createLabel ?? this.intl.messages.create;
    this.updateLabel = this.options.updateLabel ?? this.intl.messages.update;
    this.syncEmptyFieldsOptions();
  }
  async markCurrentFormAsSaved(): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
    this.formGroup.updateValueAndValidity();
    this.formGroup.resetInitialValue();
    this.updated = false;
    this.valid = this.formGroup.valid;
    this.refreshAllowedActions();
    await this.refreshRemovableState();
    if (!isCurrent()) return;
    this.refreshRuntimeState();
  }

  syncRecordFromCurrentForm(record: TRecord): TRecord {
    const rawValue = this.formGroup.getRawValue();

    Object.keys(rawValue).forEach((key) =>
      this.setRecordValue(record, key, rawValue[key]),
    );

    return record;
  }

  setRecordValue(
    record: Record<string, unknown>,
    path: string,
    value: unknown,
  ): void {
    if (!path) return;

    const pathParts = path.split(".");
    const property = pathParts.pop();
    if (!property) return;

    let current: Record<string, unknown> = record;

    pathParts.forEach((pathPart) => {
      const currentValue = current[pathPart];
      if (!currentValue || typeof currentValue !== "object")
        current[pathPart] = {};
      current = current[pathPart] as Record<string, unknown>;
    });

    current[property] = value;
  }

  buildRecordFormValue(record: TRecord): Record<string, unknown> {
    const value = this.formGroup.getRawValue();

    Object.keys(this.formGroup.controls).forEach((controlName) => {
      const recordValue = getValue(record, controlName);
      if (recordValue !== undefined)
        this.setFormValue(value, controlName, recordValue);
    });

    return this.fields.reduce(
      (currentValue, field): Record<string, unknown> => {
        if (field.kind === "separator") return currentValue;

        const fieldName = field.name;
        this.setFormValue(
          currentValue,
          fieldName,
          field.kind === "metadata" && getValue(record, fieldName) === undefined
            ? field.defaultValue
            : getValue(record, fieldName),
        );
        return currentValue;
      },
      value,
    );
  }

  setFormValue(
    formValue: Record<string, unknown>,
    path: string,
    value: unknown,
  ): void {
    if (Object.prototype.hasOwnProperty.call(this.formGroup.controls, path)) {
      formValue[path] = value;
      return;
    }

    this.setRecordValue(formValue, path, value);
  }

  setSavedResult(result: EditEntityDialogResult<TRecord>): void {
    this.savedResult = this.policy?.stickyResult
      ? {
          ...this.savedResult,
          ...result,
          updated: this.savedResult.updated || result.updated,
          created: this.savedResult.created || result.created,
        }
      : result;
    this.result.emit(this.savedResult);
  }

  buildCloseResult(): EditEntityDialogResult<TRecord> {
    return this.savedResult.updated
      ? this.savedResult
      : { updated: false, record: this.options.record };
  }

  isActionButton(
    action: EditEntityAction<TRecord>,
  ): action is EditEntityActionButton<TRecord> {
    return "handle" in action && typeof action.handle === "function";
  }

  isDialogResult(
    response: unknown,
  ): response is EditEntityDialogResult<TRecord> {
    return (
      !!response &&
      typeof response === "object" &&
      Object.prototype.hasOwnProperty.call(response, "updated")
    );
  }

  isRecord(response: unknown): response is TRecord {
    return (
      !!response &&
      typeof response === "object" &&
      Object.prototype.hasOwnProperty.call(response, "_id")
    );
  }

  notify(message: string): void {
    if (this.options.service?.disableNotifications) return;
    this.host.notify(message);
  }

  resolveTitle(
    value: EditEntityTitle<TRecord> | undefined,
    context: EditEntityTitleContext<TRecord>,
  ): string {
    if (!value) return "";
    return typeof value === "function" ? value(context) : value;
  }

  finishWithError(label: string): void {
    this.loading = false;
    this.errorLabel = label;
    this.changeDetectorRef.markForCheck();
  }

  focusOnField(attempt = 0): void {
    if (!this.options.focusOn) return;
    if (this.tryFocusField(this.options.focusOn)) return;
    if (attempt >= 20) return;
    this.focusTimer = setTimeout(() => this.focusOnField(attempt + 1), 100);
  }

  tryFocusField(fieldName: string): boolean {
    const escapedName = fieldName.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const fieldElement = this.elementRef.nativeElement.querySelector(
      `[data-edit-field-name="${escapedName}"]`,
    ) as HTMLElement | null;
    if (!fieldElement) return false;

    const focusableElement = this.findFocusableElement(fieldElement);
    if (!focusableElement) return false;

    const cardBody = fieldElement.closest<HTMLElement>("[data-edit-card-key]");
    if (cardBody?.hidden) {
      const key = cardBody.dataset["editCardKey"];
      if (key) this.expandedCards.set(key, true);
      this.refreshRuntimeState();
      cardBody.hidden = false;
      this.changeDetectorRef.markForCheck();
    }
    focusableElement.focus();
    return true;
  }

  findFocusableElement(fieldElement: HTMLElement): HTMLElement | null {
    const selectors = [
      'input:not([type="hidden"]):not([disabled])',
      "textarea:not([disabled])",
      ".mat-mdc-select-trigger",
      "mat-radio-button input:not([disabled])",
      "mat-checkbox input:not([disabled])",
      '[role="combobox"]',
      '[tabindex]:not([tabindex="-1"])',
    ];

    for (const selector of selectors) {
      const element = fieldElement.querySelector(
        selector,
      ) as HTMLElement | null;
      if (element) return element;
    }

    return null;
  }
}

function getValue(record: unknown, path: string): unknown {
  if (!path) return record;

  return path
    .split(".")
    .reduce((current: unknown, pathPart: string): unknown => {
      if (current === null || current === undefined) return undefined;
      return (current as Record<string, unknown>)[pathPart];
    }, record);
}
