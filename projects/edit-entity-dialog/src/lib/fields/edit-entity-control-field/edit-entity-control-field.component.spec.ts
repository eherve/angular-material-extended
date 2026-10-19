import { Component, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { ControlFormField } from "../edit-entity-field.types";
import { EditEntityControlFieldComponent } from "./edit-entity-control-field.component";

@Component({
  standalone: true,
  template: `<span
    >{{ label }}|{{ declared }}|{{ mapped }}|{{ record?._id }}|{{
      control
    }}</span
  >`,
})
class ControlProbe {
  @Input() label = "";
  @Input() declared = "";
  @Input() mapped = "";
  @Input() record?: EditEntityRecord;
  @Input() control?: unknown;
}

describe("EditEntityControlFieldComponent", () => {
  let fixture: ComponentFixture<EditEntityControlFieldComponent>;
  let group: EditEntityFormGroup;
  beforeEach(async () => {
    group = new EditEntityFormGroup({
      name: new FormControl("initial"),
      trigger: new FormControl("first"),
    });
    await TestBed.configureTestingModule({
      imports: [EditEntityControlFieldComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(EditEntityControlFieldComponent);
    fixture.componentRef.setInput("record", { _id: "r1" });
    fixture.componentRef.setInput("formGroup", group);
    fixture.componentRef.setInput("field", {
      kind: "control",
      name: "name",
      label: "Name",
      component: ControlProbe,
      inputs: {
        label: "Configured name",
        declared: "configured",
        ignored: "must-not-appear",
      },
      fields: { mapped: "trigger", control: "trigger" },
    } as ControlFormField<EditEntityRecord>);
    fixture.detectChanges();
  });

  it("filters undeclared inputs and refreshes mapped form values after user changes", () => {
    expect(fixture.nativeElement.textContent).toContain(
      "Configured name|configured|first|r1|first",
    );
    expect(fixture.nativeElement.textContent).not.toContain("must-not-appear");
    group.requireFormControl("trigger").setValue("second");
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      "Configured name|configured|second|r1|second",
    );
  });
});
