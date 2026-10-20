import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatSelectHarness } from "@angular/material/select/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { BehaviorSubject } from "rxjs";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import {
  IFormControlSelectOption,
  SelectFormField,
} from "../edit-entity-field.types";
import { EditEntitySelectFieldComponent } from "./edit-entity-select-field.component";
import { EditEntityTextFieldComponent } from "../edit-entity-text-field/edit-entity-text-field.component";
import { EditEntityTextareaFieldComponent } from "../edit-entity-textarea-field/edit-entity-textarea-field.component";
import { EditEntityNumberFieldComponent } from "../edit-entity-number-field/edit-entity-number-field.component";
import { EditEntityCheckboxFieldComponent } from "../edit-entity-checkbox-field/edit-entity-checkbox-field.component";
import { EditEntityRadioFieldComponent } from "../edit-entity-radio-field/edit-entity-radio-field.component";
import { EditEntityChipsFieldComponent } from "../edit-entity-chips-field/edit-entity-chips-field.component";
import { EditEntitySliderFieldComponent } from "../edit-entity-slider-field/edit-entity-slider-field.component";
import { EditEntityDisplayFieldComponent } from "../edit-entity-display-field/edit-entity-display-field.component";
import { EditEntityControlFieldComponent } from "../edit-entity-control-field/edit-entity-control-field.component";

describe("EditEntitySelectFieldComponent", () => {
  let fixture: ComponentFixture<
    EditEntitySelectFieldComponent<EditEntityRecord>
  >;
  let formGroup: EditEntityFormGroup;

  beforeEach(async () => {
    formGroup = new EditEntityFormGroup({
      choice: new FormControl("a", Validators.required),
      trigger: new FormControl(0),
    });
    await TestBed.configureTestingModule({
      imports: [
        EditEntitySelectFieldComponent,
        EditEntityTextFieldComponent,
        EditEntityTextareaFieldComponent,
        EditEntityNumberFieldComponent,
        EditEntityCheckboxFieldComponent,
        EditEntityRadioFieldComponent,
        EditEntityChipsFieldComponent,
        EditEntitySliderFieldComponent,
        EditEntityDisplayFieldComponent,
        EditEntityControlFieldComponent,
        MatFormFieldModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EditEntitySelectFieldComponent);
    fixture.componentRef.setInput("formGroup", formGroup);
    fixture.componentRef.setInput("record", { _id: "r1" });
    fixture.componentRef.setInput("field", {
      kind: "select",
      name: "choice",
      label: "Choice",
      options: [],
    } as SelectFormField<EditEntityRecord>);
  });

  it("renders grouped observable options and replaces them without emitting a form value", async () => {
    const options = new BehaviorSubject<IFormControlSelectOption[]>([
      { name: "Alpha", value: "a", group: "First" },
      { name: "Unavailable", value: "b", disabled: true, group: "First" },
      { name: "No group", value: "c" },
    ]);
    fixture.componentRef.setInput("field", {
      kind: "select",
      name: "choice",
      label: "Choice",
      group: true,
      options,
    } as SelectFormField<EditEntityRecord>);
    const values: unknown[] = [];
    formGroup.valueChanges.subscribe((value) => values.push(value));
    fixture.detectChanges();
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    expect(
      await Promise.all(
        (await select.getOptions()).map((option) => option.getText()),
      ),
    ).toEqual(jasmine.arrayContaining(["Alpha", "Unavailable", "No group"]));
    expect(document.body.querySelectorAll("mat-optgroup").length).toBe(2);
    expect(formGroup.requireFormControl("choice").value).toBe("a");
    expect(values).toEqual([]);

    options.next([{ name: "Replacement", value: "a", group: "First" }]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      await Promise.all(
        (await select.getOptions()).map((option) => option.getText()),
      ),
    ).toContain("Replacement");
    expect(values).toEqual([]);
  });

  it("re-evaluates function options when a sibling value changes and respects disabled options", async () => {
    fixture.componentRef.setInput("field", {
      kind: "select",
      name: "choice",
      label: "Choice",
      options: (_record, group) => [
        { name: `Value ${group.get("trigger")?.value}`, value: "a" },
        { name: "Disabled", value: "b", disabled: true },
      ],
    } as SelectFormField<EditEntityRecord>);
    fixture.detectChanges();
    const select =
      await TestbedHarnessEnvironment.loader(fixture).getHarness(
        MatSelectHarness,
      );
    await select.open();
    expect(
      await Promise.all(
        (await select.getOptions()).map((option) => option.getText()),
      ),
    ).toContain("Value 0");
    formGroup.requireFormControl("trigger").setValue(1);
    fixture.detectChanges();
    expect(
      await Promise.all(
        (await select.getOptions()).map((option) => option.getText()),
      ),
    ).toContain("Value 1");
    expect(await (await select.getOptions())[1].isDisabled()).toBeTrue();
  });

  it("shows required state and errors from the engine control", async () => {
    const control = formGroup.requireFormControl("choice");
    control.setValue(null);
    control.markAsTouched();
    fixture.detectChanges();
    const select =
      await TestbedHarnessEnvironment.loader(fixture).getHarness(
        MatSelectHarness,
      );
    expect(await select.isRequired()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain("Obligatoire");
    expect(formGroup.invalid).toBeTrue();
  });

  it("hides the clear action for an empty string", () => {
    formGroup.requireFormControl("choice").setValue("");
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Effacer"]'),
    ).toBeNull();
  });

  it("renders multi-selection separators in the same text flow as labels", async () => {
    fixture.componentRef.setInput("field", {
      kind: "select",
      name: "choice",
      label: "Choice",
      multiple: true,
      options: [
        { name: "Maintenance", value: "a" },
        { name: "Intervention", value: "b" },
      ],
    });
    formGroup.requireFormControl("choice").setValue(["a", "b"]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      "mat-select-trigger",
    ) as HTMLElement;
    expect(trigger.textContent?.trim()).toBe("Maintenance, Intervention");
    // A flex-column trigger must not place separators in their own flex items.
    trigger.style.display = "flex";
    trigger.style.flexDirection = "column";
    expect(
      Array.from(trigger.children).some(
        (child) => child.textContent?.trim() === ",",
      ),
    ).toBeFalse();
  });

  it("renders clear action for false and zero values", async () => {
    const field = fixture.componentInstance.field;
    fixture.componentRef.setInput("field", {
      ...field,
      options: [
        { name: "Zero", value: 0 },
        { name: "False", value: false },
      ],
    } as SelectFormField<EditEntityRecord>);
    const control = formGroup.requireFormControl("choice");
    for (const value of [0, false]) {
      control.setValue(value);
      fixture.detectChanges();
      const clear = fixture.nativeElement.querySelector(
        '[aria-label="Effacer"]',
      ) as HTMLButtonElement;
      expect(clear).not.toBeNull();
      clear.click();
      fixture.detectChanges();
      expect(control.value).toBeNull();
    }
  });
});
