/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal,
} from "@angular/core";
import { FormControlStatus } from "@angular/forms";
import {
  firstValueFrom,
  isObservable,
  Observable,
  Subject,
  takeUntil,
} from "rxjs";
import { debounceTime } from "rxjs/operators";
import { SubSink } from "subsink";
import { ErrorHandler } from "@angular/core";
import { EDIT_ENTITY_DIALOG_HOST } from "../../edit-entity-dialog-host";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { DefaultEditEntityDialogHost } from "../../internal/default-edit-entity-dialog-host";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import {
  EditEntityActionButton,
  EditEntityActionResult,
  EditEntityCardActionContext,
  EditEntityCardMenuOption,
  EditEntityComponentOptions,
  EditEntityConfirmOptions,
  EditEntityDialogResult,
  EditEntityField,
  EditEntityRecord,
  EditEntityRemovableState,
  EditEntityRenderState,
  EditEntityRuntimeAction,
  EditEntityRuntimeActionButton,
  EditEntityRuntimeActionComponent,
  EditEntityRuntimeCard,
  EditEntityRuntimeCardAction,
  EditEntityRuntimeMenuOption,
  EditEntitySection,
  EditEntitySectionCardActionEvent,
  EditEntityTitle,
  EditEntityTitleContext,
  EditEntityAction,
  EditEntityDisplayOptions,
  EditEntityRuntimeCardItem,
  EditEntityCardAction,
  EditEntityDialogConnection,
} from "../../edit-entity-dialog.types";
import { EditEntityConditionalStateService } from "../../services/edit-entity-conditional-state.service";
import { EditEntityFormBuilderService } from "../../services/edit-entity-form-builder.service";
import { EditEntityRenderService } from "../../services/edit-entity-render.service";
import { EditEntitySubmitValueService } from "../../services/edit-entity-submit-value.service";

@Component({
  selector: "app-edit-entity-component",
  templateUrl: "./edit-entity-component.component.html",
  styleUrls: ["./edit-entity-component.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    EditEntityConditionalStateService,
    EditEntityFormBuilderService,
    EditEntityRenderService,
    EditEntitySubmitValueService,
  ],
  standalone: false,
})
export class EditEntityComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnInit, OnChanges, OnDestroy
{
  @Input({ required: true }) options!: EditEntityComponentOptions<TRecord>;
  @Input() displayMode: "page" | "dialog" = "page";

  @Output() readonly result = new EventEmitter<
    EditEntityDialogResult<TRecord>
  >();
  @Output() readonly closeRequest = new EventEmitter<
    EditEntityDialogResult<TRecord>
  >();

