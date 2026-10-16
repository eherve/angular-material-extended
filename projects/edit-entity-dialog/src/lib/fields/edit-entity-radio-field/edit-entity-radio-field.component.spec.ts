import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { RadioFormField } from "../edit-entity-field.types";
import { EditEntityRadioFieldComponent } from "./edit-entity-radio-field.component";

describe("EditEntityRadioFieldComponent", () => {
  let fixture: ComponentFixture<
    EditEntityRadioFieldComponent<EditEntityRecord>
  >;
  let formGroup: EditEntityFormGroup;
  beforeEach(async () => {
    formGroup = new EditEntityFormGroup({ choice: new FormControl("first") });
    await TestBed.configureTestingModule({
      imports: [EditEntityRadioFieldComponent, NoopAnimationsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(EditEntityRadioFieldComponent);
    fixture.componentRef.setInput("formGroup", formGroup);
    fixture.componentRef.setInput("field", {
      kind: "radio",
      name: "choice",
      label: "Choose one",
      direction: "column",
      options: [
        { name: "First", value: "first" },
        { name: "Second", value: "second" },
      ],
    } as RadioFormField<EditEntityRecord>);
    fixture.detectChanges();
  });

  it("shows the field label, lays options out vertically, and writes a selected value to the engine form", () => {
    const group = fixture.nativeElement.querySelector(
      "mat-radio-group",
    ) as HTMLElement;
    expect(fixture.nativeElement.textContent).toContain("Choose one");
    expect(getComputedStyle(group).display).toBe("flex");
    expect(getComputedStyle(group).flexDirection).toBe("column");
    const second = fixture.nativeElement.querySelectorAll(
      'input[type="radio"]',
    )[1] as HTMLInputElement;
    second.click();
    second.dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(formGroup.requireFormControl("choice").value).toBe("second");
  });
});
