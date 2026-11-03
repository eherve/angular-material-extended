import { CdkStepper } from "@angular/cdk/stepper";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
import { MatTooltipModule } from "@angular/material/tooltip";
import {
  EditEntityConditionalStateService,
  EditEntityFormBuilderService,
  EditEntityRecord,
  EditEntityRenderService,
  EditEntitySubmitValueService,
} from "@eherve/angular-material-forms/core";
import { EntityFormSession } from "@eherve/angular-material-forms/editor";
import { FormContentComponent } from "@eherve/angular-material-forms/layout";
import { cloneDeep, get, has, set } from "lodash-es";
import { CreateEntityWizardState } from "./create-entity-wizard-state";
import {
  CreateEntityWizardComponentOptions,
  CreateEntityWizardStep,
} from "./create-entity-wizard.types";
@Component({
  selector: "ame-entity-wizard",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormContentComponent,
    MatStepperModule,
  ],
  providers: [
    EntityFormSession,
    EditEntityConditionalStateService,
    EditEntityFormBuilderService,
    EditEntityRenderService,
    EditEntitySubmitValueService,
  ],
  templateUrl: "./entity-wizard.component.html",
  styleUrl: "./entity-wizard.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityWizardComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnInit, OnChanges, OnDestroy
{
  @Input({ required: true })
  options!: CreateEntityWizardComponentOptions<TRecord>;
  @Input() displayMode: "page" | "dialog" = "page";
  readonly session = inject<EntityFormSession<TRecord>>(EntityFormSession);
  @Output() readonly result = this.session.result;
  @Output() readonly closeRequest = this.session.closeRequest;
  ngOnInit(): void {
    this.session.options = this.options;
    this.session.displayMode = this.displayMode;
    this.session.policy = {
      valid: () => this.wizardValid,
      value: (create) => this.wizardValue(create),
      patch: (record, value) => this.patchWizardRecord(record, value),
      saved: (record, value) => this.hydrateWizard(record, value),
      hydrate: (record) =>
        this.wizardState.hydrate(this.session.formGroup, record, []),
      refresh: () => this.refreshWizardState(),
      reset: () => {
        this.wizardIndex.set(0);
        this.wizardCompleted.set(this.options.wizard.steps.map(() => false));
        this.wizardVisibleIndices.set([]);
        this.wizardNavigationControls = [];
      },
      componentUpdated: () => this.completeWizardStep(),
      beforeClose: () =>
        this.session.formGroup.setInitialValue(
          this.session.formGroup.initialValue,
        ),
      stickyResult: true,
    };
    void this.session.initialize();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["options"] && !changes["options"].firstChange) {
      this.session.options = this.options;
      void this.session.initialize();
    }
  }
  ngOnDestroy(): void {
    this.session.destroy();
  }
  requestClose(): Promise<void> {
    return this.session.requestClose();
  }
  refreshPresentation(): void {
    this.session.refreshPresentation();
  }
  submitFromKeyboard(): boolean {
    if (
      !this.options.validateOnEnter ||
      this.session.loading ||
      this.session.updating
    )
      return false;
    void this.wizardNext();
    return true;
  }
  readonly wizardIndex = signal(0);
  readonly wizardDrafts = signal<boolean[]>([]);
  readonly wizardCompleted = signal<boolean[]>([]);
  readonly wizardVisibleIndices = signal<number[]>([]);
  readonly wizardVisualIndex = computed(() =>
    Math.max(0, this.wizardVisibleIndices().indexOf(this.wizardIndex())),
  );
  readonly wizardNavigationBlocked = signal(false);
  readonly wizardLinear = signal(true);
  wizardNavigationControls: FormControl<boolean>[] = [];
  @ViewChild(MatStepper) wizardStepper?: CdkStepper;
  private readonly wizardState = new CreateEntityWizardState();
  get wizardStep(): CreateEntityWizardStep<TRecord> | undefined {
    return this.options?.wizard?.steps[this.wizardIndex()];
  }

  get wizardLast(): boolean {
    return this.wizardIndex() === this.wizardVisibleIndices().at(-1);
  }

  get wizardPrimaryLabel(): string {
    const wizard = this.options.wizard;
    if (!this.options.record?._id)
      return (
        wizard?.createNextLabel ?? this.session.intl.messages.wizardCreateNext
      );
    return this.wizardLast
      ? (wizard?.finishLabel ?? this.session.intl.messages.wizardFinish)
      : (wizard?.nextLabel ?? this.session.intl.messages.wizardNext);
  }

  get wizardExitLabel(): string {
    return this.options.record?._id
      ? (this.options.wizard?.finishLaterLabel ??
          this.session.intl.messages.wizardFinishLater)
      : this.session.cancelLabel;
  }

  selectWizardVisualStep(position: number): void {
    const index = this.wizardVisibleIndices()[position];
    if (index !== undefined) this.selectWizardStep(index);
  }

  private advanceWizard(): void {
    const next = this.wizardVisibleIndices()[this.wizardVisualIndex() + 1];
    if (next !== undefined) {
      this.wizardIndex.set(next);
      this.refreshWizardNavigation();
    }
  }

  private completeWizardStep(): void {
    const completed = [...this.wizardCompleted()];
    completed[this.wizardIndex()] = true;
    this.wizardCompleted.set(completed);
    this.refreshWizardNavigation();
  }

  private refreshWizardNavigation(): void {
    if (!this.options?.wizard) return;
    const blocked = this.session.updating || this.wizardPending;
    this.wizardNavigationBlocked.set(blocked);
    const linear = !this.options.record?._id || blocked;
    this.wizardLinear.set(linear);
    if (this.wizardStepper) this.wizardStepper.linear = linear;
    const count = this.options.wizard.steps.length;
    if (this.wizardNavigationControls.length !== count) {
      this.wizardNavigationControls = Array.from(
        { length: count },
        () =>
          new FormControl(false, {
            nonNullable: true,
            validators: Validators.requiredTrue,
          }),
      );
    }
    for (const [index, control] of this.wizardNavigationControls.entries()) {
      control.setValue(
        !blocked && (index !== 0 || !!this.options.record?._id),
        { emitEvent: false },
      );
    }
    // CDK checks these public step properties synchronously when a header is selected.
    // Synchronize immediately, including before Angular's next rendering pass.
    this.wizardStepper?.steps.forEach((step, position) => {
      const index = this.wizardVisibleIndices()[position];
      step.optional = false;
      step.interacted = true;
      step.completed = !blocked && !!this.wizardCompleted()[index];
      step.editable = !blocked && (index === 0 || !!this.options.record?._id);
    });
  }

  get wizardValid(): boolean {
    return this.wizardState.valid(this.session.formGroup, [
      ...this.wizardPaths(),
      ...this.wizardAlwaysPaths(),
    ]);
  }

  get wizardPending(): boolean {
    return [...this.wizardPaths(), ...this.wizardAlwaysPaths()].some(
      (path) => this.session.formGroup.getControl(path)?.pending,
    );
  }

  get wizardUnsaved(): boolean {
    return (
      Object.keys(
        this.wizardState.project(
          this.session.formGroup,
          this.wizardPaths(),
          true,
        ),
      ).length > 0
    );
  }

  selectWizardStep(index: number): void {
    if (
      this.session.updating ||
      this.wizardPending ||
      !this.options.wizard ||
      index < 0 ||
      index >= this.options.wizard.steps.length ||
      !this.wizardVisibleIndices().includes(index)
    )
      return;
    if (index > 0 && !this.options.record?._id) return;
    this.wizardIndex.set(index);
    this.refreshWizardNavigation();
  }

  skipWizardStep(): void {
    if (
      this.session.updating ||
      this.wizardPending ||
      !this.wizardStep?.optional ||
      !this.options.record?._id
    )
      return;
    if (this.wizardLast) void this.requestClose();
    else this.advanceWizard();
  }

  async wizardNext(): Promise<void> {
    if (this.session.updating || !this.options.wizard) return;
    const isCurrent = this.session.captureCurrentOperation();
    if (!this.wizardStep?.componentManaged) {
      for (const path of this.wizardPaths())
        this.session.formGroup.getControl(path)?.markAllAsTouched();
      if (!this.wizardValid) return;
      const previous = this.session.savedResult;
      if (!this.options.record?._id) await this.session.create();
      else if (this.wizardUnsaved) await this.session.update();
      else {
        this.completeWizardStep();
        if (this.wizardLast) await this.requestClose();
        else this.advanceWizard();
        return;
      }
      if (!isCurrent() || previous === this.session.savedResult) return;
    }
    if (this.wizardLast) await this.requestClose();
    else this.advanceWizard();
  }

  private wizardPaths(index = this.wizardIndex()): string[] {
    const display = this.options?.displayOptions;
    const tab = display && "tabs" in display ? display.tabs[index] : undefined;
    const names = tab
      ? this.session.renderService
          .collectFields(tab.displayOptions)
          .flatMap((field) =>
            field.kind === "separator" ||
            field.kind === "metadata" ||
            field.kind === "display"
              ? []
              : [field.name],
          )
      : [];
    return [
      ...new Set([
        ...names,
        ...(this.options.wizard?.steps[index]?.fields ?? []),
      ]),
    ];
  }

  private wizardAlwaysPaths(): string[] {
    return this.session.fields.flatMap((field) =>
      field.kind !== "separator" &&
      field.kind !== "metadata" &&
      field.kind !== "display" &&
      field.alwaysInUpsert
        ? [field.name]
        : [],
    );
  }

  private wizardValue(create: boolean): Record<string, unknown> {
    const paths = this.wizardPaths();
    const always = this.wizardAlwaysPaths();
    const value = this.wizardState.project(
      this.session.formGroup,
      paths,
      !create,
      always,
    );
    if (create)
      for (const path of [...paths, ...always]) {
        if (
          !this.session.formGroup.getControl(path) &&
          has(this.options.defaultValues, path)
        )
          set(value, path, cloneDeep(get(this.options.defaultValues, path)));
      }
    return value;
  }

  private patchWizardRecord(
    record: TRecord,
    value: Record<string, unknown>,
  ): TRecord {
    const updated = cloneDeep(record);
    for (const path of [...this.wizardPaths(), ...this.wizardAlwaysPaths()]) {
      if (has(value, path)) set(updated, path, cloneDeep(get(value, path)));
    }
    return updated;
  }

  private async hydrateWizard(
    record: TRecord,
    value: Record<string, unknown>,
  ): Promise<void> {
    const paths = [...this.wizardPaths(), ...this.wizardAlwaysPaths()].filter(
      (path) => has(value, path),
    );
    this.wizardState.hydrate(this.session.formGroup, record, paths);
    this.completeWizardStep();
    this.session.updated = this.session.formGroup.isUpdated;
    this.session.refreshAllowedActions();
    this.session.refreshRuntimeState();
  }

  private refreshWizardState(): void {
    const visible = (this.session.renderState().tabs ?? []).flatMap(
      (tab, index) => (tab.isVisible ? [index] : []),
    );
    this.wizardVisibleIndices.set(visible);
    if (!visible.includes(this.wizardIndex()) && visible.length)
      this.wizardIndex.set(visible[0]);
    this.wizardDrafts.set(
      this.options.wizard.steps.map(
        (_, index) =>
          Object.keys(
            this.wizardState.project(
              this.session.formGroup,
              this.wizardPaths(index),
              true,
            ),
          ).length > 0,
      ),
    );
    this.refreshWizardNavigation();
  }
}
