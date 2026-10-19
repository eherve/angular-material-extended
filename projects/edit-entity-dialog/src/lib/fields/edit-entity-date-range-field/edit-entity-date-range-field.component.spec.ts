import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, Validators } from "@angular/forms";
import moment from "moment";
import { EditEntityFormControl, EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { MatNativeDateModule } from "@angular/material/core";
import { EditEntityDateRangeFieldComponent } from "./edit-entity-date-range-field.component";

describe("EditEntityDateRangeFieldComponent", () => {
  let fixture: ComponentFixture<EditEntityDateRangeFieldComponent<{ _id?: string }>>;
  let formGroup: EditEntityFormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EditEntityDateRangeFieldComponent, MatNativeDateModule] }).compileComponents();
    formGroup = new EditEntityFormGroup({
      range: new EditEntityFormControl(null),
      lowerBound: new EditEntityFormControl(new Date(2026, 0, 1)),
    });
    fixture = TestBed.createComponent(EditEntityDateRangeFieldComponent);
    fixture.componentInstance.formGroup = formGroup;
    fixture.componentInstance.field = {
      kind: "date-range",
      name: "range",
      label: "Range",
      min: "lowerBound",
    };
    fixture.detectChanges();
  });

  it("mirrors picker validation to the parent while retaining unrelated errors", () => {
    formGroup.requireControl("range").setErrors({ server: true });
    fixture.componentInstance.rangeFormGroup.controls.start.setValidators(() => ({ matDatepickerParse: true }));
    fixture.componentInstance.rangeFormGroup.controls.start.updateValueAndValidity();
    fixture.detectChanges();
    expect(formGroup.requireControl("range").hasError("matDatepickerParse")).toBeTrue();
    expect(formGroup.requireControl("range").hasError("server")).toBeTrue();
  });

  it("propagates user range interactions but not programmatic synchronization state", () => {
    const parent = formGroup.requireControl("range");
    formGroup.requireControl("lowerBound").setValue(new Date(2026, 0, 2));
    expect(parent.pristine).toBeTrue();
    expect(parent.untouched).toBeTrue();
    fixture.componentInstance.rangeFormGroup.controls.start.setValue(new Date(2026, 0, 3));
    fixture.detectChanges();
    expect(parent.dirty).toBeTrue();
    expect(parent.touched).toBeTrue();
  });

  it("converts Moment picker values back to Date values", () => {
    fixture.componentInstance.rangeFormGroup.controls.start.setValue(moment(new Date(2026, 0, 3, 9)) as never);
    fixture.componentInstance.rangeFormGroup.controls.end.setValue(moment(new Date(2026, 0, 3, 10)) as never);
    const value = formGroup.requireControl("range").value;
    expect(value.start instanceof Date).toBeTrue();
    expect(value.end instanceof Date).toBeTrue();
  });

  it("re-enables range widgets when the bound control is enabled", () => {
    const replacement = new EditEntityFormGroup({ range: new FormControl(null, Validators.required) });
    replacement.requireControl("range").disable();
    fixture.componentInstance.formGroup = replacement;
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    replacement.requireControl("range").enable();
    fixture.detectChanges();
    expect(fixture.componentInstance.rangeFormGroup.enabled).toBeTrue();
    replacement.destroy();
  });

  it("marks the engine control touched when an unchanged endpoint is blurred", () => {
    const parent = formGroup.requireControl("range");
    const start = fixture.nativeElement.querySelector("input[matStartDate]") as HTMLInputElement;
    start.dispatchEvent(new Event("focus"));
    start.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(parent.touched).toBeTrue();
    expect(parent.pristine).toBeTrue();
  });

  it("follows a linked date bound and retains the picker range", () => {
    const firstBound = new Date(2026, 0, 1);
    const nextBound = new Date(2026, 0, 5);

    expect(fixture.componentInstance.min).toEqual(firstBound);
    formGroup.requireControl("lowerBound").setValue(nextBound);
    fixture.detectChanges();

    expect(fixture.componentInstance.min).toEqual(nextBound);
    expect(fixture.nativeElement.querySelector("mat-date-range-input")).toBeTruthy();
  });
});
