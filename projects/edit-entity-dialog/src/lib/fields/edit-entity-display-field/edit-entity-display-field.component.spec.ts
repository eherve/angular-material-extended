import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { DisplayFormField } from "../edit-entity-field.types";
import { EditEntityDisplayFieldComponent } from "./edit-entity-display-field.component";

describe("EditEntityDisplayFieldComponent", () => {
  let fixture: ComponentFixture<
    EditEntityDisplayFieldComponent<EditEntityRecord>
  >;
  let oldGroup: EditEntityFormGroup;
  let newGroup: EditEntityFormGroup;
  beforeEach(async () => {
    oldGroup = new EditEntityFormGroup({
      oldValue: new FormControl("old initial"),
    });
    newGroup = new EditEntityFormGroup({
      newValue: new FormControl("new initial"),
    });
    await TestBed.configureTestingModule({
      imports: [
        EditEntityDisplayFieldComponent,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EditEntityDisplayFieldComponent);
    fixture.componentRef.setInput("formGroup", oldGroup);
    fixture.componentRef.setInput("field", {
      kind: "display",
      name: "oldValue",
      display: (value) => `Shown ${value}`,
    } as DisplayFormField<EditEntityRecord>);
    fixture.detectChanges();
  });

  it("renders the standard display and rebinds to a replacement field control", () => {
    expect(fixture.nativeElement.textContent).toContain("Shown old initial");
    fixture.componentRef.setInput("formGroup", newGroup);
    fixture.componentRef.setInput("field", {
      kind: "display",
      name: "newValue",
      display: (value) => `Shown ${value}`,
    } as DisplayFormField<EditEntityRecord>);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Shown new initial");
    oldGroup.requireFormControl("oldValue").setValue("stale value");
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Shown new initial");
    newGroup.requireFormControl("newValue").setValue("new value");
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Shown new value");
  });
});
