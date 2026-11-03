import { provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { BehaviorSubject, Subject, defer, of } from "rxjs";
import { EditEntityFormGroup } from "@eherve/angular-material-forms/core";
import { EditEntityFormField } from "@eherve/angular-material-forms/core";
import { FormFieldComponent } from "./edit-entity-field-renderer.component";

describe("FormFieldComponent dynamic hints", () => {
  async function setup(hint: EditEntityFormField["hint"]) {
    TestBed.configureTestingModule({
      imports: [FormFieldComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    });
    const form = new EditEntityFormGroup({ name: new FormControl("initial") });
    const fixture = TestBed.createComponent(FormFieldComponent);
    fixture.componentRef.setInput("formGroup", form);
    fixture.componentRef.setInput("record", { _id: "record-1" });
    fixture.componentRef.setInput("field", {
      kind: "text",
      name: "name",
      label: "Name",
      hint,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const renderedHint = (): string =>
      (fixture.nativeElement as HTMLElement)
        .querySelector("mat-hint")
        ?.textContent?.trim() ?? "";
    return { fixture, form, renderedHint };
  }

  it("renders callback results with the current record and form values", async () => {
    const { fixture, form, renderedHint } = await setup(
      (record, group) => `${record?._id}: ${group.get("name")?.value}`,
    );
    expect(renderedHint()).toBe("record-1: initial");
    form.get("name")!.setValue("changed");
    await fixture.whenStable();
    expect(renderedHint()).toBe("record-1: changed");
    fixture.componentRef.setInput("record", { _id: "record-2" });
    await fixture.whenStable();
    expect(renderedHint()).toBe("record-2: changed");
    form.destroy();
  });

  it("tracks signals changed asynchronously without a form event", async () => {
    const duplicate = signal(false);
    const { fixture, form, renderedHint } = await setup(() =>
      duplicate() ? "Duplicate SIRET" : undefined,
    );
    expect(renderedHint()).toBe("");
    await Promise.resolve().then(() => duplicate.set(true));
    await fixture.whenStable();
    expect(renderedHint()).toBe("Duplicate SIRET");
    duplicate.set(false);
    await fixture.whenStable();
    expect(renderedHint()).toBe("");
    form.destroy();
  });

  it("renders observable values and unsubscribes when the field is replaced or destroyed", async () => {
    const hint = new BehaviorSubject<string | undefined>("First");
    const { fixture, form, renderedHint } = await setup(hint);
    expect(renderedHint()).toBe("First");
    hint.next("Second");
    await fixture.whenStable();
    expect(renderedHint()).toBe("Second");
    fixture.componentRef.setInput("field", {
      kind: "text",
      name: "name",
      label: "Name",
      hint: "Static",
    });
    await fixture.whenStable();
    expect(renderedHint()).toBe("Static");
    expect(hint.observed).toBeFalse();
    fixture.componentRef.setInput("field", {
      kind: "text",
      name: "name",
      label: "Name",
      hint,
    });
    await fixture.whenStable();
    expect(hint.observed).toBeTrue();
    fixture.destroy();
    expect(hint.observed).toBeFalse();
    form.destroy();
  });
  it("clears the previous hint while a replacement observable has not emitted", async () => {
    const { fixture, form, renderedHint } = await setup("Old hint");
    const nextHint = new Subject<string | undefined>();
    fixture.componentRef.setInput("field", {
      kind: "text",
      name: "name",
      label: "Name",
      hint: nextHint,
    });
    await fixture.whenStable();
    expect(renderedHint()).toBe("");
    nextHint.next("New hint");
    await fixture.whenStable();
    expect(renderedHint()).toBe("New hint");
    form.destroy();
  });

  it("preserves select options when only the hint changes", async () => {
    const hint = new BehaviorSubject<string | undefined>("First hint");
    const { fixture, form, renderedHint } = await setup(undefined);
    let loads = 0;
    fixture.componentRef.setInput("field", {
      kind: "select",
      name: "name",
      label: "Name",
      hint,
      options: defer(() => of([{ value: "initial", name: `Load ${++loads}` }])),
    });
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector("mat-select")
        ?.textContent,
    ).toContain("Load 1");
    hint.next("Second hint");
    await fixture.whenStable();
    expect(renderedHint()).toBe("Second hint");
    expect(
      (fixture.nativeElement as HTMLElement).querySelector("mat-select")
        ?.textContent,
    ).toContain("Load 1");
    form.destroy();
  });
});

describe("FormFieldComponent direct visibility", () => {
  async function setup(visible: EditEntityFormField["visible"]) {
    TestBed.configureTestingModule({
      imports: [FormFieldComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    });
    const control = new FormControl("initial");
    const form = new EditEntityFormGroup({ name: control });
    const fixture = TestBed.createComponent(FormFieldComponent);
    const field: EditEntityFormField = {
      kind: "text",
      name: "name",
      label: "Name",
      visible,
    };
    fixture.componentRef.setInput("formGroup", form);
    fixture.componentRef.setInput("field", field);
    fixture.componentRef.setInput("record", { _id: "first" });
    fixture.detectChanges();
    await fixture.whenStable();
    const rendered = (): boolean =>
      !!(fixture.nativeElement as HTMLElement).querySelector("input");
    return { control, form, fixture, field, rendered };
  }

  it("hides a false field without changing or replacing caller controls", async () => {
    const { control, form, fixture, field, rendered } = await setup(false);
    expect(rendered()).toBeFalse();
    expect(form.controls["name"]).toBe(control);
    expect(control.enabled).toBeTrue();
    expect(control.value).toBe("initial");
    fixture.componentRef.setInput("field", { ...field, visible: true });
    await fixture.whenStable();
    expect(rendered()).toBeTrue();
    expect(form.controls["name"]).toBe(control);
    fixture.destroy();
    expect(control.enabled).toBeTrue();
    form.destroy();
  });

  it("reevaluates callbacks for form values and record input replacement", async () => {
    const { form, fixture, rendered } = await setup(
      (record, group) =>
        record?._id === "second" && group.get("name")?.value === "shown",
    );
    expect(rendered()).toBeFalse();
    form.get("name")!.setValue("shown");
    await fixture.whenStable();
    expect(rendered()).toBeFalse();
    fixture.componentRef.setInput("record", { _id: "second" });
    await fixture.whenStable();
    expect(rendered()).toBeTrue();
    form.get("name")!.setValue("hidden");
    await fixture.whenStable();
    expect(rendered()).toBeFalse();
    fixture.destroy();
    form.destroy();
  });

  it("tracks Observable visibility and disconnects replaced inputs and destroyed views", async () => {
    const visibility = new BehaviorSubject(false);
    const { form, fixture, field, rendered } = await setup(visibility);
    expect(rendered()).toBeFalse();
    visibility.next(true);
    await fixture.whenStable();
    expect(rendered()).toBeTrue();
    const replacement = new BehaviorSubject(false);
    fixture.componentRef.setInput("field", { ...field, visible: replacement });
    await fixture.whenStable();
    expect(visibility.observed).toBeFalse();
    expect(rendered()).toBeFalse();
    visibility.next(true);
    await fixture.whenStable();
    expect(rendered()).toBeFalse();
    replacement.next(true);
    await fixture.whenStable();
    expect(rendered()).toBeTrue();
    fixture.destroy();
    expect(replacement.observed).toBeFalse();
    form.destroy();
  });
});
