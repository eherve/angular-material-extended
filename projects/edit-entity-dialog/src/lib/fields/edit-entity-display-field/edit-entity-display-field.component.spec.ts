import { ComponentFixture, TestBed } from "@angular/core/testing";
import moment from "moment";
import dayjs from "dayjs";
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

  function renderValue(value: unknown, options: object = {}): void {
    fixture.componentRef.setInput("formGroup", new EditEntityFormGroup({ value: new FormControl(value) }));
    fixture.componentRef.setInput("field", { kind: "display", name: "value", ...options } as DisplayFormField<EditEntityRecord>);
    fixture.detectChanges();
  }

  it("keeps the raw input invisible even when Material sets its display style", () => {
    const style = document.createElement("style");
    style.textContent = "input.mat-mdc-input-element { display: inline-block; }";
    fixture.nativeElement.appendChild(style);
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(getComputedStyle(input).display).toBe("none");
  });

  for (const [name, value] of [
    ["Date", new Date(2028, 10, 1, 16, 32)],
    ["Moment", moment([2028, 10, 1, 16, 32])],
    ["Day.js", dayjs(new Date(2028, 10, 1, 16, 32))],
  ]) {
    it(`formats ${name} with the default date-time format without changing its value`, () => {
      renderValue(value);
      expect(fixture.nativeElement.textContent).toContain("01/11/2028 16h32");
      expect(fixture.componentInstance.control.value).toBe(value);
    });
  }

  it("supports an explicit format for ISO values", () => {
    renderValue("2028-11-01T16:32:00", { format: "DD/MM/YYYY" });
    expect(fixture.nativeElement.textContent.trim()).toBe("01/11/2028");
  });

  it("preserves the timezone of Moment values", () => {
    renderValue(moment.parseZone("2028-11-01T16:32:00+09:00"));
    expect(fixture.nativeElement.textContent).toContain("01/11/2028 16h32");
  });

  it("keeps custom display callbacks and HTML ahead of date formatting", () => {
    renderValue(new Date(2028, 10, 1), { format: "DD/MM/YYYY", display: () => "<strong>Custom date</strong>" });
    expect(fixture.nativeElement.querySelector("strong").textContent).toBe("Custom date");
  });

  for (const value of [null, undefined, "", "not-a-date", new Date(NaN)]) {
    it(`renders an empty value for invalid or missing formatted date ${String(value)}`, () => {
      renderValue(value, { format: "DD/MM/YYYY HH[h]mm" });
      expect(fixture.nativeElement.textContent.trim()).toBe("");
    });
  }

  it("renders unformatted strings as text rather than HTML", () => {
    renderValue("<strong>Plain text</strong>");
    expect(fixture.nativeElement.querySelector("strong")).toBeNull();
    expect(fixture.nativeElement.textContent).toContain("<strong>Plain text</strong>");
  });

  it("updates OnPush rendering after the value changes", async () => {
    fixture.autoDetectChanges();
    renderValue(new Date(2028, 10, 1, 16, 32));
    fixture.componentInstance.control.setValue(new Date(2028, 10, 2, 9, 5));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("02/11/2028 09h05");
  });

});
