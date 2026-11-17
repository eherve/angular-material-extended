import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { CdkDropList } from "@angular/cdk/drag-drop";
import { By } from "@angular/platform-browser";
import { FormControlSortableListComponent } from "./sortable-list.component";

interface Item {
  _id: string;
  required: boolean;
}
@Component({
  imports: [FormControlSortableListComponent],
  template: `<app-form-control-sortable-list
      [control]="control"
      [service]="service"
      [itemActions]="actions"
    />
    <ng-template #actions let-item let-index="index" let-disabled="disabled">
      <button
        class="required-action"
        [disabled]="disabled"
        (click)="toggle(index)"
      >
        {{ item._id }}:{{ index }}:{{ item.required }}
      </button>
    </ng-template>`,
})
class ActionsHost {
  readonly control = new FormControl<Item[]>(
    [
      { _id: "a", required: false },
      { _id: "b", required: false },
      { _id: "c", required: false },
    ],
    { nonNullable: true },
  );
  readonly service = {
    display: (item: unknown): { name: string } => ({
      name: (item as Item)._id,
    }),
    search: async (): Promise<{ data: Item[]; matchCount: number }> => ({
      data: [],
      matchCount: 0,
    }),
  };
  toggle(index: number): void {
    if (this.control.disabled) return;
    this.control.setValue(
      this.control.value.map((item, i) =>
        i === index ? { ...item, required: !item.required } : item,
      ),
    );
    this.control.markAsDirty();
    this.control.markAsTouched();
  }
}

describe("sortable list item actions", () => {
  it("keeps action item and index aligned after reorder and removal", async () => {
    const fixture = TestBed.createComponent(ActionsHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement
      .query(By.directive(CdkDropList))
      .triggerEventHandler("cdkDropListDropped", {
        previousIndex: 2,
        currentIndex: 0,
      });
    fixture.detectChanges();
    const actions = (): HTMLButtonElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll(".required-action"));
    expect(actions().map((button) => button.textContent?.trim())).toEqual([
      "c:0:false",
      "a:1:false",
      "b:2:false",
    ]);
    actions()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual([
      { _id: "c", required: true },
      { _id: "a", required: false },
      { _id: "b", required: false },
    ]);
    fixture.nativeElement.querySelectorAll("[data-remove]")[1].click();
    fixture.detectChanges();
    expect(actions().map((button) => button.textContent?.trim())).toEqual([
      "c:0:true",
      "b:1:false",
    ]);
    expect(fixture.componentInstance.control.dirty).toBeTrue();
    expect(fixture.componentInstance.control.touched).toBeTrue();
  });
  it("refreshes action disabled context when the form control is disabled and reenabled", async () => {
    const fixture = TestBed.createComponent(ActionsHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    const action = (): HTMLButtonElement =>
      fixture.nativeElement.querySelector(".required-action");
    expect(action().disabled).toBeTrue();
    action().click();
    expect(fixture.componentInstance.control.value[0].required).toBeFalse();
    expect(fixture.componentInstance.control.pristine).toBeTrue();
    fixture.componentInstance.control.enable();
    fixture.detectChanges();
    expect(action().disabled).toBeFalse();
    action().click();
    expect(fixture.componentInstance.control.value[0].required).toBeTrue();
  });
});
