import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { provideMomentDatetimeAdapter } from "@ng-matero/extensions-moment-adapter";
import { EditEntityFormControl, EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityDatetimeFieldComponent } from "./edit-entity-datetime-field.component";

describe("EditEntityDatetimeFieldComponent", () => {
  let fixture: ComponentFixture<EditEntityDatetimeFieldComponent<{ _id?: string }>>;
  let formGroup: EditEntityFormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEntityDatetimeFieldComponent],
      providers: [...provideMomentDatetimeAdapter()],
    }).compileComponents();
    formGroup = new EditEntityFormGroup({
      at: new EditEntityFormControl(new Date(2026, 0, 1, 9, 30)),
      bound: new FormControl(new Date(2026, 0, 1, 8, 0)),
    });
    fixture = TestBed.createComponent(EditEntityDatetimeFieldComponent);
    fixture.componentInstance.formGroup = formGroup;
    fixture.componentInstance.field = { kind: "datetime", name: "at", label: "At", min: "bound" };
    fixture.detectChanges();
  });

  afterEach(() => formGroup.destroy());

  it("renders the Ng-Matero datetime picker and follows the linked bound", () => {
    const nextBound = new Date(2026, 0, 1, 8, 30);
    formGroup.requireControl("bound").setValue(nextBound);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("mtx-datetimepicker")).toBeTruthy();
    expect(fixture.componentInstance.min).toBe(nextBound);
  });
});
