import { _IdGenerator } from "@angular/cdk/a11y";
import { CdkStep, CdkStepper } from "@angular/cdk/stepper";
import {
  ChangeDetectorRef,
  ElementRef,
  ErrorHandler,
  Injector,
  QueryList,
  runInInjectionContext,
} from "@angular/core";
import {
  EDIT_ENTITY_DIALOG_HOST,
  EDIT_ENTITY_LOGGER,
  EditEntityConditionalStateService,
  EditEntityDialogIntl,
  EditEntityFormBuilderService,
  EditEntityRenderService,
  EditEntitySubmitValueService,
} from "@eherve/angular-material-forms/core";
import { EntityFormSession } from "@eherve/angular-material-forms/editor";
import { createEntityWizardOptions } from "./create-entity-wizard.types";
import { EntityWizardComponent } from "./entity-wizard.component";

type WizardRecord = { _id?: string; name?: string; calendar?: string[] };

describe("creation wizard engine", () => {
  async function setup(
    create: (
      value: Record<string, unknown>,
    ) => Promise<WizardRecord | false> = async (
      value: Record<string, unknown>,
    ) => ({
      _id: "1",
      ...value,
      calendar: ["inherited"],
    }),
  ) {
    const conditions = new EditEntityConditionalStateService();
    const renderer = new EditEntityRenderService(conditions);
    const injector = Injector.create({
      providers: [
        EntityFormSession,
        { provide: ChangeDetectorRef, useValue: { markForCheck(): void {} } },
        {
          provide: ElementRef,
          useValue: { nativeElement: { querySelector: () => null } },
        },
        {
          provide: EDIT_ENTITY_DIALOG_HOST,
          useValue: { notify(): void {}, confirm: async () => true },
        },
        { provide: EDIT_ENTITY_LOGGER, useValue: { debug(): void {} } },
        { provide: ErrorHandler, useValue: { handleError(): void {} } },
        { provide: EditEntityDialogIntl, useValue: new EditEntityDialogIntl() },
        { provide: EditEntityConditionalStateService, useValue: conditions },
        {
          provide: EditEntityFormBuilderService,
          useValue: new EditEntityFormBuilderService(conditions),
        },
        { provide: EditEntityRenderService, useValue: renderer },
        {
          provide: EditEntitySubmitValueService,
          useValue: new EditEntitySubmitValueService(),
        },
      ],
    });
    const component = runInInjectionContext(
      injector,
      () => new EntityWizardComponent<WizardRecord>(),
    );
    const update = jasmine
      .createSpy("update")
      .and.callFake(async (_id: string, value: object) => ({
        _id,
        name: "Client",
        calendar: ["inherited"],
        ...value,
      }));
    component.options = createEntityWizardOptions<WizardRecord>({
      steps: ["name", "billing", "calendar"].map((name, index) => ({
        id: name,
        label: name,
        optional: index > 0,
        displayOptions: {
          section: {
            id: name,
            label: name,
            cards: [
              {
                id: name,
                label: name,
                fields: [
                  { kind: "text", name, label: name, required: index < 2 },
                ],
              },
            ],
          },
        },
      })),
      service: { create, update },
    });
    component.ngOnInit();
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { component, update, renderer, injector };
  }
  it("creates once with scoped valid fields and retains drafts/defaults and sticky created result", async () => {
    const create = jasmine
      .createSpy("create")
      .and.callFake(async (value: object) => ({
        _id: "1",
        ...value,
        calendar: ["inherited"],
      }));
    const { component, update } = await setup(create);
    component.session.formGroup.patchPathValue("name", "Client");
    component.session.formGroup.patchPathValue("billing", "draft");
    await component.wizardNext();
    expect(create.calls.first().args[0]).toEqual({ name: "Client" });
    expect(component.session.formGroup.requireControl("billing").value).toBe(
      "draft",
    );
    expect(
      component.session.formGroup.requireControl("calendar").value,
    ).toEqual(["inherited"]);
    await component.wizardNext();
    expect(update.calls.first().args[1]).toEqual({ billing: "draft" });
    const close = jasmine.createSpy("close");
    component.closeRequest.subscribe(close);
    await component.requestClose();
    expect(close.calls.first().args[0]).toEqual(
      jasmine.objectContaining({ created: true, updated: true }),
    );
    expect(create).toHaveBeenCalledTimes(1);
    component.ngOnDestroy();
  });
  it("blocks pending validation and duplicate create while keeping failed values", async () => {
    let resolve: (value: false) => void = () => undefined;
    const create = jasmine
      .createSpy("create")
      .and.callFake(() => new Promise<false>((done) => (resolve = done)));
    const { component } = await setup(create);
    component.session.formGroup.patchPathValue("name", "Client");
    component.session.formGroup.requireControl("name").markAsPending();
    await component.wizardNext();
    expect(create).not.toHaveBeenCalled();
    component.session.formGroup.requireControl("name").updateValueAndValidity();
    const first = component.wizardNext();
    await component.wizardNext();
    expect(create).toHaveBeenCalledTimes(1);
    resolve(false);
    await first;
    expect(component.wizardIndex()).toBe(0);
    expect(component.session.formGroup.requireControl("name").value).toBe(
      "Client",
    );
    component.ngOnDestroy();
  });
  it("blocks skip/header navigation while current validation is pending", async () => {
    const { component } = await setup();
    component.session.formGroup.patchPathValue("name", "Client");
    await component.wizardNext();
    component.session.formGroup.requireControl("billing").markAsPending();
    component.skipWizardStep();
    component.selectWizardStep(2);
    expect(component.wizardIndex()).toBe(1);
    component.ngOnDestroy();
  });
  it("replaces shortened arrays after boolean updates without leaking drafts", async () => {
    const { component } = await setup(async () => ({
      _id: "1",
      name: "Client",
      calendar: ["one", "two"],
    }));
    component.session.formGroup.patchPathValue("name", "Client");
    await component.wizardNext();
    component.options.service!.update = async () => true;
    component.selectWizardStep(2);
    component.session.formGroup.patchPathValue("calendar", ["one"]);
    await component.wizardNext();
    expect(component.options.record).toEqual({
      _id: "1",
      name: "Client",
      calendar: ["one"],
    });
    component.ngOnDestroy();
  });
  it("keeps a rejected create on its step with entered values", async () => {
    const { component } = await setup(async () => {
      throw new Error("offline");
    });
    component.session.formGroup.patchPathValue("name", "Client");
    await component.wizardNext();
    expect(component.wizardIndex()).toBe(0);
    expect(component.options.record).toBeUndefined();
    expect(component.session.formGroup.requireControl("name").value).toBe(
      "Client",
    );
    expect(component.session.updating).toBeFalse();
    component.ngOnDestroy();
  });
  it("ignores create completions after destruction and cleans connection exactly once", async () => {
    let complete: (value: WizardRecord) => void = () => undefined;
    const { component } = await setup(
      () => new Promise<WizardRecord>((resolve) => (complete = resolve)),
    );
    const destroy = jasmine.createSpy("destroy");
    component.options.connect = () => ({ destroy });
    component.ngOnChanges({
      options: { firstChange: false } as import("@angular/core").SimpleChange,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    component.session.formGroup.patchPathValue("name", "Client");
    const result = jasmine.createSpy("result");
    component.result.subscribe(result);
    const pending = component.wizardNext();
    component.ngOnDestroy();
    complete({ _id: "1", name: "Client" });
    await pending;
    expect(component.options.record).toBeUndefined();
    expect(result).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledTimes(1);
  });
  it("skips without submitting and retains draft for the close guard", async () => {
    const { component, update } = await setup();
    component.session.formGroup.patchPathValue("name", "Client");
    await component.wizardNext();
    component.session.formGroup.patchPathValue("billing", "unsaved");
    component.skipWizardStep();
    expect(component.wizardIndex()).toBe(2);
    expect(update).not.toHaveBeenCalled();
    expect(component.session.formGroup.requireControl("billing").value).toBe(
      "unsaved",
    );
    expect(component.session.formGroup.isUpdated).toBeTrue();
    component.ngOnDestroy();
  });
  it("component-managed steps report independent mutations without submitting", async () => {
    const { component, update, renderer } = await setup();
    component.session.formGroup.patchPathValue("name", "Client");
    await component.wizardNext();
    component.options.wizard!.steps[1].componentManaged = true;
    renderer.markUpdated?.();
    await component.wizardNext();
    expect(component.wizardIndex()).toBe(2);
    expect(update).not.toHaveBeenCalled();
    const closed = jasmine.createSpy("closed");
    component.closeRequest.subscribe(closed);
    await component.requestClose();
    expect(closed.calls.first().args[0]).toEqual(
      jasmine.objectContaining({ updated: true, created: true }),
    );
    component.ngOnDestroy();
  });
  it("real CDK forward and backward selection stay synchronized while pending or saving", async () => {
    const { component, injector } = await setup();
    const stepperInjector = Injector.create({
      parent: injector,
      providers: [
        { provide: _IdGenerator, useValue: { getId: () => "wizard-test" } },
      ],
    });
    const stepper = runInInjectionContext(
      stepperInjector,
      () => new CdkStepper(),
    );
    const childInjector = Injector.create({
      parent: stepperInjector,
      providers: [{ provide: CdkStepper, useValue: stepper }],
    });
    const steps = Array.from({ length: 3 }, () =>
      runInInjectionContext(childInjector, () => new CdkStep()),
    );
    // Angular normally fills this public content query before its lifecycle hook.
    stepper._steps = new QueryList<CdkStep>();
    stepper._steps.reset(steps);
    stepper.ngAfterContentInit();
    stepper.linear = true;
    component.wizardStepper = stepper;
    steps.forEach((step, index) => {
      step.stepControl = component.wizardNavigationControls[index];
      step.interacted = true;
      step.optional = false;
      step.completed = false;
    });
    stepper.selectionChange.subscribe((event) =>
      component.selectWizardVisualStep(event.selectedIndex),
    );
    expect(steps[1].isNavigable()).toBeFalse();
    component.session.formGroup.patchPathValue("name", "Client");
    await component.wizardNext();
    expect(steps[1].completed).toBeFalse();
    expect(steps[1].isNavigable()).toBeTrue();
    expect(steps[2].isNavigable()).toBeTrue();
    // Jump over untouched intermediate steps immediately after creation.
    stepper.selectedIndex = 2;
    expect(stepper.selectedIndex).toBe(2);
    expect(component.wizardIndex()).toBe(2);
    expect(component.wizardCompleted()).toEqual([true, false, false]);
    stepper.selectedIndex = 1;
    stepper.selectedIndex = component.wizardVisualIndex();
    expect(stepper.selectedIndex).toBe(1);
    component.session.formGroup.requireControl("billing").markAsPending();
    expect(steps[2].isNavigable()).toBeFalse();
    stepper.selectedIndex = 2;
    expect(stepper.selectedIndex).toBe(1);
    expect(component.wizardIndex()).toBe(1);
    stepper.selectedIndex = 0;
    expect(stepper.selectedIndex).toBe(1);
    component.session.formGroup
      .requireControl("billing")
      .updateValueAndValidity();
    component.session.updating = true;
    expect(steps[2].isNavigable()).toBeFalse();
    stepper.selectedIndex = 2;
    expect(stepper.selectedIndex).toBe(1);
    component.session.updating = false;
    expect(steps[2].isNavigable()).toBeTrue();
    stepper.selectedIndex = 2;
    expect(stepper.selectedIndex).toBe(2);
    expect(component.wizardIndex()).toBe(2);
    component.ngOnDestroy();
    stepper.ngOnDestroy();
  });
  it("hides decorated tabs, preserves source indices, and skips hidden navigation targets", async () => {
    const { component } = await setup();
    if (!("tabs" in component.options.displayOptions))
      throw new Error("tabs required");
    component.options.displayOptions.tabs[1].visible = false;
    component.refreshPresentation();
    expect(component.wizardVisibleIndices()).toEqual([0, 2]);
    component.session.formGroup.patchPathValue("name", "Client");
    await component.wizardNext();
    expect(component.wizardIndex()).toBe(2);
    component.selectWizardStep(1);
    expect(component.wizardIndex()).toBe(2);
    expect(component.wizardLast).toBeTrue();
    expect(component.wizardCompleted()).toEqual([true, false, false]);
    component.ngOnDestroy();
  });
  it("starts with incomplete future steps and create/cancel labels", async () => {
    const { component } = await setup();
    expect(component.wizardCompleted()).toEqual([false, false, false]);
    if (!("tabs" in component.options.displayOptions))
      throw new Error("tabs required");
    expect(component.options.displayOptions.tabs.map((tab) => tab.id)).toEqual([
      "name",
      "billing",
      "calendar",
    ]);
    expect(component.wizardPrimaryLabel).toBe("Créer et continuer");
    expect(component.wizardExitLabel).toBe("Annuler");
    component.ngOnDestroy();
  });
});
