import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { By } from "@angular/platform-browser";
import { FormControlAutocompleteComponent } from "./autocomplete.component";
import { FormControlAutocompleteService } from "./search-control-base";

const service: FormControlAutocompleteService<string> = {
  display: (value) => ({
    name: `Label ${value}`,
    prefix: "<b>Prefix</b>",
    prefixColor: "rgb(1, 2, 3)",
  }),
  search: async () => ({ data: ["a", "b"], matchCount: 2 }),
  group: () => "Group",
};

@Component({
  imports: [ReactiveFormsModule, FormControlAutocompleteComponent],
  template: `<app-form-control-autocomplete
    [formControl]="control"
    [service]="service"
    required
  />`,
})
class ReactiveHost {
  control = new FormControl<string | null>(null);
  readonly service = service;
}

@Component({
  imports: [FormsModule, FormControlAutocompleteComponent],
  template: `<app-form-control-autocomplete
    [(ngModel)]="value"
    [service]="service"
    [multiple]="true"
  />`,
})
class ModelHost {
  value: string[] | null = ["a"];
  readonly service = service;
}

describe("Shared standalone autocomplete Forms contract", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }),
  );

  it("propagates selection and reset with real reactive CVA and renders required errors", async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.debugElement.query(
      By.directive(FormControlAutocompleteComponent),
    ).componentInstance as FormControlAutocompleteComponent<string>;
    component.select("a");
    expect(fixture.componentInstance.control.value).toBe("a");
    expect(fixture.componentInstance.control.dirty).toBeTrue();
    expect(fixture.componentInstance.control.touched).toBeTrue();
    expect(component.control).toBe(fixture.componentInstance.control);
    fixture.componentInstance.control.reset();
    fixture.componentInstance.control.markAllAsTouched();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("input").value).toBe("");
    expect(fixture.nativeElement.querySelector("mat-error")).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        "mat-form-field.mat-form-field-invalid",
      ),
    ).not.toBeNull();
    fixture.destroy();
  });

  it("disconnects a retired reactive control and follows current disabled/error events", async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const retired = fixture.componentInstance.control;
    const current = new FormControl<string | null>("b", Validators.required);
    fixture.componentInstance.control = current;
    fixture.detectChanges();
    await fixture.whenStable();
    retired.setValue("a");
    retired.disable();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("input").value).toBe("Label b");
    expect(fixture.nativeElement.querySelector("input").disabled).toBeFalse();
    current.reset();
    current.markAllAsTouched();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("mat-error")).not.toBeNull();
    current.disable();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("input").disabled).toBeTrue();
    fixture.destroy();
  });

  it("uses chips for ngModel multiple selections and copies selection/remove/reorder values", async () => {
    const fixture = TestBed.createComponent(ModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const original = fixture.componentInstance.value;
    const component = fixture.debugElement.query(
      By.directive(FormControlAutocompleteComponent),
    ).componentInstance as FormControlAutocompleteComponent<string>;
    expect(fixture.nativeElement.querySelectorAll("mat-chip-row").length).toBe(
      1,
    );
    component.select("b");
    expect(fixture.componentInstance.value).toEqual(["a", "b"]);
    expect(original).toEqual(["a"]);
    component.drop({ previousIndex: 1, currentIndex: 0 });
    expect(fixture.componentInstance.value).toEqual(["b", "a"]);
    component.remove(1);
    expect(fixture.componentInstance.value).toEqual(["b"]);
    fixture.destroy();
  });

  for (const selectionLayout of ["chips", "rows"] as const) {
    it(`renders current direct-control required state in ${selectionLayout} layout after silent input changes`, async () => {
      const fixture = TestBed.createComponent(
        FormControlAutocompleteComponent<string>,
      );
      const control = new FormControl<unknown>([]);
      control.markAllAsTouched();
      fixture.componentRef.setInput("control", control);
      fixture.componentRef.setInput("service", service);
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("selectionLayout", selectionLayout);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.componentRef.setInput("required", true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector("mat-error")).not.toBeNull();
      fixture.componentRef.setInput("required", false);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector("mat-error")).toBeNull();
      control.setValue(["b"], { emitEvent: false });
      fixture.componentRef.setInput("value", ["b"]);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(
        fixture.nativeElement.querySelector(".selected-name").textContent,
      ).toContain("Label b");
      expect(
        (
          fixture.nativeElement.querySelector(
            ".selected-name small",
          ) as HTMLElement
        ).style.color,
      ).toBe("rgb(1, 2, 3)");
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();
      const replacement = new FormControl<unknown>(["a"]);
      fixture.componentRef.setInput("control", replacement);
      fixture.detectChanges();
      expect(replacement.disabled).toBeTrue();
      expect(fixture.nativeElement.querySelector("input").disabled).toBeTrue();
      fixture.destroy();
    });
  }
});