  loading = true;
  updating = false;
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
  private connection?: EditEntityDialogConnection<TRecord>;
  private readonly intlSub = this.intl.changes.subscribe(() => {
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

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly host =
    inject(EDIT_ENTITY_DIALOG_HOST, { optional: true }) ??
    inject(DefaultEditEntityDialogHost);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly conditionalStateService = inject(
    EditEntityConditionalStateService,
  ) as unknown as EditEntityConditionalStateService<TRecord>;
  private readonly formBuilderService = inject(
    EditEntityFormBuilderService,
  ) as unknown as EditEntityFormBuilderService<TRecord>;
  private readonly renderService = inject(
    EditEntityRenderService,
  ) as unknown as EditEntityRenderService<TRecord>;
  private readonly submitValueService = inject(
    EditEntitySubmitValueService,
  ) as unknown as EditEntitySubmitValueService<TRecord>;
  private subsink = new SubSink();
  private initializeVersion = 0;
  private readonly loadCancelled = new Subject<void>();
  private focusTimer?: ReturnType<typeof setTimeout>;
  private readonly cardActionEventSubjects = new Map<
    string,
    Subject<EditEntitySectionCardActionEvent<TRecord>>
  >();
  private savedResult: EditEntityDialogResult<TRecord> = { updated: false };

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

  ngOnInit(): void {
    void this.initialize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["options"] && !changes["options"].firstChange)
      void this.initialize();
  }

  public refreshPresentation(): void {
    if (!this.formGroup) return;
    this.fields = this.renderService.collectFields(this.options.displayOptions);
    this.refreshRuntimeState();
  }

  ngOnDestroy(): void {
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
    const isCurrent = this.captureCurrentOperation();
    if (!(await this.canClose()) || !isCurrent()) return;
    this.closeRequest.emit(this.buildCloseResult());
  }

  async create(): Promise<void> {
    const isCurrent = this.captureCurrentOperation();
    if (this.updating || !this.options?.service?.create) return;

    this.updating = true;
    this.changeDetectorRef.markForCheck();

    try {
      const value = this.submitValueService.buildCreateValue(
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

      await this.reloadFromRecord(record);
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

    this.updating = true;
    this.changeDetectorRef.markForCheck();

    try {
      const value = this.submitValueService.buildUpdateValue(
        this.fields,
        this.formGroup,
      );
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
        this.options.record = this.syncRecordFromCurrentForm(
          this.options.record,
        );
        this.setSavedResult({ updated: true, record: this.options.record });
      }

      this.notifyConnection();

      this.notify(this.intl.messages.updated);

      if (this.options.service.closeOnUpsert) {
        this.closeRequest.emit(this.savedResult);
        return;
      }

      if (typeof response !== "boolean") await this.reloadFromRecord(response);
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
  private captureCurrentOperation(): () => boolean {
    const version = this.initializeVersion;
    const options = this.options;
    const formGroup = this.formGroup;
    return () =>
      version === this.initializeVersion &&
      options === this.options &&
      formGroup === this.formGroup;
  }

  private async initialize(): Promise<void> {
    const version = ++this.initializeVersion;
    this.loadCancelled.next();
    clearTimeout(this.focusTimer);
    this.destroyConnection();

    this.destroyCurrentForm();
    this.conditionalStateService.reset();
    this.savedResult = { updated: false };
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

  private syncEmptyFieldsOptions(): void {
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

  private async resolveRecord(version: number): Promise<void> {
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

  private resolveJsonDialogTitle(): string {
    const title = (this.elementRef.nativeElement as HTMLElement)
      .querySelector<HTMLElement>(".edit-entity-title-content h2")
      ?.textContent?.trim();
    return title || this.intl.messages.jsonTitle;
  }

  private destroyCurrentForm(): void {
    this.subsink.unsubscribe();
    this.subsink = new SubSink();
    this.formGroup.destroy();
    this.completeCardActionEventSubjects();
    this.formGroup = new EditEntityFormGroup();
    this.actions.set([]);
    this.fields = [];
  }

  private bindFormState(): void {
    this.formStatus = this.formGroup.status;
    this.valid = this.formGroup.valid;
    this.updated = this.formGroup.isUpdated;

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
        this.refreshActionStates();
        this.refreshRuntimeState();
        this.refreshTitles();
        this.changeDetectorRef.markForCheck();
      }),
    );
  }

  private bindConditionalDisplayStates(): void {
    this.watchDisplayOptionsConditionalStates(this.options.displayOptions);
    this.watchActionsConditionalStates();
  }

  private watchDisplayOptionsConditionalStates(
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

  private watchActionsConditionalStates(): void {
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

  private refreshRuntimeState(): void {
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
    this.refreshTitles();
    this.refreshActionStates();
  }

  private refreshTitles(): void {
    const context = {
      record: this.options.record,
      formGroup: this.formGroup,
      value: this.formGroup.getRawValue(),
      updated: this.formGroup.isUpdated,
    };
    this.title = this.resolveTitle(this.options.title, context);
    this.subtitle = this.resolveTitle(this.options.subtitle, context);
  }

  private refreshActionStates(): void {
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

  private filterRenderStateComponentInputs(
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

  private filterRuntimeCardComponentInputs(
    items: EditEntityRuntimeCardItem<TRecord>[] | undefined,
    path: string,
  ): EditEntityRuntimeCardItem<TRecord>[] {
    return (items ?? []).map((item) => {
      if (item.type === "break" || item.kind !== "component") return item;

      const cardActionEventsKey = `${path}/card:${item.id ?? ""}`;
      const componentInputs = {
        ...(item.componentInputs ?? {}),
        cardActionEvents$: this.getCardActionEvents$(cardActionEventsKey),
      };

      return {
        ...item,
        cardActionEventsKey,
        componentInputs: this.renderService.filterDeclaredComponentInputs(
          item.component,
          componentInputs,
        ),
      };
    });
  }

  private refreshAllowedActions(): void {
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

  private async refreshRemovableState(): Promise<void> {
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

  private resolveActionVisibility(
    action: EditEntityActionButton<TRecord>,
  ): boolean {
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

  private async canClose(): Promise<boolean> {
    if (this.options.confirmOnWipClose === false) return true;
    if (!this.formGroup.isUpdated) return true;

    return this.confirm({
      title: this.intl.messages.discardTitle,
      message: this.intl.messages.discardConfirm,
      ok: this.intl.messages.yes,
      cancel: this.intl.messages.stay,
    });
  }

  private async confirmAction(
    confirmOptions: string | EditEntityConfirmOptions | undefined,
  ): Promise<boolean> {
    if (!confirmOptions) return true;
    if (typeof confirmOptions === "string")
      return this.confirm({ message: confirmOptions });
    return this.confirm(confirmOptions);
  }

  private async confirm(
    confirmOptions: EditEntityConfirmOptions,
  ): Promise<boolean> {
    const confirmed = await this.host.confirm({
      title: confirmOptions.title ?? this.intl.messages.confirmation,
      message: confirmOptions.message,
      ok: confirmOptions.ok ?? this.intl.messages.yes,
      cancel: confirmOptions.cancel ?? this.intl.messages.no,
    });
    return confirmed === true;
  }

  private buildCardActionContext(
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

  private buildCardActionEvent(
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

  private emitCardActionEvent(
    event: EditEntitySectionCardActionEvent<TRecord>,
  ): void {
    const cardActionEventsKey = event.runtimeCard.cardActionEventsKey;
    if (!cardActionEventsKey) return;

    this.cardActionEventSubjects.get(cardActionEventsKey)?.next(event);
  }

  private getCardActionEvents$(
    key: string,
  ): Observable<EditEntitySectionCardActionEvent<TRecord>> {
    let subject = this.cardActionEventSubjects.get(key);

    if (!subject) {
      subject = new Subject<EditEntitySectionCardActionEvent<TRecord>>();
      this.cardActionEventSubjects.set(key, subject);
    }

    return subject.asObservable();
  }

  private completeCardActionEventSubjects(): void {
    this.cardActionEventSubjects.forEach((subject) => subject.complete());
    this.cardActionEventSubjects.clear();
  }

  private async applyActionResult(
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
      }
      return;
    }

    if (this.isRecord(response)) {
      this.options.record = response;
      this.notifyConnection();
      this.setSavedResult({ updated: true, record: response });
      await this.reloadFromRecord(response);
    }
  }

  private async reloadFromRecord(record: TRecord | undefined): Promise<void> {
    if (!record) return;
    this.options.record = record;
    this.formGroup.reset(this.buildRecordFormValue(record), {
      emitEvent: false,
    });
    await this.markCurrentFormAsSaved();
  }

  private allActions(): readonly EditEntityAction<TRecord>[] {
    return [
      ...(this.options.actions ?? []),
      ...(this.connection?.actions ?? []),
    ];
  }
  private notifyConnection(): void {
    try {
      this.connection?.recordChanged?.(this.options.record);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
  private destroyConnection(): void {
    const connection = this.connection;
    this.connection = undefined;
    try {
      connection?.destroy?.();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
  private refreshLabels(): void {
    if (!this.options) return;
    this.loadingLabel = this.options.loadingLabel ?? this.intl.messages.loading;
    this.closeLabel = this.options.closeLabel ?? this.intl.messages.close;
    this.cancelLabel = this.options.cancelLabel ?? this.intl.messages.cancel;
    this.createLabel = this.options.createLabel ?? this.intl.messages.create;
    this.updateLabel = this.options.updateLabel ?? this.intl.messages.update;
    this.syncEmptyFieldsOptions();
  }
  private async markCurrentFormAsSaved(): Promise<void> {
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

  private syncRecordFromCurrentForm(record: TRecord): TRecord {
    const rawValue = this.formGroup.getRawValue();

    Object.keys(rawValue).forEach((key) =>
      this.setRecordValue(record, key, rawValue[key]),
    );

    return record;
  }

  private setRecordValue(
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

  private buildRecordFormValue(record: TRecord): Record<string, unknown> {
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

  private setFormValue(
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

  private setSavedResult(result: EditEntityDialogResult<TRecord>): void {
    this.savedResult = result;
    this.result.emit(result);
  }

  private buildCloseResult(): EditEntityDialogResult<TRecord> {
    return this.savedResult.updated
      ? this.savedResult
      : { updated: false, record: this.options.record };
  }

  private isActionButton(
    action: EditEntityAction<TRecord>,
  ): action is EditEntityActionButton<TRecord> {
    return "handle" in action && typeof action.handle === "function";
  }

  private isDialogResult(
    response: unknown,
  ): response is EditEntityDialogResult<TRecord> {
    return (
      !!response &&
      typeof response === "object" &&
      Object.prototype.hasOwnProperty.call(response, "updated")
    );
  }

  private isRecord(response: unknown): response is TRecord {
    return (
      !!response &&
      typeof response === "object" &&
      Object.prototype.hasOwnProperty.call(response, "_id")
    );
  }

  private notify(message: string): void {
    if (this.options.service?.disableNotifications) return;
    this.host.notify(message);
  }

  private resolveTitle(
    value: EditEntityTitle<TRecord> | undefined,
    context: EditEntityTitleContext<TRecord>,
  ): string {
    if (!value) return "";
    return typeof value === "function" ? value(context) : value;
  }

  private finishWithError(label: string): void {
    this.loading = false;
    this.errorLabel = label;
    this.changeDetectorRef.markForCheck();
  }

  private focusOnField(attempt = 0): void {
    if (!this.options.focusOn) return;
    if (this.tryFocusField(this.options.focusOn)) return;
    if (attempt >= 20) return;
    this.focusTimer = setTimeout(() => this.focusOnField(attempt + 1), 100);
  }

  private tryFocusField(fieldName: string): boolean {
    const escapedName = fieldName.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const fieldElement = this.elementRef.nativeElement.querySelector(
      `[data-edit-field-name="${escapedName}"]`,
    ) as HTMLElement | null;
    if (!fieldElement) return false;

    const focusableElement = this.findFocusableElement(fieldElement);
    if (!focusableElement) return false;

    focusableElement.focus();
    return true;
  }

  private findFocusableElement(fieldElement: HTMLElement): HTMLElement | null {
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
