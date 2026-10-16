import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { By } from "@angular/platform-browser";
import { EditEntityFormControl, EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityDurationFieldComponent } from "./edit-entity-duration-field.component";
import { FormControlDurationComponent } from "../../controls/duration/duration.component";

describe("EditEntityDurationFieldComponent", () => {
  let fixture: ComponentFixture<EditEntityDurationFieldComponent<{ _id?: string }>>;
  let formGroup: EditEntityFormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEntityDurationFieldComponent],
    }).compileComponents();

    formGroup = new EditEntityFormGroup({ duration: new EditEntityFormControl(90) });
    fixture = TestBed.createComponent(EditEntityDurationFieldComponent);
    fixture.componentInstance.formGroup = formGroup;
    fixture.componentInstance.field = {
      kind: "duration",
      name: "duration",
      label: "Duration",
      min: 30,
      max: 120,
      quickOptions: ["02:00"],
    };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("renders and preserves 90 as 90 minutes", () => {
    const hours = fixture.nativeElement.querySelector("input.duration-segment-input__segment--hours") as HTMLInputElement;
    const minutes = fixture.nativeElement.querySelector("input.duration-segment-input__segment--minutes") as HTMLInputElement;

    expect(hours.value).toBe("01");
    expect(minutes.value).toBe("30");
    expect(formGroup.requireControl("duration").value).toBe(90);
  });

  it("preserves zero, validates bounds, and applies a quick option", async () => {
    const control = formGroup.requireControl("duration");
    control.setValue(0);
    fixture.detectChanges();

    expect(control.value).toBe(0);
    expect(control.hasError("min")).toBeTrue();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const items = await menu.getItems();

    expect(await items[0].getText()).toBe("02:00");
    await items[0].click();

    expect(control.value).toBe(120);
    expect(control.valid).toBeTrue();
  });

  it("marks the parent control touched when a duration segment loses focus", () => {
    const hours = fixture.nativeElement.querySelector("input.duration-segment-input__segment--hours") as HTMLInputElement;
    hours.dispatchEvent(new Event("focusout", { bubbles: true }));
    fixture.detectChanges();

    expect(formGroup.requireControl("duration").touched).toBeTrue();
  });

  it("revalidates the parent when duration limits change", () => {
    const parent = formGroup.requireControl("duration");
    parent.setValue(90);
    expect(parent.valid).toBeTrue();
    const duration = fixture.debugElement.query(By.directive(FormControlDurationComponent)).componentInstance as FormControlDurationComponent;
    duration.min = 100;
    expect(parent.hasError("min")).toBeTrue();
    duration.min = 0;
    duration.max = 80;
    expect(parent.hasError("max")).toBeTrue();
  });

  it("clears the duration to null", () => {
    const clearButton = fixture.nativeElement.querySelector("button[aria-label='Effacer']") as HTMLButtonElement;

    expect(clearButton).toBeTruthy();
    clearButton.click();
    fixture.detectChanges();

    expect(formGroup.requireControl("duration").value).toBeNull();
  });
});
