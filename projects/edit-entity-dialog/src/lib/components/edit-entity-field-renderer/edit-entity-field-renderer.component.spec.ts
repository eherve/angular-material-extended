import { provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { BehaviorSubject, Subject, defer, of } from "rxjs";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityDialogModule } from "../../edit-entity-dialog.module";
import { EditEntityFormField } from "../../edit-entity-dialog.types";
import { EditEntityFieldRendererComponent } from "./edit-entity-field-renderer.component";

describe("EditEntityFieldRendererComponent dynamic hints", () => {
  async function setup(hint: EditEntityFormField["hint"]) {
    TestBed.configureTestingModule({
      imports: [EditEntityDialogModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    });
    const form = new EditEntityFormGroup({ name: new FormControl("initial") });
    const fixture = TestBed.createComponent(EditEntityFieldRendererComponent);
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
