import { TestBed } from "@angular/core/testing";
import { SubSink } from "subsink";
import { EditEntityFormBuilderService } from "./edit-entity-form-builder.service";
import { EditEntityConditionalStateService } from "./edit-entity-conditional-state.service";
import { EditEntityField } from "../edit-entity-dialog.types";
describe("eager validation before lazy cards render", () => {
  let sink: SubSink;
  beforeEach(() => {
    sink = new SubSink();
    TestBed.configureTestingModule({
      providers: [
        EditEntityFormBuilderService,
        EditEntityConditionalStateService,
      ],
    });
  });
  afterEach(() => sink.unsubscribe());
  function build(fields: EditEntityField[]) {
    return TestBed.inject(EditEntityFormBuilderService).buildFormGroup(
      { displayOptions: { sections: [] } },
      fields,
      sink,
      () => {},
    );
  }
  it("validates email length and integer before mounting widgets", () => {
    const form = build([
      {
        kind: "text",
        name: "email",
        label: "Email",
        type: "email",
        defaultValue: "bad",
      },
      {
        kind: "text",
        name: "short",
        label: "Short",
        max: 3,
        defaultValue: "long",
      },
      {
        kind: "number",
        name: "count",
        label: "Count",
        isInteger: true,
        defaultValue: 1.5,
      },
    ]);
    expect(form.get("email")?.hasError("email")).toBeTrue();
    expect(form.get("short")?.hasError("maxlength")).toBeTrue();
    expect(form.get("count")?.hasError("integer")).toBeTrue();
    form.destroy();
  });
  it("preserves host entity validation while allowing selected scalar ids", () => {
    const fields: EditEntityField[] = [
      {
        kind: "autocomplete",
        name: "entity",
        label: "Entity",
        defaultValue: "selected-id",
      },
    ];
    const form = TestBed.inject(EditEntityFormBuilderService).buildFormGroup(
      {
        displayOptions: { sections: [] },
        prepareFormGroup: (group) =>
          group
            .get("entity")
            ?.addValidators((c) =>
              c.value === "draft" ? { invalidEntity: true } : null,
            ),
      },
      fields,
      sink,
      () => {},
    );
    expect(form.valid).toBeTrue();
    form.get("entity")?.setValue("draft");
    expect(form.get("entity")?.hasError("invalidEntity")).toBeTrue();
    form.destroy();
  });
  it("validates dates times ranges required endpoints and dynamic bounds eagerly", () => {
    const form = build([
      {
        kind: "date",
        name: "minDate",
        label: "Min",
        defaultValue: new Date(2026, 0, 2),
      },
      {
        kind: "date",
        name: "date",
        label: "Date",
        min: "minDate",
        defaultValue: new Date(2026, 0, 1),
      },
      {
        kind: "time",
        name: "time",
        label: "Time",
        min: "10:00",
        defaultValue: "09:00",
      },
      {
        kind: "date-range",
        name: "dates",
        label: "Dates",
        defaultValue: {
          start: new Date(2026, 0, 2),
          end: new Date(2026, 0, 1),
        },
      },
      {
        kind: "datetime-range",
        name: "required",
        label: "Required",
        required: true,
        defaultValue: { start: new Date(), end: null },
      },
      {
        kind: "time-range",
        name: "times",
        label: "Times",
        defaultValue: { start: "12:00", end: "11:00" },
      },
    ]);
    expect(form.get("date")?.invalid).toBeTrue();
    expect(form.get("time")?.invalid).toBeTrue();
    expect(form.get("dates")?.invalid).toBeTrue();
    expect(form.get("required")?.invalid).toBeTrue();
    expect(form.get("times")?.invalid).toBeTrue();
    form.get("minDate")?.setValue(new Date(2025, 0, 1));
    expect(form.get("date")?.valid).toBeTrue();
    form.destroy();
  });
  it("matches calendar date bounds and exposes required missing range endpoints", () => {
    const form = build([
      {
        kind: "date",
        name: "sameDay",
        label: "Day",
        min: new Date(2026, 0, 1, 18),
        defaultValue: new Date(2026, 0, 1, 8),
      },
      {
        kind: "datetime-range",
        name: "partial",
        label: "Partial",
        required: true,
        defaultValue: { start: new Date(), end: null },
      },
      {
        kind: "number",
        name: "integer",
        label: "Integer",
        isInteger: true,
        defaultValue: "2",
      },
    ]);
    expect(form.get("sameDay")?.valid).toBeTrue();
    expect(form.get("partial")?.hasError("required")).toBeTrue();
    expect(form.get("integer")?.hasError("integer")).toBeTrue();
    form.destroy();
  });
  it("revalidates reciprocal bounds without re-emitting values or losing group validity", () => {
    let emissions = 0;
    const fields: EditEntityField[] = [
      {
        kind: "number",
        name: "start",
        label: "Start",
        max: "end",
        defaultValue: 5,
      },
      {
        kind: "number",
        name: "end",
        label: "End",
        min: "start",
        defaultValue: 10,
      },
    ];
    const form = TestBed.inject(EditEntityFormBuilderService).buildFormGroup(
      {
        displayOptions: { sections: [] },
        prepareFormGroup: (group) => {
          // Limit a broken recursive implementation without replacing either real control.
          for (const name of ["start", "end"])
            sink.add(
              group.requireControl(name).valueChanges.subscribe(() => {
                if (++emissions === 10) sink.unsubscribe();
              }),
            );
        },
      },
      fields,
      sink,
      () => {},
    );
    form.requireControl("start").setValue(20);
    expect(emissions).toBe(1);
    expect(form.requireControl("end").invalid).toBeTrue();
    expect(form.invalid).toBeTrue();
    form.requireControl("end").setValue(30);
    expect(emissions).toBe(2);
    expect(form.requireControl("start").valid).toBeTrue();
    expect(form.valid).toBeTrue();
    form.destroy();
  });
});
