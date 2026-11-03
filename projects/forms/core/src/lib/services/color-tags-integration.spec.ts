import { SubSink } from "subsink";
import {
  EditEntityComponentOptions,
  EditEntityFormField,
} from "../edit-entity-dialog.types";
import {
  ColorValue,
  ColorFormField,
  TagsFormField,
} from "../fields/edit-entity-field.types";
import { EditEntityConditionalStateService } from "./edit-entity-conditional-state.service";
import { EditEntityFormBuilderService } from "./edit-entity-form-builder.service";
import { EditEntitySubmitValueService } from "./edit-entity-submit-value.service";
import { EditEntityRenderService } from "./edit-entity-render.service";

describe("Native color and tags configured form integration", () => {
  it("retains field and option identity while building controls and submitting structural values", () => {
    type RecordValue = {
      _id?: string;
      color?: ColorValue | null;
      tags?: string[];
    };
    const tagOptions = [{ name: "Summer", value: "Summer" }];
    const color: ColorFormField<RecordValue> = {
      kind: "color",
      name: "color",
      label: "Color",
      required: true,
      defaultValue: { hex: "#2196f3", contrast: "#ffffff" },
    };
    const tags: TagsFormField<RecordValue> = {
      kind: "tags",
      name: "tags",
      label: "Tags",
      options: tagOptions,
      defaultValue: [],
    };
    const fields: EditEntityFormField<RecordValue>[] = [color, tags];
    const options: EditEntityComponentOptions<RecordValue> = {
      displayOptions: {
        section: {
          id: "main",
          label: "",
          cards: [{ id: "fields", label: "", fields }],
        },
      },
    };
    const conditions = new EditEntityConditionalStateService<RecordValue>();
    const subscriptions = new SubSink();
    const form = new EditEntityFormBuilderService(conditions).buildFormGroup(
      options,
      fields,
      subscriptions,
      () => undefined,
    );
    expect(
      new EditEntityRenderService(conditions).collectFields(
        options.displayOptions,
      )[0],
    ).toBe(color);
    expect(tags.options).toBe(tagOptions);
    expect(form.getControl("color")?.value).toEqual(color.defaultValue);
    form.getControl("color")?.setValue(null);
    expect(form.getControl("color")?.hasError("required")).toBeTrue();
    form.getControl("color")?.setValue({ hex: "#ffffff", contrast: "#000000" });
    form.getControl("tags")?.setValue(["Summer", "Free"]);
    const value =
      new EditEntitySubmitValueService<RecordValue>().buildCreateValue(
        options,
        fields,
        form,
      );
    expect(value).toEqual({
      color: { hex: "#ffffff", contrast: "#000000" },
      tags: ["Summer", "Free"],
    });
    expect(color.defaultValue).toEqual({ hex: "#2196f3", contrast: "#ffffff" });
    subscriptions.unsubscribe();
    form.destroy();
  });
});
