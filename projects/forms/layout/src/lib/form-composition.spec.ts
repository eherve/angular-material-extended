import {
  Component,
  input,
  provideZonelessChangeDetection,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import {
  EditEntityCard,
  EditEntityFormControl,
  EditEntityFormGroup,
} from "@eherve/angular-material-forms/core";
import { FormFieldComponent } from "@eherve/angular-material-forms/fields";
import { BehaviorSubject } from "rxjs";
import { FormCardComponent } from "./form-card.component";
import { StandaloneFormCompositionDemo } from "../../testing/standalone-form-composition-demo.component";

@Component({
  selector: "composition-business-card",
  template: "{{ record()?.name }}",
})
class BusinessCard {
  readonly record = input<{ _id?: string; name: string }>();
  readonly formGroup = input<EditEntityFormGroup>();
  readonly extra = input<string>();
  readonly markUpdated = input<() => void>();
}

describe("standalone configured form composition", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [StandaloneFormCompositionDemo, FormCardComponent, BusinessCard],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }),
  );
  it("shares caller controls across two cards and an independent field without nested forms", async () => {
    const fixture = TestBed.createComponent(StandaloneFormCompositionDemo);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const cards = fixture.debugElement.queryAll(
      By.directive(FormCardComponent),
    );
    const fields = fixture.debugElement.queryAll(
      By.directive(FormFieldComponent),
    );
    expect(cards.length).toBe(2);
    expect(fields.length).toBe(3);
    expect(
      cards.every(
        (card) => card.componentInstance.formGroup() === component.form,
      ),
    ).toBeTrue();
    expect(
      fields.every(
        (field) => field.componentInstance.formGroup() === component.form,
      ),
    ).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll("form").length).toBe(0);
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input");
    input.value = "Grace";
    input.dispatchEvent(new Event("input"));
    expect(component.form.get("name")?.value).toBe("Grace");
  });
  it("replaces card/form/record inputs without retaining old controls or section cards", async () => {
    const fixture = TestBed.createComponent(FormCardComponent);
    const first = new EditEntityFormGroup({
      name: new EditEntityFormControl("first"),
    });
    const second = new EditEntityFormGroup({
      city: new EditEntityFormControl("Paris"),
    });
    fixture.componentRef.setInput("card", {
      id: "a",
      label: "First",
      fields: [{ kind: "text", name: "name", label: "Name" }],
    });
    fixture.componentRef.setInput("formGroup", first);
    fixture.detectChanges();
    await fixture.whenStable();
    const replacement: EditEntityCard = {
      id: "b",
      label: "Replacement",
      fields: [{ kind: "text", name: "city", label: "City" }],
    };
    fixture.componentRef.setInput("card", replacement);
    fixture.componentRef.setInput("formGroup", second);
    fixture.componentRef.setInput("record", { _id: "b", city: "Paris" });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Replacement");
    expect(fixture.nativeElement.textContent).not.toContain("First");
    const field = fixture.debugElement.query(
      By.directive(FormFieldComponent),
    ).componentInstance;
    expect(field.formGroup()).toBe(second);
    expect(field.field().name).toBe("city");
    first.setValue({ name: "obsolete" });
    await fixture.whenStable();
    expect(fixture.componentInstance.formGroup()).toBe(second);
    fixture.destroy();
    first.destroy();
    second.destroy();
  });
  it("refreshes visibility from form values and observable conditions with OnPush", async () => {
    const fixture = TestBed.createComponent(FormCardComponent);
    const visible = new BehaviorSubject(true);
    const form = new EditEntityFormGroup({
      name: new EditEntityFormControl("show"),
    });
    fixture.componentRef.setInput("formGroup", form);
    fixture.componentRef.setInput("card", {
      id: "a",
      label: "Conditional",
      visible,
      fields: [{ kind: "text", name: "name", label: "Name" }],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("article")).not.toBeNull();
    visible.next(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("article")).toBeNull();
    visible.next(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("article")).not.toBeNull();
    fixture.destroy();
    form.destroy();
  });
  it("honors hidden fields on caller controls and reevaluates function and observable visibility", async () => {
    const fixture = TestBed.createComponent(FormCardComponent);
    const visible = new BehaviorSubject(false);
    const form = new EditEntityFormGroup({
      name: new EditEntityFormControl("hide"),
      secret: new EditEntityFormControl("secret"),
      conditional: new EditEntityFormControl("value"),
      observable: new EditEntityFormControl("value"),
    });
    fixture.componentRef.setInput("formGroup", form);
    fixture.componentRef.setInput("card", {
      id: "visibility",
      label: "Visibility",
      fields: [
        { kind: "text", name: "name", label: "Name" },
        { kind: "text", name: "secret", label: "Secret", visible: false },
        {
          kind: "text",
          name: "conditional",
          label: "Conditional",
          visible: (_record: unknown, current: EditEntityFormGroup) =>
            current.get("name")?.value === "show",
        },
        { kind: "text", name: "observable", label: "Observable", visible },
      ],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const names = (): string[] =>
      fixture.debugElement
        .queryAll(By.directive(FormFieldComponent))
        .map((field) => field.componentInstance.field().name);
    expect(names()).toEqual(["name"]);
    form.get("name")?.setValue("show");
    visible.next(true);
    await fixture.whenStable();
    expect(names()).toEqual(["name", "conditional", "observable"]);
    expect(form.get("secret")?.value).toBe("secret");
    fixture.destroy();
    form.destroy();
  });
  it("passes the same record and form to injected business components and emits configured action context", async () => {
    const fixture = TestBed.createComponent(FormCardComponent);
    const form = new EditEntityFormGroup({
      name: new EditEntityFormControl("Ada"),
    });
    const record = { _id: "1", name: "Ada" };
    const card: EditEntityCard<typeof record> = {
      id: "business",
      label: "Business",
      kind: "component",
      component: BusinessCard,
      input: (context) => ({
        record: context.record,
        formGroup: context.formGroup,
        extra: "context",
      }),
      actions: [{ id: "inspect", type: "button", label: "Inspect" }],
    };
    fixture.componentRef.setInput("card", card);
    fixture.componentRef.setInput("formGroup", form);
    fixture.componentRef.setInput("record", record);
    fixture.detectChanges();
    await fixture.whenStable();
    const business = fixture.debugElement.query(
      By.directive(BusinessCard),
    ).componentInstance;
    expect(business.record()).toBe(record);
    expect(business.formGroup()).toBe(form);
    expect(business.extra()).toBe("context");
    const updated = jasmine.createSpy();
    fixture.componentInstance.updated.subscribe(updated);
    business.markUpdated()?.();
    expect(updated).toHaveBeenCalledTimes(1);
    const requested = jasmine.createSpy();
    fixture.componentInstance.actionRequested.subscribe(requested);
    fixture.nativeElement.querySelector(".edit-entity-card-action").click();
    expect(requested).toHaveBeenCalledWith(
      jasmine.objectContaining({
        record,
        formGroup: form,
        card,
        action: jasmine.objectContaining({ id: "inspect" }),
      }),
    );
    fixture.destroy();
    form.destroy();
  });
});
