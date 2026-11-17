import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ButtonSelectComponent } from "./button-select.component";

@Component({
  imports: [FormsModule, ButtonSelectComponent],
  template: `<ame-button-select [(ngModel)]="width" [items]="items" />`,
})
class ModelHost {
  width: string | null = "50%";
  readonly items = [
    { value: "50%", label: "Half" },
    { value: "100%", label: "Full" },
  ];
}

@Component({
  imports: [ReactiveFormsModule, ButtonSelectComponent],
  template: `<form [formGroup]="form">
    <ame-button-select formControlName="width" [items]="items" />
  </form>`,
})
class ReactiveHost {
  readonly form = new FormGroup({
    width: new FormControl<string | null>("50%"),
  });
  readonly items = [
    { value: "50%", label: "Half" },
    { value: "100%", label: "Full" },
  ];
}

describe("ButtonSelectComponent", () => {
  it("propagates selection through ngModel and follows external resets", async () => {
    const fixture = TestBed.createComponent(ModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const control = fixture.debugElement.query(
      By.directive(ButtonSelectComponent),
    ).componentInstance as ButtonSelectComponent<string>;
    expect(fixture.nativeElement.querySelector("button").textContent).toContain(
      "Half",
    );
    control.select("100%");
    expect(fixture.componentInstance.width).toBe("100%");
    fixture.componentInstance.width = null;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(control.value()).toBeNull();
    fixture.destroy();
  });

  it("marks the parent dirty and touched, rejects disabled selection and closes the overlay on disable", async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.debugElement.query(
      By.directive(ButtonSelectComponent),
    ).componentInstance as ButtonSelectComponent<string>;
    const control = fixture.componentInstance.form.controls.width;
    component.select("100%");
    expect(control.value).toBe("100%");
    expect(control.dirty).toBeTrue();
    expect(control.touched).toBeTrue();
    component.toggle();
    expect(component.isOpen()).toBeTrue();
    control.disable();
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
    expect(fixture.nativeElement.querySelector("button").disabled).toBeTrue();
    component.select("50%");
    expect(control.value).toBe("100%");
    control.enable();
    control.reset("50%");
    fixture.detectChanges();
    expect(component.value()).toBe("50%");
    expect(fixture.nativeElement.querySelector("button").textContent).toContain(
      "Half",
    );
    fixture.destroy();
  });

  it("renders only alternate options in the overlay and updates options after input replacement", async () => {
    const fixture = TestBed.createComponent(ButtonSelectComponent<string>);
    fixture.componentRef.setInput("items", [
      { value: "50%", label: "Half" },
      { value: "100%", label: "Full" },
    ]);
    fixture.componentInstance.writeValue("50%");
    fixture.detectChanges();
    fixture.nativeElement.querySelector("button").click();
    fixture.detectChanges();
    await fixture.whenStable();
    const options = document.querySelectorAll(".button-select-column button");
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain("Full");
    (options[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe("100%");
    expect(fixture.componentInstance.isOpen()).toBeFalse();
    fixture.componentRef.setInput("items", [
      { value: "100%", label: "Whole" },
      { value: "25%", label: "Quarter" },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("button").textContent).toContain(
      "Whole",
    );
    expect(
      fixture.componentInstance.availableItems().map((item) => item.value),
    ).toEqual(["25%"]);
    fixture.destroy();
  });
});
