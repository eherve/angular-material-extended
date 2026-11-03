import { FormControl, Validators } from "@angular/forms";
import { EditEntityFormGroup } from "@eherve/angular-material-forms/core";
import { CreateEntityWizardState } from "./create-entity-wizard-state";

describe("creation wizard scoped state", () => {
  const state = new CreateEntityWizardState();
  function build(): EditEntityFormGroup {
    return new EditEntityFormGroup({
      name: new FormControl(""),
      billing: new FormControl(""),
      calendar: new FormControl([]),
    });
  }
  it("projects only current fields and explicit dependencies", () => {
    const form = build();
    form.patchPathValue("name", "Client");
    form.patchPathValue("billing", "draft");
    expect(state.project(form, ["name"], false)).toEqual({ name: "Client" });
    expect(state.project(form, ["name"], true)).toEqual({ name: "Client" });
    form.destroy();
  });
  it("rehydrates server defaults while preserving unsaved sibling drafts", () => {
    const form = build();
    form.patchPathValue("name", "Client");
    form.patchPathValue("billing", "draft");
    state.hydrate(form, { name: "SERVER", billing: "server", calendar: [1] }, [
      "name",
    ]);
    expect(form.getRawValue()).toEqual({
      name: "SERVER",
      billing: "draft",
      calendar: [1],
    });
    expect(form.updatedValue).toEqual({ billing: "draft" });
    form.destroy();
  });
  it("rejects invalid and pending controls without considering other steps", () => {
    const form = build();
    form.requireControl("billing").addValidators(Validators.required);
    form.requireControl("billing").updateValueAndValidity();
    expect(state.valid(form, ["name"])).toBeTrue();
    form.requireControl("name").markAsPending();
    expect(state.valid(form, ["name"])).toBeFalse();
    form.destroy();
  });
});
