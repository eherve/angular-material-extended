import { fakeAsync, tick } from "@angular/core/testing";
import { BehaviorSubject } from "rxjs";
import { SubSink } from "subsink";
import {
  EditEntityComponentOptions,
  EditEntityField,
} from "../edit-entity-dialog.types";
import { EditEntityFormBuilderService } from "./edit-entity-form-builder.service";
import { EditEntityConditionalStateService } from "./edit-entity-conditional-state.service";
import { EditEntityRenderService } from "./edit-entity-render.service";
import { EditEntitySubmitValueService } from "./edit-entity-submit-value.service";

describe("edit entity form core", () => {
  const conditions = new EditEntityConditionalStateService();
  const builder = new EditEntityFormBuilderService(conditions);
  const renderer = new EditEntityRenderService(conditions);
  const submit = new EditEntitySubmitValueService();
  const fields: EditEntityField[] = [
    { kind: "text", name: "nested.title", label: "Title", required: true },
    {
      kind: "checkbox",
      name: "enabled",
      label: "Enabled",
      defaultValue: false,
    },
    { kind: "number", name: "quantity", label: "Quantity", defaultValue: 0 },
    {
      kind: "text",
      name: "fixed",
      label: "Fixed",
      editable: false,
      alwaysInUpsert: true,
    },
  ];
  function build(record?: {
    _id?: string;
    nested?: { title: string };
    fixed?: string;
  }) {
    const options: EditEntityComponentOptions = {
      record,
      displayOptions: {
        tabs: [
          {
            label: "unvisited",
            displayOptions: {
              section: {
                id: "main",
                label: "Main",
                cards: [
                  { id: "custom", label: "Custom", kind: "component", fields },
                ],
              },
            },
          },
        ],
      },
    };
    const sink = new SubSink();
    const form = builder.buildFormGroup(
      options,
      renderer.collectFields(options.displayOptions),
      sink,
      () => undefined,
    );
    return {
      form,
      options,
      dispose: () => {
        sink.unsubscribe();
        form.destroy();
      },
    };
  }
  it("buildsUnvisitedComponentCardControls", () => {
    const { form, options, dispose } = build();
    expect(form.requireControl("nested.title").invalid).toBeTrue();
    const card = renderer.buildRenderState(options, form, true).tabs?.[0]
      .renderState.sections?.[0].items[0];
    expect(card?.type).toBe("card");
    if (card?.type === "card") {
      expect(card.items).toEqual([]);
      expect(card.validationStats.missing).toBe(1);
    }
    dispose();
  });
  it("keepsDefaultsPristine", () => {
    const { form, dispose } = build({ _id: "1" });
    expect(form.isUpdated).toBeFalse();
    expect(form.pristine).toBeTrue();
    dispose();
  });
  it("computesNestedUpdateOnly", () => {
    const { form, dispose } = build({ _id: "1", nested: { title: "old" } });
    form.patchPathValue("nested.title", "new");
    expect(submit.buildUpdateValue(fields, form)).toEqual({
      nested: { title: "new" },
    });
    dispose();
  });
  it("preservesZeroAndFalse", () => {
    const { form, options, dispose } = build();
    const value = submit.buildCreateValue(options, fields, form);
    expect(value["enabled"]).toBeFalse();
    expect(value["quantity"]).toBe(0);
    dispose();
  });
  it("doesNotSubmitNonEditableFields", () => {
    const { form, dispose } = build({ _id: "1", fixed: "old" });
    form.patchPathValue("fixed", "new");
    expect(submit.buildUpdateValue(fields, form)["fixed"]).toBeUndefined();
    dispose();
  });
  it("resets one nested path while retaining another change", () => {
    const { form, dispose } = build({ _id: "1", nested: { title: "old" } });
    form.patchPathValue("nested.title", "new");
    form.patchPathValue("quantity", 3);
    form.resetInitialValue("nested.title");
    expect(form.updatedValue).toEqual({ quantity: 3 });
    dispose();
  });
  it("creates a boolean date lock before rendering and defaults permission to false", () => {
    const dateFields: EditEntityField[] = [
      { kind: "date", name: "date", label: "Date", lockedProperty: "locked" },
    ];
    const sink = new SubSink();
    const form = builder.buildFormGroup(
      {
        record: { _id: "1", locked: true } as { _id: string; locked: boolean },
        displayOptions: { sections: [] },
      },
      dateFields,
      sink,
      () => undefined,
    );
    expect(form.requireControl("locked").value).toBeTrue();
    expect(form.requireControl("date").disabled).toBeTrue();
    sink.unsubscribe();
    form.destroy();
  });
  it("submits disabled editable and alwaysInUpsert values", () => {
    const values: EditEntityField[] = [
      {
        kind: "number",
        name: "disabled",
        label: "Disabled",
        disabled: true,
        defaultValue: 0,
        alwaysInUpsert: true,
      },
    ];
    const sink = new SubSink();
    const options: EditEntityComponentOptions = {
      record: { _id: "1" },
      displayOptions: { sections: [] },
    };
    const form = builder.buildFormGroup(options, values, sink, () => undefined);
    expect(submit.buildUpdateValue(values, form)).toEqual({ disabled: 0 });
    expect(submit.buildCreateValue(options, values, form)).toEqual({
      disabled: 0,
    });
    sink.unsubscribe();
    form.destroy();
  });
  it("ignores editability rules while creating", () => {
    const { form, options, dispose } = build();
    form.patchPathValue("fixed", "new");
    expect(submit.buildCreateValue(options, fields, form)["fixed"]).toBe("new");
    dispose();
  });
  it("removes nested metadata from creation and update values", () => {
    const values: EditEntityField[] = [
      { kind: "metadata", name: "internal.tab", defaultValue: 0 },
    ];
    const sink = new SubSink();
    const options: EditEntityComponentOptions = {
      displayOptions: { sections: [] },
    };
    const form = builder.buildFormGroup(options, values, sink, () => undefined);
    form.patchPathValue("internal.tab", 1);
    expect(submit.buildCreateValue(options, values, form)).toEqual({});
    expect(submit.buildUpdateValue(values, form)).toEqual({});
    sink.unsubscribe();
    form.destroy();
  });
  it("updates date lock permission from an observable and releases subscriptions", () => {
    const permission = new BehaviorSubject(false);
    const sink = new SubSink();
    const values: EditEntityField[] = [
      {
        kind: "date",
        name: "date",
        label: "Date",
        lockedProperty: "locked",
        canToggleLock: permission,
      },
    ];
    const options: EditEntityComponentOptions = {
      record: { _id: "1", locked: true } as { _id: string; locked: boolean },
      displayOptions: { sections: [] },
    };
    const form = builder.buildFormGroup(options, values, sink, () => undefined);
    expect(form.requireControl("date").disabled).toBeTrue();
    permission.next(true);
    expect(form.requireControl("date").enabled).toBeTrue();
    sink.unsubscribe();
    permission.next(false);
    expect(form.requireControl("date").enabled).toBeTrue();
    form.destroy();
  });

  it("does not mutate tracked nested changes while excluding a noneditable payload path", () => {
    const values: EditEntityField[] = [
      { kind: "text", name: "nested.fixed", label: "Fixed", editable: false },
      { kind: "text", name: "nested.title", label: "Title" },
    ];
    const sink = new SubSink();
    const options: EditEntityComponentOptions = {
      record: { _id: "1" },
      displayOptions: { sections: [] },
    };
    const form = builder.buildFormGroup(options, values, sink, () => undefined);
    form.patchPathValue("nested.fixed", "hidden");
    form.patchPathValue("nested.title", "changed");
    expect(submit.buildUpdateValue(values, form)).toEqual({
      nested: { title: "changed" },
    });
    expect(form.updatedValue).toEqual({
      nested: { fixed: "hidden", title: "changed" },
    });
    sink.unsubscribe();
    form.destroy();
  });
  it("preserves a date independently disabled in prepareFormGroup after lock permission changes", () => {
    const permission = new BehaviorSubject(false);
    const sink = new SubSink();
    const values: EditEntityField[] = [
      {
        kind: "date",
        name: "date",
        label: "Date",
        lockedProperty: "locked",
        canToggleLock: permission,
      },
    ];
    const options: EditEntityComponentOptions = {
      record: { _id: "1", locked: true } as { _id: string; locked: boolean },
      displayOptions: { sections: [] },
      prepareFormGroup: (form) => form.requireControl("date").disable(),
    };
    const form = builder.buildFormGroup(options, values, sink, () => undefined);
    expect(form.requireControl("date").disabled).toBeTrue();
    permission.next(true);
    expect(form.requireControl("date").disabled).toBeTrue();
    permission.next(false);
    permission.next(true);
    expect(form.requireControl("date").disabled).toBeTrue();
    sink.unsubscribe();
    form.destroy();
  });
});
