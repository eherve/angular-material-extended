import { DialogLifecycleHandle } from "@eherve/angular-material-section-tabs";
import {
  ChangeDetectorRef,
  ElementRef,
  ErrorHandler,
  Injector,
  runInInjectionContext,
} from "@angular/core";
import {
  EDIT_ENTITY_DIALOG_HOST,
  EDIT_ENTITY_LOGGER,
  EditEntityConditionalStateService,
  EditEntityDialogHost,
  EditEntityDialogIntl,
  EditEntityFormBuilderService,
  EditEntityFormControl,
  EditEntityRenderService,
  EditEntitySubmitValueService,
} from "@eherve/angular-material-forms/core";
import { EntityFormSession } from "./entity-form-session";
import { fakeAsync, tick } from "@angular/core/testing";
import { StatusChangeEvent, ValidationErrors } from "@angular/forms";
import { Subject } from "rxjs";

describe("EntityFormSession close confirmation", () => {
  it("keeps an immediate checkbox change until discard is confirmed", async () => {
    const conditions = new EditEntityConditionalStateService();
    const host: EditEntityDialogHost = {
      confirm: async (): Promise<boolean> => false,
      notify: (): void => undefined,
      showJson: (): void => undefined,
    };
    const injector = Injector.create({
      providers: [
        { provide: EditEntityDialogIntl, useValue: new EditEntityDialogIntl() },
        {
          provide: ChangeDetectorRef,
          useValue: { markForCheck: (): void => undefined },
        },
        { provide: ElementRef, useValue: new ElementRef(null) },
        { provide: EDIT_ENTITY_DIALOG_HOST, useValue: host },
        { provide: ErrorHandler, useValue: new ErrorHandler() },
        {
          provide: EDIT_ENTITY_LOGGER,
          useValue: { debug: (): void => undefined },
        },
        { provide: EditEntityConditionalStateService, useValue: conditions },
        {
          provide: EditEntityFormBuilderService,
          useValue: new EditEntityFormBuilderService(conditions),
        },
        {
          provide: EditEntityRenderService,
          useValue: new EditEntityRenderService(conditions),
        },
        {
          provide: EditEntitySubmitValueService,
          useValue: new EditEntitySubmitValueService(),
        },
      ],
    });
    const session = runInInjectionContext(
      injector,
      () => new EntityFormSession(),
    );
    session.options = { displayOptions: { sections: [] } };
    session.formGroup.setControl("enabled", new EditEntityFormControl(false));

    try {
      session.formGroup.requireControl("enabled").setValue(true);
      expect(await session.canClose()).toBeFalse();
      session.formGroup.requireControl("enabled").setValue(false);
      expect(await session.canClose()).toBeTrue();
    } finally {
      session.destroy();
    }
  });
});

function createValiditySession(): EntityFormSession {
  const conditions = new EditEntityConditionalStateService();
  const injector = Injector.create({
    providers: [
      { provide: EditEntityDialogIntl, useValue: new EditEntityDialogIntl() },
      {
        provide: ChangeDetectorRef,
        useValue: { markForCheck: (): void => undefined },
      },
      { provide: ElementRef, useValue: new ElementRef(null) },
      {
        provide: EDIT_ENTITY_DIALOG_HOST,
        useValue: {
          confirm: async (): Promise<boolean> => false,
          notify: (): void => undefined,
          showJson: (): void => undefined,
        },
      },
      { provide: ErrorHandler, useValue: new ErrorHandler() },
      {
        provide: EDIT_ENTITY_LOGGER,
        useValue: { debug: (): void => undefined },
      },
      { provide: EditEntityConditionalStateService, useValue: conditions },
      {
        provide: EditEntityFormBuilderService,
        useValue: new EditEntityFormBuilderService(conditions),
      },
      {
        provide: EditEntityRenderService,
        useValue: new EditEntityRenderService(conditions),
      },
      {
        provide: EditEntitySubmitValueService,
        useValue: new EditEntitySubmitValueService(),
      },
    ],
  });
  const session = runInInjectionContext(
    injector,
    () => new EntityFormSession(),
  );
  session.options = { displayOptions: { sections: [] } };
  return session;
}

