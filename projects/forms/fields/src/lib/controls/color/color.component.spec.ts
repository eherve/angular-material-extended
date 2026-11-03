import { TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { FormControlColorComponent } from "./color.component";

describe("Color control", () => {
  it("copies contrast edits, respects disabled and follows external reset", () => {
    const fixture = TestBed.createComponent(FormControlColorComponent);
    const original = { hex: "#ffffff", contrast: "#000000" };
    const control = new FormControl(original);
    fixture.componentRef.setInput("control", control);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.setContrast("#ffffff");
    expect(original.contrast).toBe("#000000");
    expect(control.value?.contrast).toBe("#ffffff");
    control.disable();
    component.clearValue();
    expect(control.value).not.toBeNull();
    control.enable();
    control.reset();
    expect(component.value()).toBeNull();
    fixture.destroy();
  });
});

import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { By } from "@angular/platform-browser";

@Component({
  imports: [ReactiveFormsModule, FormControlColorComponent],
  template: `<ame-color-picker [formControl]="control" />`,
})
class ColorReactiveHost {
  control = new FormControl<{ hex: string; contrast: string } | null>(
    null,
    Validators.required,
  );
}

@Component({
  imports: [FormsModule, FormControlColorComponent],
  template: `<ame-color-picker [(ngModel)]="color" />`,
})
class ColorModelHost {
  color: { hex: string; contrast: string } | null = null;
}

describe("Color binding modes", () => {
  it("renders inline as a menu button and keeps the palette out of the document until opened", () => {
    const fixture = TestBed.createComponent(FormControlColorComponent);
    fixture.componentRef.setInput("inline", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("mat-form-field")).toBeNull();
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Couleur"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector(".palette")).toBeNull();
    fixture.destroy();
  });

  it("reacts to required/touched/reset and disabled changes with a normal reactive formControl", async () => {
    const fixture = TestBed.createComponent(ColorReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.debugElement.query(
      By.directive(FormControlColorComponent),
    ).componentInstance as FormControlColorComponent;
    const control = fixture.componentInstance.control;
    control.markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("mat-error")).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        "mat-form-field.mat-form-field-invalid",
      ),
    ).not.toBeNull();
    expect(component.hasRequiredError()).toBeTrue();
    expect(component.errorMatcher.isErrorState(null, null)).toBeTrue();
    component.setColor("#ffffff");
    expect(control.value).toEqual({ hex: "#ffffff", contrast: "#000000" });
    control.disable();
    component.setColor("#000000");
    expect(control.value?.hex).toBe("#ffffff");
    control.enable();
    control.reset();
    expect(component.value()).toBeNull();
    control.setValidators(() => ({ custom: true }));
    control.updateValueAndValidity();
    fixture.detectChanges();
    expect(component.hasRequiredError()).toBeFalse();
    fixture.destroy();
  });

  it("propagates color choice and clearing through ngModel", async () => {
    const fixture = TestBed.createComponent(ColorModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.debugElement.query(
      By.directive(FormControlColorComponent),
    ).componentInstance as FormControlColorComponent;
    component.setColor("#000000");
    expect(fixture.componentInstance.color).toEqual({
      hex: "#000000",
      contrast: "#ffffff",
    });
    component.clearValue();
    expect(fixture.componentInstance.color).toBeNull();
    fixture.destroy();
  });
});

describe("Color binding replacement and required transitions", () => {
  it("disconnects a retired formControl directive control and renders current required errors", async () => {
    const fixture = TestBed.createComponent(ColorReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const retired = host.control;
    const current = new FormControl<{ hex: string; contrast: string } | null>(
      { hex: "#2196f3", contrast: "#ffffff" },
      Validators.required,
    );
    host.control = current;
    fixture.detectChanges();
    await fixture.whenStable();
    retired.setValue({ hex: "#000000", contrast: "#ffffff" });
    retired.disable();
    const component = fixture.debugElement.query(
      By.directive(FormControlColorComponent),
    ).componentInstance as FormControlColorComponent;
    expect(component.value()?.hex).toBe("#2196f3");
    expect(component.isDisabled()).toBeFalse();
    current.setValue(null);
    current.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("mat-error")).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        "mat-form-field.mat-form-field-invalid",
      ),
    ).not.toBeNull();
    fixture.destroy();
  });

  it("renders direct required false→true→false on the same touched control", async () => {
    const fixture = TestBed.createComponent(FormControlColorComponent);
    const control = new FormControl<{ hex: string; contrast: string } | null>(
      null,
    );
    control.markAllAsTouched();
    fixture.componentRef.setInput("control", control);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector("mat-label").textContent,
    ).toContain("Couleur");
    expect(fixture.nativeElement.querySelector("mat-error")).toBeNull();
    fixture.componentRef.setInput("required", true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("mat-error")).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        "mat-form-field.mat-form-field-invalid",
      ),
    ).not.toBeNull();
    fixture.componentRef.setInput("required", false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("mat-error")).toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        "mat-form-field.mat-form-field-invalid",
      ),
    ).toBeNull();
    fixture.destroy();
  });
});
