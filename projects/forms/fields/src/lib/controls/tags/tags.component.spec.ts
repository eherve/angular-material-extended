import { TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { Subject } from "rxjs";
import { FormControlTagsComponent } from "./tags.component";

describe("Tags control", () => {
  it("trims and deduplicates without mutating input and follows replacement controls", () => {
    const fixture = TestBed.createComponent(FormControlTagsComponent);
    const original = ["Été"];
    const first = new FormControl(original, { nonNullable: true });
    fixture.componentRef.setInput("control", first);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.addTag(" ete ");
    component.addTag(" Nouveau ");
    expect(original).toEqual(["Été"]);
    expect(first.value).toEqual(["Été", "Nouveau"]);
    const second = new FormControl(["Other"], { nonNullable: true });
    fixture.componentRef.setInput("control", second);
    fixture.detectChanges();
    first.setValue(["stale"]);
    expect(component.value()).toEqual(["Other"]);
    second.disable();
    component.remove(0);
    expect(second.value).toEqual(["Other"]);
    fixture.destroy();
  });

  it("replaces observable options subscriptions and filters accents and selected values", () => {
    const fixture = TestBed.createComponent(FormControlTagsComponent);
    const first = new Subject<{ name: string; value: string }[]>();
    const second = new Subject<{ name: string; value: string }[]>();
    fixture.componentRef.setInput("options", first);
    fixture.detectChanges();
    first.next([{ name: "Été", value: "Été" }]);
    expect(fixture.componentInstance.filteredOptions().length).toBe(1);
    fixture.componentRef.setInput("options", second);
    fixture.detectChanges();
    first.next([{ name: "stale", value: "stale" }]);
    second.next([{ name: "Hiver", value: "Hiver" }]);
    expect(fixture.componentInstance.filteredOptions()[0].value).toBe("Hiver");
    fixture.destroy();
    expect(second.observed).toBeFalse();
  });
});

import { Component } from "@angular/core";
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { By } from "@angular/platform-browser";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";

@Component({
  imports: [ReactiveFormsModule, FormControlTagsComponent],
  template: `<form [formGroup]="form">
    <ame-tags-input formControlName="tags" [options]="options" />
  </form>`,
})
class TagsReactiveHost {
  readonly form = new FormGroup({
    tags: new FormControl<string[]>([], { nonNullable: true }),
  });
  readonly options = [
    { name: "Été", value: "Été" },
    { name: "Hiver", value: "Hiver" },
  ];
}

@Component({
  imports: [FormsModule, FormControlTagsComponent],
  template: `<ame-tags-input [(ngModel)]="tags" />`,
})
class TagsModelHost {
  tags: string[] = [];
}

describe("Tags binding modes", () => {
  it("renders required errors after programmatic touch on the outer control", async () => {
    const fixture = TestBed.createComponent(TagsReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const control = fixture.componentInstance.form.controls.tags;
    control.addValidators(Validators.required);
    control.updateValueAndValidity();
    fixture.componentInstance.form.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("mat-error")).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        "mat-form-field.mat-form-field-invalid",
      ),
    ).not.toBeNull();
    control.setValue(["Summer"]);
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
  it("propagates mutations and external resets through formControlName", async () => {
    const fixture = TestBed.createComponent(TagsReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.debugElement.query(
      By.directive(FormControlTagsComponent),
    ).componentInstance as FormControlTagsComponent;
    component.addTag(" Été ");
    component.addTag("ete");
    expect(fixture.componentInstance.form.value.tags).toEqual(["Été"]);
    fixture.componentInstance.form.reset();
    expect(component.value()).toEqual([]);
    fixture.destroy();
  });

  it("selects the active suggestion on Enter without also adding the typed fragment", async () => {
    const fixture = TestBed.createComponent(TagsReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector(
      "input",
    ) as HTMLInputElement;
    input.value = "et";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("focusin", { bubbles: true }));
    fixture.detectChanges();
    const trigger = fixture.debugElement
      .query(By.directive(MatAutocompleteTrigger))
      .injector.get(MatAutocompleteTrigger);
    trigger.openPanel();
    fixture.detectChanges();
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        keyCode: 40,
        bubbles: true,
      }),
    );
    fixture.detectChanges();
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 13,
        bubbles: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.form.value.tags).toEqual(["Été"]);
    fixture.destroy();
  });

  it("supports ngModel and emits copied arrays", async () => {
    const fixture = TestBed.createComponent(TagsModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.debugElement.query(
      By.directive(FormControlTagsComponent),
    ).componentInstance as FormControlTagsComponent;
    component.addTag(" New ");
    const before = fixture.componentInstance.tags;
    component.remove(0);
    expect(before).toEqual(["New"]);
    expect(fixture.componentInstance.tags).toEqual([]);
    fixture.destroy();
  });
});

@Component({
  imports: [ReactiveFormsModule, FormControlTagsComponent],
  template: `<ame-tags-input [formControl]="control" />`,
})
class TagsReplaceHost {
  control = new FormControl<string[]>([], { nonNullable: true });
}

describe("Tags binding replacement and required transitions", () => {
  it("disconnects a retired directive control and renders the current required error", async () => {
    const fixture = TestBed.createComponent(TagsReplaceHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const retired = fixture.componentInstance.control;
    const current = new FormControl(["Current"], {
      nonNullable: true,
      validators: [Validators.required],
    });
    fixture.componentInstance.control = current;
    fixture.detectChanges();
    await fixture.whenStable();
    retired.setValue(["Retired"]);
    retired.disable();
    const component = fixture.debugElement.query(
      By.directive(FormControlTagsComponent),
    ).componentInstance as FormControlTagsComponent;
    expect(component.value()).toEqual(["Current"]);
    expect(component.isDisabled()).toBeFalse();
    current.setValue([]);
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
    const fixture = TestBed.createComponent(FormControlTagsComponent);
    const control = new FormControl<string[]>([], { nonNullable: true });
    control.markAllAsTouched();
    fixture.componentRef.setInput("control", control);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector("mat-label").textContent,
    ).toContain("Tags");
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
