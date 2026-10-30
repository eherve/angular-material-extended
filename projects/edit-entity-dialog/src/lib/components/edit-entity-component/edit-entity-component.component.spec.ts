import { Subject, startWith } from "rxjs";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { TestBed } from "@angular/core/testing";
import { ErrorHandler, provideZonelessChangeDetection } from "@angular/core";
import { EditEntityComponent } from "./edit-entity-component.component";
import { EditEntityDialogModule } from "../../edit-entity-dialog.module";
import { EDIT_ENTITY_DIALOG_HOST } from "../../edit-entity-dialog-host";
import { EDIT_ENTITY_LOGGER } from "../../edit-entity-logger";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { Component, Input } from "@angular/core";
import {
  EditEntityComponentOptions,
  EditEntityDialogConnection,
} from "../../edit-entity-dialog.types";
@Component({ selector: "test-edit-action", template: "" })
class ConnectionAction {
  @Input() recordName = "";
}
@Component({ selector: "test-mounted-card", template: "Mounted card content" })
class MountedCard {}

interface RecordValue {
  _id?: string;
  name: string;
  __archived?: { isArchived: boolean; user?: string };
}
describe("EditEntityComponent mutations", () => {
  const host = {
    confirm: jasmine.createSpy().and.resolveTo(true),
    notify: jasmine.createSpy(),
    showJson: jasmine.createSpy(),
  };
  async function setup(
    service: EditEntityComponentOptions<RecordValue>["service"] = {},
    connect?: () => EditEntityDialogConnection<RecordValue>,
    overrides: Partial<EditEntityComponentOptions<RecordValue>> = {},
  ) {
    TestBed.configureTestingModule({
      imports: [EditEntityDialogModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: EDIT_ENTITY_DIALOG_HOST, useValue: host },
        {
          provide: ErrorHandler,
          useValue: { handleError: jasmine.createSpy() },
        },
      ],
    });
    const fixture = TestBed.createComponent(EditEntityComponent<RecordValue>);
    fixture.componentRef.setInput("options", {
      record: { _id: "1", name: "old" },
      displayOptions: {
        section: {
          id: "s",
          label: "Main",
          cards: [
            {
              id: "c",
              label: "Card",
              fields: [{ kind: "text", name: "name", label: "Name" }],
            },
          ],
        },
      },
      service,
      connect,
      ...overrides,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.formGroup.patchValue({ name: "new" });
    component.formGroup.markAsDirty();
    await new Promise((resolve) => setTimeout(resolve, 170));
    return { fixture, component };
  }
  it("inherits live ancestor card and action styles with package priority", async () => {
    const { fixture } = await setup();
    const ancestor = document.createElement("div");
    fixture.nativeElement.parentNode.insertBefore(
      ancestor,
      fixture.nativeElement,
    );
    ancestor.appendChild(fixture.nativeElement);
    try {
      ancestor.style.setProperty("--ngx-mat-extended-space-2", "11px");
      ancestor.style.setProperty("--ngx-mat-extended-radius", "13px");
      ancestor.style.setProperty(
        "--ngx-mat-extended-surface",
        "rgb(10, 20, 30)",
      );
      const card = fixture.nativeElement.querySelector(".edit-entity-card");
      const actions = fixture.nativeElement.querySelector(
        ".edit-entity-actions",
      );
      expect(getComputedStyle(card).borderRadius).toBe("13px");
      expect(getComputedStyle(card).backgroundColor).toBe("rgb(10, 20, 30)");
      expect(getComputedStyle(actions).paddingTop).toBe("11px");
      expect(getComputedStyle(actions).backgroundColor).toBe("rgb(10, 20, 30)");
      ancestor.style.setProperty("--ngx-mat-extended-space-2", "15px");
      ancestor.style.setProperty("--ngx-mat-extended-radius", "17px");
      ancestor.style.setProperty(
        "--ngx-mat-extended-surface",
        "rgb(40, 50, 60)",
      );
      expect(getComputedStyle(card).borderRadius).toBe("17px");
      expect(getComputedStyle(card).backgroundColor).toBe("rgb(40, 50, 60)");
      expect(getComputedStyle(actions).paddingTop).toBe("15px");
      ancestor.style.setProperty(
        "--ngx-mat-edit-entity-dialog-background",
        "rgb(70, 80, 90)",
      );
      expect(
        getComputedStyle(
          fixture.nativeElement.querySelector(".edit-entity-content"),
        ).backgroundColor,
      ).toBe("rgb(70, 80, 90)");
    } finally {
      ancestor.replaceWith(fixture.nativeElement);
    }
  });
  it("renders a live header badge once before the expandable chevron", async () => {
    const { fixture, component } = await setup({}, undefined, {
      displayOptions: {
        section: {
          id: "s",
          label: "Main",
          cards: [
            {
              id: "c",
              label: "Integration",
              expandable: true,
              initiallyExpanded: false,
              headerValue: {
                appearance: "badge",
                value: (_record, form) =>
                  form.get("name")?.value === "enabled" ? "Active" : "Disabled",
              },
              fields: [{ kind: "text", name: "name", label: "Name" }],
            },
          ],
        },
      },
    });
    const toggle = fixture.nativeElement.querySelector(
      ".edit-entity-card-toggle",
    ) as HTMLButtonElement;
    const badge = toggle.querySelector(
      ".edit-entity-card-header-value",
    ) as HTMLElement;
    expect(badge.textContent?.trim()).toBe("Disabled");
    expect(
      badge.classList.contains("edit-entity-card-header-value--badge"),
    ).toBeTrue();
    expect(badge.nextElementSibling).toBe(toggle.lastElementChild);
    expect(toggle.lastElementChild?.textContent?.trim()).toBe("expand_more");
    expect(
      fixture.nativeElement.querySelectorAll(".edit-entity-card-header-value")
        .length,
    ).toBe(1);
    component.formGroup.patchValue({ name: "enabled" });
    await new Promise((resolve) => setTimeout(resolve, 170));
    fixture.detectChanges();
    expect(
      toggle
        .querySelector(".edit-entity-card-header-value")
        ?.textContent?.trim(),
    ).toBe("Active");
  });
  it("keeps a nonexpandable header value as trailing text by default", async () => {
    const { fixture } = await setup({}, undefined, {
      displayOptions: {
        section: {
          id: "s",
          label: "Main",
          cards: [
            {
              id: "c",
              label: "Plain",
              headerValue: { value: "Existing text" },
              fields: [{ kind: "text", name: "name", label: "Name" }],
            },
          ],
        },
      },
    });
    const value = fixture.nativeElement.querySelector(
      ".edit-entity-card-header-value",
    ) as HTMLElement;
    expect(value.textContent?.trim()).toBe("Existing text");
    expect(
      value.classList.contains("edit-entity-card-header-value--badge"),
    ).toBeFalse();
    expect(
      value.parentElement?.classList.contains("edit-entity-card-header-end"),
    ).toBeTrue();
    expect(
      fixture.nativeElement.querySelector(".edit-entity-card-toggle"),
    ).toBeNull();
  });
  function expandableOptions(
    initiallyExpanded = false,
  ): Partial<EditEntityComponentOptions<RecordValue>> {
    const card = {
      id: "c",
      label: "Expandable",
      expandable: true,
      initiallyExpanded,
      fields: [
        { kind: "text" as const, name: "name", label: "Name", required: true },
      ],
      actions: [
        {
          type: "button" as const,
          id: "action",
          label: "Action",
          handler: () => {},
        },
      ],
    };
    return {
      displayOptions: { section: { id: "s", label: "Main", cards: [card] } },
    };
  }

  it("keeps existing cards open without a toggle", async () => {
    const { fixture } = await setup();
    expect(
      fixture.nativeElement.querySelector(".edit-entity-card-toggle"),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector("input").closest("[hidden]"),
    ).toBeNull();
  });

  it("collapses without unmounting or disabling invalid controls and links its native toggle", async () => {
    const { fixture, component } = await setup(
      {},
      undefined,
      expandableOptions(),
    );
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".edit-entity-card-toggle",
    );
    expect(toggle).not.toBeNull();
    if (!toggle) return;
    const body = document.getElementById(toggle.getAttribute("aria-controls")!);
    const input = fixture.nativeElement.querySelector("input");
    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle.type).toBe("button");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(body?.hidden).toBeTrue();
    component.formGroup.get("name")!.setValue("");
    expect(component.formGroup.invalid).toBeTrue();
    expect(component.formGroup.get("name")!.enabled).toBeTrue();
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(body?.hidden).toBeFalse();
    expect(fixture.nativeElement.querySelector("input")).toBe(input);
    const action: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".edit-entity-card-action",
    );
    expect(toggle.contains(action)).toBeFalse();
    action.click();
    fixture.detectChanges();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("defaults expandable cards open and preserves a toggle across presentation rebuilds and resets fresh options", async () => {
    const options = expandableOptions();
    const card = (
      options.displayOptions as {
        section: { cards: { initiallyExpanded?: boolean }[] };
      }
    ).section.cards[0];
    delete card.initiallyExpanded;
    const { fixture, component } = await setup({}, undefined, options);
    let toggle: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".edit-entity-card-toggle",
    );
    expect(toggle).not.toBeNull();
    if (!toggle) return;
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    toggle.click();
    component.refreshPresentation();
    fixture.detectChanges();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fixture.componentRef.setInput("options", { ...component.options });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    toggle = fixture.nativeElement.querySelector(".edit-entity-card-toggle");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps a component card instance mounted while toggling", async () => {
    const card = {
      id: "c",
      label: "Component",
      component: MountedCard,
      expandable: true,
    };
    const { fixture } = await setup({}, undefined, {
      displayOptions: { section: { id: "s", label: "Section", cards: [card] } },
    });
    const mounted = fixture.nativeElement.querySelector("test-mounted-card");
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".edit-entity-card-toggle",
    );
    expect(mounted).not.toBeNull();
    toggle.click();
    fixture.detectChanges();
    expect(mounted.closest("[hidden]")).not.toBeNull();
    toggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("test-mounted-card")).toBe(
      mounted,
    );
  });

  it("keeps same-id cards independent across tabs", async () => {
    const card = { id: "same", label: "Card", expandable: true, fields: [] };
    const section = { id: "same", label: "Section", cards: [card] };
    const { fixture, component } = await setup({}, undefined, {
      displayOptions: {
        tabs: [
          { label: "First", displayOptions: { section } },
          { label: "Second", displayOptions: { section } },
        ],
      },
    });
    const firstToggle: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".edit-entity-card-toggle",
    );
    firstToggle.click();
    fixture.detectChanges();
    const tabs: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll("[role=tab]");
    tabs[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    const state = component.renderState();
    const first = state.tabs![0].renderState.sections![0].items[0];
    const second = state.tabs![1].renderState.sections![0].items[0];
    if (first.type !== "card" || second.type !== "card")
      throw new Error("Expected cards");
    expect(first.expanded).toBeFalse();
    expect(second.expanded).toBeTrue();
    expect(first.bodyId).not.toBe(second.bodyId);
    const secondBody = document.getElementById(second.bodyId!);
    expect(secondBody?.hidden).toBeFalse();
  });

  it("opens the card requested by focusOn before focusing its mounted field", async () => {
    const { fixture } = await setup({}, undefined, {
      ...expandableOptions(),
      focusOn: "name",
    });
    const toggle = fixture.nativeElement.querySelector(
      ".edit-entity-card-toggle",
    );
    expect(toggle?.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector("input"),
    );
  });

  beforeEach(() => {
    host.confirm.and.resolveTo(true);
    host.notify.calls.reset();
  });
  it("logsDetectedChangesWithoutAnUpdateActionAndSkipsUnchangedDiffs", async () => {
    const debug = spyOn(console, "debug");
    const { component, fixture } = await setup();
    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug.calls.mostRecent().args[1]).toEqual({ name: "new" });
    const snapshot = debug.calls.mostRecent().args[1];
    component.formGroup.patchValue({ name: "new" });
    await new Promise((resolve) => setTimeout(resolve, 170));
    expect(debug).toHaveBeenCalledTimes(1);
    component.formGroup.patchValue({ name: "next" });
    await new Promise((resolve) => setTimeout(resolve, 170));
    expect(debug).toHaveBeenCalledTimes(2);
    expect(snapshot).toEqual({ name: "new" });
    component.formGroup.patchValue({ name: "old" });
    await new Promise((resolve) => setTimeout(resolve, 170));
    expect(debug).toHaveBeenCalledTimes(2);
    component.formGroup.patchValue({ name: "next" });
    await new Promise((resolve) => setTimeout(resolve, 170));
    expect(debug).toHaveBeenCalledTimes(3);
    fixture.destroy();
  });
  it("routesDetectedChangesToTheInjectedLogger", async () => {
    const debug = jasmine.createSpy("debug");
    const consoleDebug = spyOn(console, "debug");
    TestBed.configureTestingModule({
      providers: [{ provide: EDIT_ENTITY_LOGGER, useValue: { debug } }],
    });
    const { fixture } = await setup();
    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug.calls.mostRecent().args[1]).toEqual({ name: "new" });
    expect(consoleDebug).not.toHaveBeenCalled();
    fixture.destroy();
  });
  it("keepsDirtyOnFailedUpdate", async () => {
    let fail = true;
    const { component } = await setup({
      update: async () => {
        if (fail) throw Error("offline");
        return true;
      },
    });
    await component.update();
    expect(component.formGroup.isUpdated).toBeTrue();
    expect(component.updating).toBeFalse();
    expect(host.notify).toHaveBeenCalled();
    fail = false;
    await component.update();
    expect(component.formGroup.isUpdated).toBeFalse();
    expect(component.options.record?.name).toBe("new");
  });
  it("acceptsUpdatedRecordFromServer", async () => {
    const { component } = await setup({
      update: async () => ({ _id: "1", name: "SERVER" }),
    });
    await component.update();
    expect(component.options.record?.name).toBe("SERVER");
    expect(component.formGroup.get("name")?.value).toBe("SERVER");
    expect(component.formGroup.isUpdated).toBeFalse();
  });
  it("does not mark false update saved", async () => {
    const { component } = await setup({ update: async () => false });
    await component.update();
    expect(component.formGroup.isUpdated).toBeTrue();
  });
  it("preservesArchiveMetadata", async () => {
    const state = { isArchived: true, user: "user-1" };
    const { component } = await setup({ archive: async () => state });
    await component.archive();
    expect(component.options.record?.__archived).toBe(state);
  });
  it("notifiesConnectionOnceAfterSave and destroys exactly once", async () => {
    const changed = jasmine.createSpy();
    const destroy = jasmine.createSpy();
    const factory = jasmine
      .createSpy()
      .and.returnValue({ recordChanged: changed, destroy });
    const { fixture, component } = await setup(
      { update: async () => ({ _id: "1", name: "SERVER" }) },
      factory,
    );
    expect(changed).toHaveBeenCalledTimes(1);
    await component.update();
    expect(changed).toHaveBeenCalledTimes(2);
    expect(factory).toHaveBeenCalledTimes(1);
    fixture.destroy();
    expect(destroy).toHaveBeenCalledTimes(1);
  });
  it("preventsUnconfirmedClose", async () => {
    host.confirm.and.resolveTo(false);
    const { component } = await setup();
    const close = jasmine.createSpy();
    component.closeRequest.subscribe(close);
    await component.requestClose();
    expect(close).not.toHaveBeenCalled();
  });
  it("isolates connection callback failures from successful save", async () => {
    const { component } = await setup({ update: async () => true }, () => ({
      recordChanged: () => {
        throw Error("integration");
      },
    }));
    await component.update();
    expect(component.formGroup.isUpdated).toBeFalse();
    expect(component.options.record?.name).toBe("new");
  });
  it("creates false then record with complete payload and exact close result", async () => {
    let accepted = false;
    const received: Record<string, unknown>[] = [];
    const server = { _id: "new-id", name: "CREATED" };
    const { component } = await setup(
      {
        create: async (value) => {
          received.push(value);
          return accepted ? server : false;
        },
        closeOnUpsert: true,
      },
      undefined,
      { record: undefined },
    );
    const close = jasmine.createSpy();
    component.closeRequest.subscribe(close);
    await component.create();
    expect(component.formGroup.isUpdated).toBeTrue();
    expect(close).not.toHaveBeenCalled();
    accepted = true;
    await component.create();
    expect(received).toEqual([{ name: "new" }, { name: "new" }]);
    expect(close).toHaveBeenCalledOnceWith({
      updated: true,
      created: true,
      record: server,
    });
  });
  it("passes partial update arguments and exact saved result", async () => {
    const update = jasmine.createSpy().and.resolveTo(true);
    const { component } = await setup({ update });
    const result = jasmine.createSpy();
    component.result.subscribe(result);
    await component.update();
    expect(update).toHaveBeenCalledOnceWith(
      "1",
      { name: "new" },
      component.formGroup,
      component.options,
    );
    expect(result).toHaveBeenCalledOnceWith({
      updated: true,
      record: { _id: "1", name: "new" },
    });
  });
  it("notifies before connection action inputs and cleans replaced options once", async () => {
    let name = "";
    const changed = jasmine
      .createSpy()
      .and.callFake(
        (record: RecordValue | undefined) =>
          (name = record?.name ?? "creation"),
      );
    const destroy = jasmine.createSpy();
    const { fixture, component } = await setup(
      { update: async () => ({ _id: "1", name: "SERVER" }) },
      () => ({
        recordChanged: changed,
        destroy,
        actions: [
          { component: ConnectionAction, input: () => ({ recordName: name }) },
        ],
      }),
    );
    await component.update();
    const action = component.actions()[0];
    expect(
      "componentInputs" in action && action.componentInputs["recordName"],
    ).toBe("SERVER");
    fixture.componentRef.setInput("options", {
      displayOptions: { sections: [] },
      connect: () => ({ recordChanged: changed, destroy }),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(changed.calls.mostRecent().args).toEqual([undefined]);
    fixture.destroy();
    expect(destroy).toHaveBeenCalledTimes(2);
  });
  it("refreshes configured labels when Intl changes", async () => {
    const { fixture, component } = await setup();
    const intl = TestBed.inject(EditEntityDialogIntl);
    intl.messages.update = "Save now";
    intl.changes.next();
    await fixture.whenStable();
    expect(component.updateLabel).toBe("Save now");
  });
  it("does not let a late loader overwrite replacement options", async () => {
    let resolve!: (record: RecordValue) => void;
    const pending = new Promise<RecordValue>((done) => (resolve = done));
    const { fixture, component } = await setup();
    fixture.componentRef.setInput("options", {
      loadRecord: () => pending,
      displayOptions: { sections: [] },
    });
    fixture.detectChanges();
    fixture.componentRef.setInput("options", {
      record: { _id: "fresh", name: "Fresh" },
      displayOptions: { sections: [] },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    resolve({ _id: "old", name: "Late" });
    await pending;
    await fixture.whenStable();
    expect(component.options.record?._id).toBe("fresh");
  });
  function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((done, fail) => {
      resolve = done;
      reject = fail;
    });
    return { promise, resolve, reject };
  }
  async function replaceOptions(
    fixture: Awaited<ReturnType<typeof setup>>["fixture"],
    service: EditEntityComponentOptions<RecordValue>["service"] = {},
    overrides: Partial<EditEntityComponentOptions<RecordValue>> = {},
  ) {
    fixture.componentRef.setInput("options", {
      record: { _id: "B", name: "Replacement" },
      displayOptions: {
        section: {
          id: "replacement",
          label: "Replacement section",
          cards: [
            {
              id: "replacement-card",
              label: "Replacement card",
              fields: [{ kind: "text", name: "name", label: "Name" }],
            },
          ],
        },
      },
      service,
      ...overrides,
    });
    fixture.detectChanges();
    await fixture.whenStable();
  }
  for (const mutation of ["create", "update", "remove", "archive"] as const) {
    it(`ignores ${mutation} A after replacing options and preserves busy operation B`, async () => {
      const first = deferred<never>();
      const second = deferred<boolean>();
      const changed = jasmine.createSpy();
      const { fixture, component } = await setup(
        { [mutation]: () => first.promise },
        undefined,
        mutation === "create" ? { record: undefined } : {},
      );
      const result = jasmine.createSpy();
      const close = jasmine.createSpy();
      component.result.subscribe(result);
      component.closeRequest.subscribe(close);
      const stale = component[mutation]();
      await Promise.resolve();
      await replaceOptions(
        fixture,
        { update: () => second.promise },
        { connect: () => ({ recordChanged: changed }) },
      );
      component.formGroup.patchValue({ name: "B edited" });
      const current = component.update();
      expect(component.updating).toBeTrue();
      first.resolve(
        (mutation === "archive"
          ? { isArchived: true }
          : mutation === "remove"
            ? true
            : { _id: "1", name: "Late A" }) as never,
      );
      await stale;
      expect(component.options.record).toEqual({
        _id: "B",
        name: "Replacement",
      });
      expect(component.formGroup.get("name")?.value).toBe("B edited");
      expect(changed).toHaveBeenCalledTimes(1);
      expect(result).not.toHaveBeenCalled();
      expect(close).not.toHaveBeenCalled();
      expect(host.notify).not.toHaveBeenCalled();
      expect(component.updating).toBeTrue();
      second.resolve(false);
      await current;
      expect(component.updating).toBeFalse();
    });
  }
  for (const mutation of ["remove", "archive", "requestClose"] as const) {
    it(`does not resume ${mutation} confirmation A against replacement B`, async () => {
      const confirmation = deferred<boolean>();
      host.confirm.and.returnValue(confirmation.promise);
      const mutationHandler = jasmine.createSpy().and.resolveTo(true);
      const archiveHandler = jasmine
        .createSpy()
        .and.resolveTo({ isArchived: true });
      const { fixture, component } = await setup({
        remove: mutationHandler,
        archive: archiveHandler,
      });
      const close = jasmine.createSpy();
      component.closeRequest.subscribe(close);
      const operation = component[mutation]();
      await replaceOptions(fixture, {
        remove: mutationHandler,
        archive: archiveHandler,
      });
      confirmation.resolve(true);
      await operation;
      expect(mutationHandler).not.toHaveBeenCalled();
      expect(archiveHandler).not.toHaveBeenCalled();
      expect(close).not.toHaveBeenCalled();
      expect(component.options.record?._id).toBe("B");
    });
  }
  it("ignores stale removable state and initialization after replacement", async () => {
    const removable = deferred<boolean>();
    const { fixture, component } = await setup({
      isRemovable: () => removable.promise,
    });
    await replaceOptions(fixture, { isRemovable: false });
    removable.resolve(true);
    await removable.promise;
    await fixture.whenStable();
    expect(component.isRemovable).toEqual({ removable: false });
    expect(component.loading).toBeFalse();
  });
  for (const outcome of ["resolve", "reject"] as const) {
    it(`ignores update ${outcome} after destruction`, async () => {
      const response = deferred<RecordValue>();
      const { fixture, component } = await setup({
        update: () => response.promise,
      });
      const record = component.options.record;
      const result = jasmine.createSpy();
      const close = jasmine.createSpy();
      component.result.subscribe(result);
      component.closeRequest.subscribe(close);
      const operation = component.update();
      fixture.destroy();
      if (outcome === "resolve") response.resolve({ _id: "1", name: "Late" });
      else response.reject(new Error("late failure"));
      await operation;
      expect(component.options.record).toBe(record);
      expect(result).not.toHaveBeenCalled();
      expect(close).not.toHaveBeenCalled();
      expect(host.notify).not.toHaveBeenCalled();
    });
  }
  for (const branch of ["button", "card", "menu"] as const) {
    it(`ignores stale ${branch} action results and finalization`, async () => {
      const response = deferred<RecordValue>();
      const busy = deferred<boolean>();
      const { fixture, component } = await setup();
      const close = jasmine.createSpy();
      component.closeRequest.subscribe(close);
      const action = {
        type: "button" as const,
        label: "Deferred",
        closeOnHandle: true,
        isVisible: true,
        isDisabled: false,
        handle: () => response.promise,
        handler: () => response.promise,
        menuHandler: () => response.promise,
      };
      let operation: Promise<void>;
      if (branch === "button") operation = component.handleAction(action);
      else {
        const section = component.renderState().sections![0];
        const card = section.items.find((item) => item.type === "card")!;
        if (card.type !== "card") throw new Error("Missing card");
        const option = {
          id: "one",
          label: "One",
          isVisible: true,
          isDisabled: false,
        };
        operation =
          branch === "card"
            ? component.handleCardAction(card, action, section.source)
            : component.handleCardMenuOption(
                card,
                { ...action, runtimeMenuOptions: [option] },
                option,
                section.source,
              );
      }
      await Promise.resolve();
      await replaceOptions(fixture, { update: () => busy.promise });
      const current = component.update();
      expect(component.updating).toBeTrue();
      response.resolve({ _id: "1", name: "Late action" });
      await operation;
      expect(component.options.record?._id).toBe("B");
      expect(component.updating).toBeTrue();
      expect(close).not.toHaveBeenCalled();
      busy.resolve(false);
      await current;
    });
  }
  it("renders a safely initialized visibility stream before its first external emission", async () => {
    const visible = new Subject<boolean>();
    const { fixture, component } = await setup({}, undefined, {
      displayOptions: {
        section: {
          id: "protected",
          label: "Protected section",
          visible: visible.pipe(startWith(false)),
          cards: [
            { id: "protected-card", label: "Protected card", fields: [] },
          ],
        },
      },
    });
    expect(fixture.nativeElement.textContent).not.toContain("Protected card");
    visible.next(true);
    expect(visible.observed).toBeTrue();
    expect(component.renderState().sections?.length).toBe(1);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Protected card");
    visible.next(false);
    expect(component.renderState().sections?.length).toBe(0);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain("Protected card");
  });
  for (const target of ["section", "tab", "card"] as const) {
    it(`renders asynchronous ${target} visibility changes after stabilization`, async () => {
      const visible = new Subject<boolean>();
      const section = {
        id: "protected-section",
        label: "Protected section",
        ...(target === "section"
          ? { visible: visible.pipe(startWith(true)) }
          : {}),
        cards: [
          {
            id: "protected-card",
            label: "Protected card",
            fields: [],
            ...(target === "card"
              ? { visible: visible.pipe(startWith(true)) }
              : {}),
          },
        ],
      };
      const { fixture } = await setup({}, undefined, {
        displayOptions:
          target === "tab"
            ? {
                tabs: [
                  {
                    label: "Protected tab",
                    visible: visible.pipe(startWith(true)),
                    displayOptions: { section },
                  },
                ],
              }
            : { section },
      });
      await fixture.whenStable();
      const content = (): string => fixture.nativeElement.textContent;
      expect(content()).toContain("Protected card");
      visible.next(false);
      await fixture.whenStable();
      expect(content()).not.toContain("Protected card");
      if (target === "tab") expect(content()).not.toContain("Protected tab");
      visible.next(true);
      await fixture.whenStable();
      expect(content()).toContain("Protected card");
    });
  }
  for (const position of ["top", "bottom", "bottom-end", "card"] as const) {
    it(`renders asynchronous ${position} action visibility and disabled changes`, async () => {
      const visible = new Subject<boolean>();
      const disabled = new Subject<boolean>();
      const state = {
        label: "Conditional action",
        visible: visible.pipe(startWith(false)),
        disabled: disabled.pipe(startWith(false)),
      };
      const { fixture } = await setup(
        {},
        undefined,
        position === "card"
          ? {
              displayOptions: {
                section: {
                  id: "s",
                  label: "Main",
                  cards: [
                    {
                      id: "c",
                      label: "Card",
                      fields: [],
                      actions: [{ ...state, type: "button" }],
                    },
                  ],
                },
              },
            }
          : { actions: [{ ...state, position, handle: () => undefined }] },
      );
      await fixture.whenStable();
      const actionButton = (): HTMLButtonElement | undefined =>
        Array.from(
          fixture.nativeElement.querySelectorAll(
            "button",
          ) as NodeListOf<HTMLButtonElement>,
        ).find((button) => button.textContent?.includes("Conditional action"));
      expect(actionButton()).toBeUndefined();
      visible.next(true);
      await fixture.whenStable();
      expect(actionButton()).toBeDefined();
      expect(actionButton()?.disabled).toBeFalse();
      disabled.next(true);
      await fixture.whenStable();
      expect(actionButton()?.disabled).toBeTrue();
      disabled.next(false);
      await fixture.whenStable();
      expect(actionButton()?.disabled).toBeFalse();
      visible.next(false);
      await fixture.whenStable();
      expect(actionButton()).toBeUndefined();
    });
  }
  for (const branch of ["button", "card", "menu"] as const) {
    it(`keeps dirty values and the dialog open when the ${branch} action rejects`, async () => {
      const { component } = await setup();
      const close = jasmine.createSpy();
      component.closeRequest.subscribe(close);
      const failed = async (): Promise<never> => {
        throw new Error("action failed");
      };
      if (branch === "button")
        await component.handleAction({
          handle: failed,
          closeOnHandle: true,
          isVisible: true,
          isDisabled: false,
        });
      else {
        const section = component.renderState().sections?.[0];
        const card = section?.items.find((item) => item.type === "card");
        if (!section || !card || card.type !== "card")
          throw new Error("Missing real rendered card");
        const option = {
          id: "retry",
          label: "Retry",
          isVisible: true,
          isDisabled: false,
        };
        const action = {
          type: "button" as const,
          label: "Fail",
          closeOnHandle: true,
          isVisible: true,
          isDisabled: false,
          handler: failed,
          menuHandler: failed,
          ...(branch === "menu" ? { runtimeMenuOptions: [option] } : {}),
        };
        if (branch === "card")
          await component.handleCardAction(card, action, section.source);
        else
          await component.handleCardMenuOption(
            card,
            action,
            option,
            section.source,
          );
      }
      expect(close).not.toHaveBeenCalled();
      expect(host.notify).toHaveBeenCalled();
      expect(component.formGroup.requireControl("name").value).toBe("new");
      expect(component.formGroup.isUpdated).toBeTrue();
      expect(component.updating).toBeFalse();
    });
  }
});
