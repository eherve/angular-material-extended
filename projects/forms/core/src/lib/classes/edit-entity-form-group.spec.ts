import { fakeAsync, tick } from "@angular/core/testing";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import {
  EditEntityFormControl,
  EditEntityFormGroup,
} from "./edit-entity-form-group";

describe("EditEntityFormGroup change tracking", () => {
  it("returns only the changed properties with the array entity identifier", fakeAsync(() => {
    const group = new EditEntityFormGroup({
      items: new FormArray([
        new FormGroup({
          _id: new FormControl("a"),
          title: new FormControl("old"),
          unchanged: new FormControl(2),
        }),
      ]),
    });
    group.requireControl("items.0.title").setValue("new");
    tick(51);
    expect(group.updatedValue).toEqual({ items: [{ _id: "a", title: "new" }] });
    group.destroy();
  }));
  it("preserves an atomic array ordering and resets its baseline", () => {
    const group = new EditEntityFormGroup();
    group.setPathControl("items", new EditEntityFormControl(["a", "b"]));
    group.patchPathValue("items", ["b", "a"]);
    expect(group.updatedValue).toEqual({ items: ["b", "a"] });
    group.resetInitialValue("items");
    expect(group.isUpdated).toBeFalse();
    group.destroy();
  });
  it("keeps dotted fields alongside an atomic parent and normalizes changes", () => {
    const group = new EditEntityFormGroup();
    group.setControl(
      "configuration",
      new EditEntityFormControl({ enabled: false }),
    );
    group.setPathControl(
      "configuration.enabled",
      new EditEntityFormControl(false),
    );
    group.patchPathValue("configuration", { enabled: true });
    expect(group.requireControl("configuration.enabled").value).toBeTrue();
    group.destroy();
  });
  it("keeps date adapter instances equal to their Date representation", fakeAsync(() => {
    const group = new EditEntityFormGroup({
      date: new EditEntityFormControl(new Date("2026-10-16T12:00:00Z")),
    });
    group
      .requireControl("date")
      .setValue({ toDate: () => new Date("2026-10-16T12:00:00Z") });
    tick(51);
    expect(group.isUpdated).toBeFalse();
    group.destroy();
  }));
});
