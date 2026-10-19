import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { EditEntityFormControl, EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityTimeRangeFieldComponent } from "./edit-entity-time-range-field.component";

describe("EditEntityTimeRangeFieldComponent", () => {
  let fixture: ComponentFixture<EditEntityTimeRangeFieldComponent<{ _id?: string }>>;
  let formGroup: EditEntityFormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EditEntityTimeRangeFieldComponent, MatMomentDateModule] }).compileComponents();
    formGroup = new EditEntityFormGroup({ times: new EditEntityFormControl({ start: "09:00", end: "10:30" }) });
    fixture = TestBed.createComponent(EditEntityTimeRangeFieldComponent);
    fixture.componentInstance.formGroup = formGroup;
    fixture.componentInstance.field = { kind: "time-range", name: "times", label: "Times" };
    fixture.detectChanges();
  });

  afterEach(() => formGroup.destroy());

  it("mirrors endpoint picker errors to the parent and preserves external errors", () => {
    const parent = formGroup.requireControl("times");
    parent.setErrors({ server: true });
    fixture.componentInstance.rangeFormGroup.controls.start.setValidators(() => ({ matTimepickerParse: true }));
    fixture.componentInstance.rangeFormGroup.controls.start.updateValueAndValidity();
    expect(parent.hasError("matTimepickerParse")).toBeTrue();
    expect(parent.hasError("server")).toBeTrue();
  });

  it("propagates endpoint edits and touched state", () => {
    const parent = formGroup.requireControl("times");
    fixture.componentInstance.rangeFormGroup.controls.start.setValue(fixture.componentInstance.rangeFormGroup.controls.start.value?.clone().minute(15) ?? null);
    expect(parent.dirty).toBeTrue();
    expect(parent.touched).toBeTrue();
  });

  it("re-enables range widgets after a disabled replacement is enabled", () => {
    const replacement = new EditEntityFormGroup({ times: new EditEntityFormControl({ start: "09:00", end: "10:00" }) });
    replacement.requireControl("times").disable();
    fixture.componentInstance.formGroup = replacement;
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    replacement.requireControl("times").enable();
    fixture.detectChanges();
    expect(fixture.componentInstance.rangeFormGroup.enabled).toBeTrue();
    replacement.destroy();
  });

  it("marks the engine control touched when an unchanged endpoint is blurred", () => {
    const parent = formGroup.requireControl("times");
    const start = fixture.nativeElement.querySelector("input[formControlName='start']") as HTMLInputElement;
    start.dispatchEvent(new Event("focus"));
    start.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(parent.touched).toBeTrue();
    expect(parent.pristine).toBeTrue();
  });

  it("renders both Material time pickers and keeps range values as strings", () => {
    expect(fixture.nativeElement.querySelectorAll("mat-timepicker").length).toBe(2);
    expect(fixture.componentInstance.rangeFormGroup.controls.start.value?.format("HH:mm")).toBe("09:00");
    expect(fixture.componentInstance.rangeFormGroup.controls.end.value?.format("HH:mm")).toBe("10:30");
    fixture.componentInstance.rangeFormGroup.controls.start.setValue(fixture.componentInstance.rangeFormGroup.controls.start.value?.clone().hour(9).minute(15) ?? null);
    expect(formGroup.requireControl("times").value).toEqual({ start: "09:15", end: "10:30" });
  });
});
