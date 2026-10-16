import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, Validators } from "@angular/forms";
import { FormControlAutocompleteComponent } from "./autocomplete.component";
import { SearchControlService } from "./search-control-base";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";

describe("autocomplete rendered interactions", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }),
  );
  async function setup(multiple = true, service?: SearchControlService) {
    const fixture = TestBed.createComponent(FormControlAutocompleteComponent);
    const control = new FormControl<unknown>(
      multiple ? [{ _id: "same" }] : false,
      Validators.required,
    );
    fixture.componentRef.setInput("control", control);
    fixture.componentRef.setInput("multiple", multiple);
    fixture.componentRef.setInput(
      "service",
      service ?? {
        display: (value: unknown) => ({
          name:
            typeof value === "object" && value !== null
              ? String(Reflect.get(value, "_id"))
              : String(value),
        }),
        group: () => "Group",
        search: async () => ({
          data: [{ _id: "same" }, { _id: "new" }],
          matchCount: 2,
        }),
      },
    );
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, control, overlay: fixture.nativeElement as HTMLElement };
  }
  it("deduplicatesEqualEntityIds when selecting a rendered option", async () => {
    const { fixture, control, overlay } = await setup();
    fixture.nativeElement.querySelector("input").focus();
    await fixture.whenStable();
    expect(overlay.textContent).toContain("Group");
    (overlay.querySelector("mat-option") as HTMLElement).click();
    await fixture.whenStable();
    expect(control.value).toEqual([{ _id: "same" }]);
    fixture.nativeElement.querySelector("input").click();
    await fixture.whenStable();
    (overlay.querySelectorAll("mat-option")[1] as HTMLElement).click();
    await fixture.whenStable();
    expect(control.value).toEqual([{ _id: "same" }, { _id: "new" }]);
    expect(control.dirty).toBeTrue();
    expect(control.touched).toBeTrue();
  });
  it("keeps false selection pristine and clears through rendered button", async () => {
    const { fixture, control } = await setup(false);
    expect(fixture.nativeElement.querySelector("input").value).toBe("false");
    expect(control.pristine).toBeTrue();
    fixture.nativeElement.querySelector("button").click();
    await fixture.whenStable();
    expect(control.value).toBeNull();
    expect(control.hasError("required")).toBeTrue();
    const intl = TestBed.inject(EditEntityDialogIntl);
    intl.messages.required = "Required replacement";
    intl.changes.next();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Required replacement");
  });
  it("renders an asynchronous failure and retry without optional event listeners", async () => {
    let fail = true;
    const { fixture, control, overlay } = await setup(true, {
      display: () => ({ name: "Recovered" }),
      search: async () => {
        if (fail) throw Error("offline");
        return { data: [{ _id: "ok" }], matchCount: 1 };
      },
    });
    fixture.nativeElement.querySelector("input").focus();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector("[role=alert]").textContent,
    ).toContain(TestBed.inject(EditEntityDialogIntl).messages.searchFailed);
    expect(control.value).toEqual([{ _id: "same" }]);
    fail = false;
    fixture.nativeElement.querySelector("[role=alert] button").click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("[role=alert]")).toBeNull();
    fixture.nativeElement.querySelector("input").click();
    await fixture.whenStable();
    expect(overlay.textContent).toContain("Recovered");
  });
});

describe("search control engine validation", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }),
  );
  async function setup(multiple: boolean) {
    const fixture = TestBed.createComponent(FormControlAutocompleteComponent);
    const selected = { _id: "a" };
    const control = new FormControl<unknown>(multiple ? [selected] : selected, [
      Validators.required,
      (c) => (typeof c.value === "string" ? { invalidEntity: true } : null),
    ]);
    fixture.componentRef.setInput("control", control);
    fixture.componentRef.setInput("multiple", multiple);
    fixture.componentRef.setInput("service", {
      display: (value: { _id: string }) => ({ name: value._id }),
      search: async () => ({ data: [], matchCount: 0 }),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, control };
  }
  it("keeps an unselected single replacement draft dirty and invalid through blur", async () => {
    const { fixture, control } = await setup(false);
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input");
    input.value = "replacement";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("blur"));
    await fixture.whenStable();
    expect(control.value).toBe("replacement");
    expect(control.dirty).toBeTrue();
    expect(control.touched).toBeTrue();
    expect(control.hasError("invalidEntity")).toBeTrue();
    expect(input.value).toBe("replacement");
  });
  it("uses valid required multiple selection rather than the empty search draft for Material state", async () => {
    const { fixture, control } = await setup(true);
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input");
    input.dispatchEvent(new Event("blur"));
    await fixture.whenStable();
    expect(control.valid).toBeTrue();
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(
      fixture.nativeElement.querySelector(".mat-form-field-invalid"),
    ).toBeNull();
  });
  it("associates actual engine custom errors with the search input through Material", async () => {
    const { fixture, control } = await setup(true);
    control.setErrors({ invalidEntity: true });
    control.markAsTouched();
    await fixture.whenStable();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input");
    const error: HTMLElement | null =
      fixture.nativeElement.querySelector("mat-error");
    expect(error).not.toBeNull();
    expect(error?.textContent).toContain(
      TestBed.inject(EditEntityDialogIntl).messages.invalidEntity,
    );
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(
      error?.id,
    );
  });
});

