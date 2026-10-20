import { EditEntityDurationFieldComponent } from "./edit-entity-duration-field/edit-entity-duration-field.component";
import { Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { provideMomentDatetimeAdapter } from "@ng-matero/extensions-moment-adapter";
import { EditEntityFormGroup } from "../classes/edit-entity-form-group";
import { EditEntityTimeFieldComponent } from "./edit-entity-time-field/edit-entity-time-field.component";
import { EditEntityDateRangeFieldComponent } from "./edit-entity-date-range-field/edit-entity-date-range-field.component";
import { EditEntityTimeRangeFieldComponent } from "./edit-entity-time-range-field/edit-entity-time-range-field.component";
import { EditEntityDatetimeRangeFieldComponent } from "./edit-entity-datetime-range-field/edit-entity-datetime-range-field.component";
import { EditEntitySliderFieldComponent } from "./edit-entity-slider-field/edit-entity-slider-field.component";

const cases: {
  kind: string;
  component: Type<unknown>;
  value: unknown;
  multiple?: boolean;
}[] = [
  { kind: "duration", component: EditEntityDurationFieldComponent, value: 0 },
  { kind: "time", component: EditEntityTimeFieldComponent, value: "09:30" },
  {
    kind: "date-range",
    component: EditEntityDateRangeFieldComponent,
    value: { start: new Date(2026, 0, 1), end: new Date(2026, 0, 2) },
  },
  {
    kind: "time-range",
    component: EditEntityTimeRangeFieldComponent,
    value: { start: "09:00", end: "10:00" },
  },
  {
    kind: "datetime-range",
    component: EditEntityDatetimeRangeFieldComponent,
    value: { start: new Date(2026, 0, 1, 9), end: new Date(2026, 0, 1, 10) },
  },
  { kind: "slider", component: EditEntitySliderFieldComponent, value: 0 },
];

for (const scenario of cases) {
  describe(`${scenario.kind} clear action (multiple=${!!scenario.multiple})`, () => {
    async function setup(disabled = false) {
      await TestBed.configureTestingModule({
        imports: [scenario.component, MatMomentDateModule],
        providers: [...provideMomentDatetimeAdapter()],
      }).compileComponents();
      const control = new FormControl<unknown>({
        value: scenario.value,
        disabled,
      });
      const form = new EditEntityFormGroup({ value: control });
      const fixture = TestBed.createComponent(scenario.component);
      fixture.componentRef.setInput("formGroup", form);
      fixture.componentRef.setInput("field", {
        kind: scenario.kind,
        name: "value",
        label: "Value",
        multiple: scenario.multiple,
        options: [
          { name: "Zero", value: 0 },
          { name: "False", value: false },
        ],
      });
      fixture.detectChanges();
      await fixture.whenStable();
      const actions = () =>
        Array.from(
          (
            fixture.nativeElement as HTMLElement
          ).querySelectorAll<HTMLButtonElement>('[aria-label="Effacer"]'),
        );
      return { fixture, control, form, actions };
    }

    it("clears rendered values, marks the engine control and hides actions once empty", async () => {
      const { fixture, control, form, actions } = await setup();
      expect(actions().length).toBeGreaterThan(0);
      for (const button of actions()) button.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(control.value).toEqual(scenario.multiple ? [] : null);
      expect(control.dirty).toBeTrue();
      expect(control.touched).toBeTrue();
      expect(actions().length).toBe(0);
      if (scenario.kind.includes("range") || scenario.kind === "time") {
        expect(
          Array.from(
            (
              fixture.nativeElement as HTMLElement
            ).querySelectorAll<HTMLInputElement>("input"),
          ).every((input) => input.value === ""),
        ).toBeTrue();
      }
      form.destroy();
    });

    if (scenario.kind === "time-range" || scenario.kind === "datetime-range") {
      it("preserves the other endpoint when clearing only the start", async () => {
        const { fixture, form, actions } = await setup();
        const inputs = (
          fixture.nativeElement as HTMLElement
        ).querySelectorAll<HTMLInputElement>("input");
        const end = inputs[1].value;
        expect(end).not.toBe("");
        actions()[0].click();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(inputs[0].value).toBe("");
        expect(inputs[1].value).toBe(end);
        expect(actions().length).toBe(1);
        form.destroy();
      });
    }

    it("does not offer clearing while disabled", async () => {
      const { actions, control, form } = await setup(true);
      expect(actions().length).toBe(0);
      expect(control.pristine).toBeTrue();
      expect(control.value).toEqual(scenario.value);
      form.destroy();
    });
  });
}
