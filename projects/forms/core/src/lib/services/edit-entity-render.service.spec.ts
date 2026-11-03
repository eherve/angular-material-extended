/** @format */

import { FormControl } from "@angular/forms";
import { Component, Input } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SubSink } from "subsink";
import { EditEntityDialogIntl } from "../edit-entity-dialog.intl";
import { EditEntityFormBuilderService } from "./edit-entity-form-builder.service";
import { EditEntityFormGroup } from "../classes/edit-entity-form-group";
import {
  EditEntityComponentOptions,
  EditEntityRecord,
} from "../edit-entity-dialog.types";
import { EditEntityConditionalStateService } from "./edit-entity-conditional-state.service";
import { EditEntityRenderService } from "./edit-entity-render.service";

@Component({ template: "" })
class DeclaredInputComponent {
  @Input() record: unknown;
  @Input("publicAlias") alias: unknown;
}

describe("EditEntityRenderService", () => {
  let service: EditEntityRenderService<EditEntityRecord>;

  beforeEach(() => {
    service = new EditEntityRenderService(
      new EditEntityConditionalStateService(),
    );
  });

  it("honors configured visibility on caller-owned controls without mutating them", () => {
    const form = new EditEntityFormGroup({
      name: new FormControl("hide"),
      hidden: new FormControl("retained"),
      conditional: new FormControl("value"),
    });
    const options: EditEntityComponentOptions<EditEntityRecord> = {
      displayOptions: {
        section: {
          id: "s",
          label: "Section",
          cards: [
            {
              id: "c",
              label: "Card",
              fields: [
                { kind: "text", name: "name", label: "Name" },
                {
                  kind: "text",
                  name: "hidden",
                  label: "Hidden",
                  visible: false,
                },
                {
                  kind: "text",
                  name: "conditional",
                  label: "Conditional",
                  visible: (_record, current) =>
                    current.get("name")?.value === "show",
                },
              ],
            },
          ],
        },
      },
    };
    const names = (): string[] => {
      const card = service.buildRenderState(options, form, true).sections![0]
        .items[0];
      if (card.type !== "card") throw new Error("Missing card");
      return (card.items ?? []).flatMap((item) =>
        item.type !== "break" && item.field ? [item.field.name] : [],
      );
    };
    expect(names()).toEqual(["name"]);
    form.get("name")?.setValue("show");
    expect(names()).toEqual(["name", "conditional"]);
    expect(form.get("hidden")?.value).toBe("retained");
    form.destroy();
  });

  for (const gap of [undefined, "12px"]) {
    it(`preserves ${gap ?? "inherited default"} grid gaps in sections and cards`, () => {
      const state = service.buildRenderState(
        {
          displayOptions: {
            section: {
              id: "s",
              label: "Section",
              grid: { gap },
              cards: [{ id: "c", label: "Card", grid: { gap }, fields: [] }],
            },
          },
        },
        new EditEntityFormGroup(),
        true,
      );
      const section = state.sections![0];
      expect(section.gridStyles["--edit-entity-grid-gap"]).toBe(
        gap ?? "var(--ngx-mat-extended-space-3, 16px)",
      );
      const card = section.items[0];
      if (card.type !== "card") throw new Error("Missing card");
      expect(card.gridStyles["--edit-entity-grid-gap"]).toBe(
        gap ?? "var(--ngx-mat-extended-space-3, 16px)",
      );
    });
  }
  it("exposes single-card section mode with the visible card count", () => {
    const options = {
      displayOptions: {
        section: {
          id: "main",
          label: "Main",
          sectionMode: "single-card",
          cards: [
            { id: "first", label: "First", fields: [] },
            { id: "hidden", label: "Hidden", visible: false, fields: [] },
          ],
        },
      },
    } satisfies EditEntityComponentOptions<EditEntityRecord>;

    const renderState = service.buildRenderState(
      options,
      new EditEntityFormGroup(),
      true,
    );
    const section = renderState.sections?.[0];

    expect(section?.sectionMode).toBe("single-card");
    expect(section?.cardCount).toBe(1);
  });

  it("defaults sections to the standard mode", () => {
    const options = {
      displayOptions: {
        section: {
          id: "main",
          label: "Main",
          cards: [{ id: "first", label: "First", fields: [] }],
        },
      },
    } satisfies EditEntityComponentOptions<EditEntityRecord>;

    const renderState = service.buildRenderState(
      options,
      new EditEntityFormGroup(),
      true,
    );
    const section = renderState.sections?.[0];

    expect(section?.sectionMode).toBe("default");
    expect(section?.cardCount).toBe(1);
  });
  it("filters component input names using their public aliases", () => {
    expect(
      service.filterDeclaredComponentInputs(DeclaredInputComponent, {
        record: { _id: "a" },
        publicAlias: 0,
        alias: 1,
        undeclared: true,
      }),
    ).toEqual({ record: { _id: "a" }, publicAlias: 0 });
  });
  it("combines observable section visibility with field conditions and preserves false completion", () => {
    const condition = new EditEntityConditionalStateService();
    const visible = new BehaviorSubject(false);
    const sink = new SubSink();
    condition.watch(visible, sink, () => undefined);
    const renderer = new EditEntityRenderService(condition);
    const options: EditEntityComponentOptions = {
      displayOptions: {
        section: {
          id: "main",
          label: "Main",
          visible,
          cards: [
            {
              id: "card",
              label: "Card",
              fields: [
                {
                  kind: "checkbox",
                  name: "enabled",
                  label: "Enabled",
                  defaultValue: false,
                },
              ],
            },
          ],
        },
      },
    };
    const form = new EditEntityFormBuilderService(condition).buildFormGroup(
      options,
      renderer.collectFields(options.displayOptions),
      sink,
      () => undefined,
    );
    expect(renderer.buildRenderState(options, form, true).sections).toEqual([]);
    visible.next(true);
    expect(
      renderer.buildRenderState(options, form, true).sections?.[0]
        .validationStats.completed,
    ).toBe(1);
    sink.unsubscribe();
    form.destroy();
  });
  it("uses the host Intl messages for validation instead of requiring localize", () => {
    const condition = new EditEntityConditionalStateService();
    const intl = new EditEntityDialogIntl();
    intl.messages.missingFields = "{count} fields need a value";
    const renderer = new EditEntityRenderService(condition, intl);
    const sink = new SubSink();
    const options: EditEntityComponentOptions = {
      displayOptions: {
        section: {
          id: "main",
          label: "Main",
          cards: [
            {
              id: "c",
              label: "C",
              fields: [
                { kind: "text", name: "a", label: "A", required: true },
                { kind: "text", name: "b", label: "B", required: true },
              ],
            },
          ],
        },
      },
    };
    const form = new EditEntityFormBuilderService(condition).buildFormGroup(
      options,
      renderer.collectFields(options.displayOptions),
      sink,
      () => undefined,
    );
    expect(
      renderer.buildRenderState(options, form, true).validationSummary?.tooltip,
    ).toBe("2 fields need a value");
    sink.unsubscribe();
    form.destroy();
  });
});
