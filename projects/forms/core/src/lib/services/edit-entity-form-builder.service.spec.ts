/** @format */

import { SubSink } from "subsink";
import { EditEntityFormBuilderService } from "./edit-entity-form-builder.service";
import { EditEntityConditionalStateService } from "./edit-entity-conditional-state.service";
import { EditEntityRecord } from "../edit-entity-dialog.types";

describe("EditEntityFormBuilderService", () => {
  it("does not mark missing persisted fields with defaults as updated", () => {
    const conditionalStateService = {
      resolve: (
        _state: unknown,
        _record: unknown,
        _formGroup: unknown,
        fallback: boolean,
      ): boolean => fallback,
      watch: (): void => undefined,
    } as unknown as EditEntityConditionalStateService<never>;
    const service = new EditEntityFormBuilderService<EditEntityRecord>(
      conditionalStateService,
    );
    const formGroup = service.buildFormGroup(
      {
        record: { _id: "position-1" } as EditEntityRecord,
        displayOptions: { section: { id: "main", label: "", cards: [] } },
      },
      [
        {
          kind: "checkbox",
          name: "features.noos.enabled",
          label: "Enabled",
          defaultValue: false,
        },
        {
          kind: "select",
          name: "features.noos.tokenQuota.mode",
          label: "Quota",
          defaultValue: "unlimited",
        },
      ],
      new SubSink(),
      () => undefined,
    );

    expect(formGroup.isUpdated).toBeFalse();
    expect(formGroup.updatedValue).toEqual({});
  });
});
