import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { Validators } from "@angular/forms";
import { EditEntityFormControl, EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityTimeFieldComponent } from "./edit-entity-time-field.component";

describe("EditEntityTimeFieldComponent", () => {
  let fixture: ComponentFixture<EditEntityTimeFieldComponent<{ _id?: string }>>;
  let formGroup: EditEntityFormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EditEntityTimeFieldComponent, MatMomentDateModule] }).compileComponents();
    formGroup = new EditEntityFormGroup({ time: new EditEntityFormControl("09:30") });
    fixture = TestBed.createComponent(EditEntityTimeFieldComponent);
    fixture.componentInstance.formGroup = formGroup;
    fixture.componentInstance.field = { kind: "time", name: "time", label: "Time" };
    fixture.detectChanges();
  });

  afterEach(() => formGroup.destroy());

  it("mirrors internal parse and range errors to the parent without deleting external errors", () => {
    const parent = formGroup.requireControl("time");
    parent.setErrors({ server: true });
    fixture.componentInstance.timeControl.setValidators(() => ({ matTimepickerParse: true }));
    fixture.componentInstance.timeControl.updateValueAndValidity();
    fixture.detectChanges();
    expect(parent.hasError("matTimepickerParse")).toBeTrue();
    expect(parent.hasError("server")).toBeTrue();
  });

  it("marks the parent touched and dirty after picker interaction", () => {
    const parent = formGroup.requireControl("time");
    fixture.componentInstance.timeControl.setValue(fixture.componentInstance.timeControl.value?.clone().hour(10) ?? null);
    const input = fixture.nativeElement.querySelector("input");
    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(parent.dirty).toBeTrue();
    expect(parent.touched).toBeTrue();
  });

  it("synchronizes both enabled and disabled states", () => {
    const replacement = new EditEntityFormGroup({ time: new EditEntityFormControl("10:00") });
    replacement.requireControl("time").disable();
    fixture.componentInstance.formGroup = replacement;
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    replacement.requireControl("time").enable();
    fixture.detectChanges();
    expect(fixture.componentInstance.timeControl.enabled).toBeTrue();
    replacement.destroy();
  });

  it("renders the Material time picker and preserves HH:mm form values", () => {
    expect(fixture.nativeElement.querySelector("mat-timepicker")).toBeTruthy();
    expect(fixture.componentInstance.timeControl.value?.format("HH:mm")).toBe("09:30");
    fixture.componentInstance.timeControl.setValue(fixture.componentInstance.timeControl.value?.clone().hour(10).minute(45) ?? null);
    expect(formGroup.requireControl("time").value).toBe("10:45");
  });
});
