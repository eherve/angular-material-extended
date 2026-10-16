import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { SliderFormField } from "../edit-entity-field.types";
import { EditEntitySliderFieldComponent } from "./edit-entity-slider-field.component";

describe("EditEntitySliderFieldComponent", () => {
  let fixture: ComponentFixture<
    EditEntitySliderFieldComponent<EditEntityRecord>
  >;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEntitySliderFieldComponent, NoopAnimationsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(EditEntitySliderFieldComponent);
    fixture.componentRef.setInput(
      "formGroup",
      new EditEntityFormGroup({ score: new FormControl(5) }),
    );
    fixture.componentRef.setInput("field", {
      kind: "slider",
      name: "score",
      label: "Score",
      min: 0,
      max: 10,
      appearance: "fill",
      discrete: false,
      valuePosition: "bottom",
      thumbFormatter: (value) => Number(value) * 10,
      thumbSuffix: " pts",
    } as SliderFormField<EditEntityRecord>);
    fixture.detectChanges();
  });

  it("renders the configured appearance, formatted value, and value position", () => {
    const container = fixture.nativeElement.querySelector(
      "#container",
    ) as HTMLElement;
    expect(container.classList.contains("fill")).toBeTrue();
    expect(container.textContent).toContain("Score");
    expect(container.textContent).toContain("50 pts");
    expect(container.querySelector(".position-bottom")).not.toBeNull();
    expect(fixture.componentInstance.sliderDisplayWith(3)).toBe("30 pts");
  });
});
