import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideMomentDatetimeAdapter } from "@ng-matero/extensions-moment-adapter";
import { FormControl, Validators } from "@angular/forms";
import moment from "moment";
import { EditEntityFormControl, EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityDatetimeRangeFieldComponent } from "./edit-entity-datetime-range-field.component";

describe("EditEntityDatetimeRangeFieldComponent", () => {
  let fixture: ComponentFixture<EditEntityDatetimeRangeFieldComponent<{ _id?: string }>>;
  let formGroup: EditEntityFormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEntityDatetimeRangeFieldComponent],
      providers: [...provideMomentDatetimeAdapter()],
    }).compileComponents();
    formGroup = new EditEntityFormGroup({
      range: new EditEntityFormControl({ start: new Date(2026, 0, 1, 9), end: new Date(2026, 0, 1, 10) }),
    });
    fixture = TestBed.createComponent(EditEntityDatetimeRangeFieldComponent);
    fixture.componentInstance.formGroup = formGroup;
    fixture.componentInstance.field = { kind: "datetime-range", name: "range", label: "Range" };
    fixture.detectChanges();
  });

  afterEach(() => formGroup.destroy());

  it("propagates required errors from both range endpoints", () => {
    const parent = formGroup.requireControl("range");
    parent.addValidators(Validators.required);
    parent.setValue(null);
    fixture.detectChanges();
    fixture.componentInstance.rangeFormGroup.controls.start.setValue(null);
    fixture.detectChanges();
    expect(fixture.componentInstance.rangeFormGroup.controls.start.hasError("required")).toBeTrue();
    expect(fixture.componentInstance.rangeFormGroup.controls.end.hasError("required")).toBeTrue();
  });

  it("converts Moment picker values back to Date values and marks user changes", () => {
    fixture.componentInstance.rangeFormGroup.controls.start.setValue(moment(new Date(2026, 0, 1, 9)) as never);
    fixture.componentInstance.rangeFormGroup.controls.end.setValue(moment(new Date(2026, 0, 1, 10)) as never);
    const value = formGroup.requireControl("range").value;
    expect(value.start instanceof Date).toBeTrue();
    expect(value.end instanceof Date).toBeTrue();
    expect(formGroup.requireControl("range").dirty).toBeTrue();
    expect(formGroup.requireControl("range").touched).toBeTrue();
  });

  it("re-enables range widgets after a disabled replacement is enabled", () => {
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
    const start = fixture.nativeElement.querySelector("input[formControlName='start']") as HTMLInputElement;
    start.dispatchEvent(new Event("focus"));
    start.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(parent.touched).toBeTrue();
    expect(parent.pristine).toBeTrue();
  });

  it("renders both Ng-Matero datetime pickers and preserves Date range values", () => {
    expect(fixture.nativeElement.querySelectorAll("mtx-datetimepicker").length).toBe(2);
    expect(fixture.componentInstance.rangeFormGroup.controls.start.value).toEqual(new Date(2026, 0, 1, 9));
    expect(fixture.componentInstance.rangeFormGroup.controls.end.value).toEqual(new Date(2026, 0, 1, 10));
  });
});
