import {
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick,
} from "@angular/core/testing";
import { FormControl, NgControl } from "@angular/forms";
import { provideNoopAnimations } from "@angular/platform-browser/animations";

import { DatatableSearchListOption } from "../../types/datatable-column.type";

import { HeaderAutocompleteFilterComponent } from "./header-autocomplete-filter.component";

describe("HeaderAutocompleteFilterComponent", () => {
  let component: HeaderAutocompleteFilterComponent<any>;
  let fixture: ComponentFixture<HeaderAutocompleteFilterComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderAutocompleteFilterComponent],
      providers: [
        { provide: NgControl, useValue: { control: new FormControl() } },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderAutocompleteFilterComponent<any>);
    component = fixture.componentInstance;
    component.column = {
      type: "autocomplete",
      columnDef: "name",
      header: "Name",
      property: "name",
      searchable: true,
      options: async () => [],
    } as any;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should recover after an options loading error", fakeAsync(() => {
    let callCount = 0;
    component.column.options = async () => {
      callCount++;
      if (callCount === 1) throw new Error("load failed");
      return [{ value: "ok", name: "Recovered" }];
    };

    component.input.nativeElement.value = "first";
    component.filter();
    tick(300);
    flushMicrotasks();

    expect(component.searching).toBeFalse();
    expect(component.hasMore).toBeFalse();
    expect(callCount).toBe(1);

    component.input.nativeElement.value = "second";
    component.filter();
    tick(300);
    flushMicrotasks();

    expect(component.searching).toBeFalse();
    expect(callCount).toBe(2);
    expect(component.options).toEqual([{ value: "ok", name: "Recovered" }]);
  }));

  it("resolves a restored ID after initialization and refreshes the displayed input without emitting a filter change", fakeAsync(() => {
    const column = component.column;
    fixture.destroy();
    fixture = TestBed.createComponent(HeaderAutocompleteFilterComponent);
    component = fixture.componentInstance;
    component.column = column;
    let complete!: (option: DatatableSearchListOption) => void;
    Object.assign(column, {
      resolveOption: (): Promise<DatatableSearchListOption> =>
        new Promise((resolve) => {
          complete = resolve;
        }),
      hasGroup: true,
    });
    const onChange = jasmine.createSpy("filter change");
    component.registerOnChange(onChange);
    component.writeValue({ value: "kind-1" });
    fixture.detectChanges();
    flushMicrotasks();
    expect(component.input.nativeElement.value).toBe("");
    expect(component.selectControl.value).toBe("kind-1");
    complete({
      value: "kind-1",
      name: "Rescue",
      color: "purple",
      group: "Operations",
    });
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.input.nativeElement.value).toBe("Rescue");
    expect(component.selectControl.value).toBe("kind-1");
    expect(component.options).toContain(
      jasmine.objectContaining({ value: "kind-1", color: "purple" }),
    );
    expect(component.groups[0]?.options[0]?.name).toBe("Rescue");
    expect(onChange).not.toHaveBeenCalled();
  }));

  it("does not fetch a restored option already available in the suggestions", fakeAsync(() => {
    const resolve = jasmine.createSpy("resolve").and.resolveTo(null);
    Object.assign(component.column, { resolveOption: resolve });
    component.options = [{ value: "known", name: "Known option" }];
    component.writeValue({ value: "known" });
    flushMicrotasks();

    expect(component.input.nativeElement.value).toBe("Known option");
    expect(resolve).not.toHaveBeenCalled();
  }));

  it("resolves a numeric zero value and retains its label when search suggestions are replaced", fakeAsync(() => {
    Object.assign(component.column, {
      resolveOption: async (): Promise<DatatableSearchListOption> => ({
        value: 0,
        name: "Zero",
      }),
    });
    component.writeValue({ value: 0 });
    flushMicrotasks();
    component.input.nativeElement.value = "different";
    component.filter();
    tick(300);
    flushMicrotasks();

    expect(component.displayWith(0)).toBe("Zero");
  }));

  it("ignores a late resolution after the restored value changes", fakeAsync(() => {
    let completeFirst!: (value: DatatableSearchListOption) => void;
    Object.assign(component.column, {
      resolveOption: (value: unknown): Promise<DatatableSearchListOption> =>
        value === "first"
          ? new Promise((resolve) => {
              completeFirst = resolve;
            })
          : Promise.resolve({ value: "second", name: "Second option" }),
    });
    component.writeValue({ value: "first" });
    component.writeValue({ value: "second" });
    flushMicrotasks();
    completeFirst({ value: "first", name: "Outdated option" });
    flushMicrotasks();

    expect(component.input.nativeElement.value).toBe("Second option");
    expect(component.selectControl.value).toBe("second");
    expect(
      component.options.some((option) => option.value === "first"),
    ).toBeFalse();
  }));

  it("does not overwrite user input when a previous resolution finishes", fakeAsync(() => {
    let complete!: (value: DatatableSearchListOption) => void;
    Object.assign(component.column, {
      resolveOption: (): Promise<DatatableSearchListOption> =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    });
    component.writeValue({ value: "kind-1" });
    flushMicrotasks();
    component.input.nativeElement.value = "new search";
    component.input.nativeElement.dispatchEvent(new Event("input"));
    complete({ value: "kind-1", name: "Old label" });
    flushMicrotasks();

    expect(component.input.nativeElement.value).toBe("new search");
    expect(component.options).toEqual([]);
    tick(300);
    flushMicrotasks();
  }));

  it("keeps the restored filter value when resolution fails or finds no option", fakeAsync(() => {
    Object.assign(component.column, {
      resolveOption: async (value: unknown): Promise<null> => {
        if (value === "failed") throw new Error("Unavailable");
        return null;
      },
    });
    component.writeValue({ value: "failed" });
    flushMicrotasks();
    expect(component.selectControl.value).toBe("failed");
    expect(component.input.nativeElement.value).toBe("");
    component.writeValue({ value: "missing" });
    flushMicrotasks();
    expect(component.selectControl.value).toBe("missing");
    expect(component.input.nativeElement.value).toBe("");
  }));

  it("does not update a destroyed control when resolution finishes", fakeAsync(() => {
    let complete!: (value: DatatableSearchListOption) => void;
    Object.assign(component.column, {
      resolveOption: (): Promise<DatatableSearchListOption> =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    });
    component.writeValue({ value: "kind-1" });
    fixture.destroy();
    complete({ value: "kind-1", name: "Late option" });
    flushMicrotasks();

    expect(component.options).toEqual([]);
  }));
  it("keeps the original raw-value display for columns without a resolver", fakeAsync(() => {
    component.writeValue({ value: "raw-value" });
    flushMicrotasks();
    expect(component.input.nativeElement.value).toBe("raw-value");
  }));
});
