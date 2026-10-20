import { TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { CdkDropList } from "@angular/cdk/drag-drop";
import { FormControlSortableListComponent } from "./sortable-list.component";

const a = { _id: "a" },
  b = { _id: "b" },
  c = { _id: "c" };
describe("sortable list rendered control", () => {
  async function setup(disabled = false) {
    const fixture = TestBed.createComponent(FormControlSortableListComponent);
    const control = new FormControl<unknown[]>(
      { value: [a, b, c], disabled },
      { nonNullable: true },
    );
    fixture.componentRef.setInput("control", control);
    fixture.componentRef.setInput("service", {
      display: (item: unknown) => ({
        name: String(Reflect.get(item as object, "_id")),
      }),
      search: async () => ({ data: [], matchCount: 0 }),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, control };
  }
  it("only clears the add-field draft and preserves selected items", async () => {
    const { fixture, control } = await setup();
    const clearButton = () =>
      fixture.nativeElement.querySelector(
        '[aria-label="Effacer"]',
      ) as HTMLButtonElement | null;
    expect(clearButton()).toBeNull();
    const input = fixture.nativeElement.querySelector(
      "input",
    ) as HTMLInputElement;
    input.value = "new item";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(clearButton()).not.toBeNull();
    clearButton()?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.value).toBe("");
    expect(control.value).toEqual([a, b, c]);
    expect(control.pristine).toBeTrue();
    expect(clearButton()).toBeNull();
  });
  it("persistsReorderedValue", async () => {
    const { fixture, control } = await setup();
    fixture.debugElement
      .query(By.directive(CdkDropList))
      .triggerEventHandler("cdkDropListDropped", {
        previousIndex: 2,
        currentIndex: 0,
      });
    fixture.detectChanges();
    expect(control.value).toEqual([c, a, b]);
    expect(control.dirty).toBeTrue();
    expect(control.touched).toBeTrue();
    expect(
      Array.from(fixture.nativeElement.querySelectorAll(".selected-name")).map(
        (el: unknown) => (el as HTMLElement).textContent?.trim(),
      ),
    ).toEqual(["c", "a", "b"]);
  });
  it("doesNotReorderDisabledControl", async () => {
    const { fixture, control } = await setup(true);
    fixture.debugElement
      .query(By.directive(CdkDropList))
      .triggerEventHandler("cdkDropListDropped", {
        previousIndex: 2,
        currentIndex: 0,
      });
    expect(control.value).toEqual([a, b, c]);
    expect(control.pristine).toBeTrue();
    expect(fixture.nativeElement.querySelector("input").disabled).toBeTrue();
  });
  it("removes by rendered button and updates control state", async () => {
    const { fixture, control } = await setup();
    fixture.nativeElement.querySelector("[data-remove]").click();
    await fixture.whenStable();
    expect(control.value).toEqual([b, c]);
    expect(control.dirty).toBeTrue();
  });
});