describe("string-valued autocomplete display", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }),
  );
  async function setup(multiple: boolean) {
    const fixture = TestBed.createComponent(FormControlAutocompleteComponent);
    const control = new FormControl<unknown>(
      multiple ? ["customer-id"] : "customer-id",
    );
    fixture.componentRef.setInput("control", control);
    fixture.componentRef.setInput("multiple", multiple);
    fixture.componentRef.setInput("service", {
      display: () => ({ name: "Customer name" }),
      search: async () => ({ data: ["customer-id"], matchCount: 1 }),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, control };
  }
  it("formats real string options and single selections while retaining draft text through blur", async () => {
    const { fixture, control } = await setup(false);
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input");
    expect(input.value).toBe("Customer name");
    input.focus();
    await fixture.whenStable();
    const option: HTMLElement =
      fixture.nativeElement.querySelector("mat-option");
    expect(option.textContent).toContain("Customer name");
    input.value = "customer-id";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("blur"));
    await fixture.whenStable();
    expect(input.value).toBe("customer-id");
    option.click();
    await fixture.whenStable();
    expect(control.value).toBe("customer-id");
    expect(input.value).toBe("Customer name");
    control.setValue("other-customer-id");
    await fixture.whenStable();
    expect(input.value).toBe("Customer name");
  });
  it("formats real string values in selected multiple rows", async () => {
    const { fixture, control } = await setup(true);
    expect(
      fixture.nativeElement.querySelector(".selected-name").textContent,
    ).toContain("Customer name");
    expect(control.value).toEqual(["customer-id"]);
  });
});

describe("autocomplete draft presentation changes", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }),
  );
  it("preserves a typed single draft across an asynchronous hint update without formatting it as an entity", async () => {
    const fixture = TestBed.createComponent(FormControlAutocompleteComponent);
    const control = new FormControl<unknown>({ _id: "selected" });
    const formattedDrafts: string[] = [];
    fixture.componentRef.setInput("control", control);
    fixture.componentRef.setInput("service", {
      display: (value: unknown) => {
        if (typeof value === "string") {
          formattedDrafts.push(value);
          return { name: "Wrongly formatted draft" };
        }
        return { name: "Selected entity" };
      },
      search: async () => ({ data: [], matchCount: 0 }),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input");
    input.value = "unselected draft";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("blur"));
    await fixture.whenStable();
    expect(input.value).toBe("unselected draft");
    await Promise.resolve();
    fixture.componentRef.setInput("hint", "Asynchronous hint");
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Asynchronous hint");
    expect(input.value).toBe("unselected draft");
    expect(control.value).toBe("unselected draft");
    expect(control.dirty).toBeTrue();
    expect(formattedDrafts).toEqual([]);
  });
});

describe("autocomplete HTML prefix and required presentation", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }),
  );
  for (const multiple of [false, true]) {
    it(`renders sanitized HTML prefixes and colors for ${multiple ? "multiple" : "single"} selections and options`, async () => {
      const fixture = TestBed.createComponent(FormControlAutocompleteComponent);
      const selected = { _id: "selected" };
      const control = new FormControl<unknown>(
        multiple ? [selected] : selected,
        Validators.required,
      );
      fixture.componentRef.setInput("control", control);
      fixture.componentRef.setInput("multiple", multiple);
      fixture.componentRef.setInput("service", {
        display: () => ({
          name: "Task name",
          color: "rgb(1, 2, 3)",
          prefix:
            '<span color="primary">Kanban</span> <span light> &gt; Backlog</span><img onerror="alert(1)"><script>alert(1)</script>',
        }),
        search: async () => ({ data: [selected], matchCount: 1 }),
      });
      fixture.detectChanges();
      await fixture.whenStable();
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector("input");
      const selection: HTMLElement = fixture.nativeElement.querySelector(
        multiple ? ".selected-name" : "[matPrefix]",
      );
      expect(selection).not.toBeNull();
      expect(selection?.querySelector("span")?.textContent).toBe("Kanban");
      expect(selection?.textContent).toContain("> Backlog");
      expect(selection?.innerHTML).not.toContain("onerror");
      expect(selection?.querySelector("script")).toBeNull();
      const colored: HTMLElement = multiple
        ? selection?.querySelector("span[style]")!
        : input;
      expect(colored?.style.color).toBe("rgb(1, 2, 3)");
      expect(control.value).toEqual(multiple ? [selected] : selected);
      input.focus();
      await fixture.whenStable();
      const option: HTMLElement =
        fixture.nativeElement.querySelector("mat-option");
      expect(option.querySelector("small span")?.textContent).toBe("Kanban");
      expect(option.querySelector("script")).toBeNull();
      expect(option.innerHTML).not.toContain("onerror");
      expect(
        option.querySelector<HTMLElement>("span[style]")?.style.color,
      ).toBe("rgb(1, 2, 3)");
      fixture.destroy();
    });
  }
  it("reflects required changes for assistive technology without validating the multiple search draft", async () => {
    const fixture = TestBed.createComponent(FormControlAutocompleteComponent);
    const control = new FormControl<unknown>(
      [{ _id: "selected" }],
      Validators.required,
    );
    fixture.componentRef.setInput("control", control);
    fixture.componentRef.setInput("multiple", true);
    fixture.componentRef.setInput("service", {
      display: () => ({ name: "Selected" }),
      search: async () => ({ data: [], matchCount: 0 }),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input");
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(fixture.componentInstance.inputControl.value).toBeNull();
    expect(fixture.componentInstance.inputControl.valid).toBeTrue();
    expect(control.valid).toBeTrue();
    control.clearValidators();
    control.updateValueAndValidity();
    await fixture.whenStable();
    expect(input.getAttribute("aria-required")).toBe("false");
    expect(control.valid).toBeTrue();
  });
});
