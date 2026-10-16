import { EditEntityDialog } from "./edit-entity-dialog.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {
  EditEntityDialogResult,
  EditEntityRecord,
} from "../../edit-entity-dialog.types";
import { EditEntityComponent } from "../edit-entity-component/edit-entity-component.component";
describe("EditEntityDialog keyboard", () => {
  function setup(top = true) {
    const ref = { close: jasmine.createSpy() } as unknown as MatDialogRef<
      EditEntityDialog,
      EditEntityDialogResult<EditEntityRecord>
    >;
    const dialogs = { openDialogs: top ? [ref] : [ref, {}] } as MatDialog;
    const dialog = new EditEntityDialog(
      { displayOptions: { sections: [] } },
      ref,
      dialogs,
    );
    const engine = {
      submitFromKeyboard: jasmine.createSpy().and.returnValue(true),
      requestClose: jasmine.createSpy(),
    };
    Object.assign(dialog, {
      editEntityComponent: engine as unknown as EditEntityComponent,
    });
    return { dialog, engine };
  }
  it("handlesKeysOnlyForTopDialog", () => {
    const { dialog, engine } = setup(false);
    dialog.onKeydownEnter(new KeyboardEvent("keydown", { key: "Enter" }));
    dialog.onKeydownEscape(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(engine.submitFromKeyboard).not.toHaveBeenCalled();
    expect(engine.requestClose).not.toHaveBeenCalled();
  });
  it("submits and closes top dialog", () => {
    const { dialog, engine } = setup();
    dialog.onKeydownEnter(new KeyboardEvent("keydown", { key: "Enter" }));
    dialog.onKeydownEscape(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(engine.submitFromKeyboard).toHaveBeenCalledTimes(1);
    expect(engine.requestClose).toHaveBeenCalledTimes(1);
  });
  it("doesNotSubmitWhenAutocompleteOwnsEnter", () => {
    const { dialog, engine } = setup();
    const input = document.createElement("input");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "true");
    input.addEventListener("keydown", (event) => dialog.onKeydownEnter(event));
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(engine.submitFromKeyboard).not.toHaveBeenCalled();
  });
  it("does not submit multiline or already handled Enter", () => {
    const { dialog, engine } = setup();
    const textarea = document.createElement("textarea");
    textarea.addEventListener("keydown", (event) =>
      dialog.onKeydownEnter(event),
    );
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    const handled = new KeyboardEvent("keydown", {
      key: "Enter",
      cancelable: true,
    });
    handled.preventDefault();
    dialog.onKeydownEnter(handled);
    expect(engine.submitFromKeyboard).not.toHaveBeenCalled();
  });
  it("closes from a multiline input on Escape", () => {
    const { dialog, engine } = setup();
    const textarea = document.createElement("textarea");
    textarea.addEventListener("keydown", (event) =>
      dialog.onKeydownEscape(event),
    );
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(engine.requestClose).toHaveBeenCalledTimes(1);
  });
});
