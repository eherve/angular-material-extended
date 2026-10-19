import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { EditEntityAutocompleteFieldComponent } from "./edit-entity-autocomplete-field.component";
import { EditEntitySortableListFieldComponent } from "../edit-entity-sortable-list-field/edit-entity-sortable-list-field.component";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { FormControl } from "@angular/forms";
import { AutocompleteFormField } from "../edit-entity-field.types";

describe("search field adapters", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }),
  );
  it("forwards the frozen service argument order and refreshes replaced conditional hints", async () => {
    const fixture = TestBed.createComponent(
      EditEntityAutocompleteFieldComponent,
    );
    const form = new EditEntityFormGroup();
    form.addControl("value", new FormControl([{ _id: "selected" }]));
    const record = { _id: "record" };
    const hint = new Subject<string | undefined>();
    const replacement = new Subject<string | undefined>();
    const requests: unknown[][] = [];
    const field: AutocompleteFormField<typeof record> = {
      kind: "autocomplete",
      name: "value",
      label: "Value",
      multiple: true,
      hint,
      service: {
        display: () => ({ name: "Option" }),
        search: async (...args) => {
          requests.push(args);
          return { data: [], matchCount: 0 };
        },
      },
    };
    fixture.componentRef.setInput("record", record);
    fixture.componentRef.setInput("formGroup", form);
    fixture.componentRef.setInput("field", field);
    fixture.detectChanges();
    hint.next("First hint");
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("First hint");
    fixture.nativeElement.querySelector("input").focus();
    await fixture.whenStable();
    expect(requests[0]).toEqual([
      10,
      0,
      "",
      record,
      form,
      [{ _id: "selected" }],
    ]);
    fixture.componentRef.setInput("field", { ...field, hint: replacement });
    fixture.detectChanges();
    hint.next("Obsolete hint");
    replacement.next("Current hint");
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Current hint");
    expect(fixture.nativeElement.textContent).not.toContain("Obsolete hint");
    fixture.destroy();
    expect(hint.observed).toBeFalse();
    expect(replacement.observed).toBeFalse();
    form.destroy();
  });
  it("compiles the sortable adapter against the same direct control contract", async () => {
    const fixture = TestBed.createComponent(
      EditEntitySortableListFieldComponent,
    );
    const form = new EditEntityFormGroup();
    form.addControl("value", new FormControl([{ _id: "a" }]));
    fixture.componentRef.setInput("formGroup", form);
    fixture.componentRef.setInput("field", {
      kind: "sortable-list",
      name: "value",
      label: "Items",
      service: {
        display: () => ({ name: "A" }),
        search: async () => ({ data: [], matchCount: 0 }),
      },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("A");
    fixture.destroy();
    form.destroy();
  });
});