describe("EntityFormSession asynchronous validity", () => {
  for (const { settleAfterPresentationDebounce, validationErrors } of [
    { settleAfterPresentationDebounce: false, validationErrors: null },
    { settleAfterPresentationDebounce: true, validationErrors: null },
    {
      settleAfterPresentationDebounce: true,
      validationErrors: { unique: true },
    },
  ]) {
    it(`tracks a silent async validator restart settling ${validationErrors ? "INVALID" : "VALID"} ${settleAfterPresentationDebounce ? "after" : "before"} presentation debounce`, fakeAsync((): void => {
      const session = createValiditySession();
      const code = new EditEntityFormControl("CONTRACT-1");
      const requests: Subject<ValidationErrors | null>[] = [];
      const emittedStatuses: string[] = [];
      const statusEvents: string[] = [];
      session.formGroup.setControl("code", code);
      const statuses = session.formGroup.statusChanges.subscribe((status) =>
        emittedStatuses.push(status),
      );
      const events = session.formGroup.events.subscribe((event) => {
        if (event instanceof StatusChangeEvent) statusEvents.push(event.status);
      });
      session.bindFormState();
      code.setAsyncValidators(() => {
        const response = new Subject<ValidationErrors | null>();
        requests.push(response);
        return response;
      });
      try {
        code.updateValueAndValidity();
        if (settleAfterPresentationDebounce) {
          tick(110);
          expect(session.valid).toBeFalse();
        }
        // Angular rebinds a mounted control with emitEvent:false, cancelling its previous async validation.
        code.updateValueAndValidity({ emitEvent: false });
        expect(requests.length).toBe(2);
        requests[1].next(validationErrors);
        requests[1].complete();
        expect(session.formGroup.valid).toBe(!validationErrors);
        expect(emittedStatuses).toEqual(["PENDING"]);
        expect(statusEvents).toEqual([
          "PENDING",
          validationErrors ? "INVALID" : "VALID",
        ]);
        tick(110);
        expect(session.formStatus).toBe(validationErrors ? "INVALID" : "VALID");
        expect(session.valid).toBe(!validationErrors);
      } finally {
        statuses.unsubscribe();
        events.unsubscribe();
        session.destroy();
      }
    }));
  }
});


describe("EntityFormSession lifecycle close", () => {
  it("returns false for rejected dirty close and while updating", async () => {
    const session = createValiditySession();
    session.options = { displayOptions: { sections: [] } };
    session.formGroup.setControl("name", new EditEntityFormControl("initial"));
    session.formGroup.requireControl("name").setValue("changed");
    expect(await session.requestLifecycleClose()).toBeFalse();
    session.updating = true;
    expect(await session.requestLifecycleClose()).toBeFalse();
    session.destroy();
  });

  it("accepts a pristine close and emits exactly once", async () => {
    const session = createValiditySession();
    session.options = { displayOptions: { sections: [] } };
    const close = jasmine.createSpy("close");
    session.closeRequest.subscribe(close);
    expect(await session.requestLifecycleClose()).toBeTrue();
    expect(close).toHaveBeenCalledTimes(1);
    session.destroy();
  });
});


describe("EntityFormSession descendant close guard", () => {
  it("rejects native close until descendants permit it", async () => {
    const session = createValiditySession();
    session.options = { displayOptions: { sections: [] } };
    const close = jasmine.createSpy("close");
    session.closeRequest.subscribe(close);
    session.connection = { beforeClose: async () => false };
    expect(await session.requestLifecycleClose()).toBeFalse();
    expect(close).not.toHaveBeenCalled();
    session.connection = { beforeClose: async () => true };
    expect(await session.requestLifecycleClose()).toBeTrue();
    expect(await session.requestLifecycleClose()).toBeFalse();
    expect(close).toHaveBeenCalledTimes(1);
    session.destroy();
  });
});

it("hydrates a successful save when the descendant guard rejects automatic close", async () => {
  const session = createValiditySession();
  session.options = {
    displayOptions: { sections: [] },
    service: { create: async () => ({ _id: "created" }), closeOnUpsert: true },
  };
  const saved = jasmine.createSpy("saved").and.resolveTo();
  session.policy = {
    valid: () => true,
    value: () => ({}),
    patch: record => record,
    saved,
    hydrate: () => {},
  };
  session.connection = { beforeClose: async () => false };
  const close = jasmine.createSpy("close");
  session.closeRequest.subscribe(close);
  await session.create();
  expect(close).not.toHaveBeenCalled();
  expect(saved).toHaveBeenCalled();
  expect(session.options.record?._id).toBe("created");
  expect(session.updating).toBeFalse();
  session.destroy();
});


describe("EntityFormSession early lifecycle close", () => {
  it("exposes a guarded close before a hung load and never reports ready after cancellation", async () => {
    const session = createValiditySession();
    let handle: Pick<DialogLifecycleHandle, "requestClose"> | undefined;
    let resolve!: (record: { _id: string }) => void;
    const pending = new Promise<{ _id: string }>(done => resolve = done);
    const ready = jasmine.createSpy("ready");
    const closed = jasmine.createSpy("closed");
    let allowed = false;
    session.closeRequest.subscribe(closed);
    session.options = {
      displayOptions: { sections: [] }, loadRecord: () => pending,
      connect: () => ({ opened: value => handle = value, ready, beforeClose: () => allowed }),
    };
    const initialization = session.initialize();
    expect(handle).toBeDefined();
    expect(session.loading).toBeTrue();
    expect(ready).not.toHaveBeenCalled();
    expect(await handle!.requestClose()).toBeFalse();
    allowed = true;
    expect(await handle!.requestClose()).toBeTrue();
    expect(closed).toHaveBeenCalledTimes(1);
    resolve({ _id: "late" }); await initialization;
    expect(ready).not.toHaveBeenCalled();
    expect(await handle!.requestClose()).toBeFalse();
    session.destroy();
  });
});
