import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { SubSink } from "subsink";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityField } from "../../edit-entity-dialog.types";
import { EditEntityConditionalStateService } from "../../services/edit-entity-conditional-state.service";
import { EditEntityFormBuilderService } from "../../services/edit-entity-form-builder.service";
import { EditEntityDateFieldComponent } from "./edit-entity-date-field.component";

describe("EditEntityDateFieldComponent lock permission", () => {
  let fixture: ComponentFixture<EditEntityDateFieldComponent<{ _id?: string }>>;
  let formGroup: EditEntityFormGroup;
  let sink: SubSink;

  function render(canToggleLock?: boolean, fieldOverrides: Partial<EditEntityField> = {}) {
    const field: EditEntityField = {
      kind: "date", name: "date", label: "Date", lockedProperty: "locked", canToggleLock,
      ...fieldOverrides,
    } as EditEntityField;
    sink = new SubSink();
    formGroup = TestBed.inject(EditEntityFormBuilderService).buildFormGroup(
      {
        record: { _id: "existing", locked: true } as { _id: string; locked: boolean },
        displayOptions: { sections: [] },
        prepareFormGroup: group => group.addControl("bound", new FormControl(new Date(2026, 0, 2))),
      },
      [field], sink, () => undefined,
    );
    fixture = TestBed.createComponent(EditEntityDateFieldComponent);
    fixture.componentInstance.formGroup = formGroup;
    fixture.componentInstance.field = field as never;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEntityDateFieldComponent, MatNativeDateModule],
      providers: [EditEntityConditionalStateService, EditEntityFormBuilderService],
    }).compileComponents();
  });

  afterEach(() => {
    sink?.unsubscribe();
    formGroup?.destroy();
  });

  it("keeps a locked date disabled and hides the lock button without permission", () => {
    render();

    expect(formGroup.requireControl("date").disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector("button[data-lock-toggle]")).toBeNull();
    expect(formGroup.getControl("locked")).toBeTruthy();
  });

  it("updates its minimum when the linked form path changes", () => {
    render(undefined, { min: "bound" });
    const nextBound = new Date(2026, 0, 3);

    formGroup.requireControl("bound").setValue(nextBound);
    fixture.detectChanges();

    expect(fixture.componentInstance.min).toBe(nextBound);
  });

  it("normalizes included values to the start of the day", () => {
    render(undefined, { included: true });
    const picked = new Date(2026, 0, 4, 15, 30);

    formGroup.requireControl("date").setValue(picked);

    expect(formGroup.requireControl("date").value).toEqual(new Date(2026, 0, 4, 0, 0));
  });

  it("reevaluates form-dependent lock permission and checks it again when toggling", () => {
    const field: EditEntityField = {
      kind: "date", name: "date", label: "Date", lockedProperty: "locked",
      canToggleLock: (_record, group) => group.get("allowLock")?.value === true,
    } as EditEntityField;
    sink = new SubSink();
    formGroup = new EditEntityFormGroup({
      date: new FormControl({ value: new Date(2026, 0, 2), disabled: true }),
      locked: new FormControl(true),
      allowLock: new FormControl(true),
    });
    fixture = TestBed.createComponent(EditEntityDateFieldComponent);
    fixture.componentInstance.formGroup = formGroup;
    fixture.componentInstance.field = field as never;
    fixture.detectChanges();
    const allow = formGroup.requireControl("allowLock");
    const locked = formGroup.requireControl("locked");
    expect(fixture.nativeElement.querySelector("button[data-lock-toggle]")).toBeTruthy();
    allow.setValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("button[data-lock-toggle]")).toBeNull();
    fixture.componentInstance.toggleLock(new Event("click"));
    expect(locked.value).toBeTrue();
  });

  it("marks clear interactions dirty and touched", () => {
    render(true);
    const date = formGroup.requireControl("date");
    formGroup.requireControl("locked").setValue(false);
    fixture.detectChanges();
    fixture.componentInstance.clearValue();
    expect(date.value).toBeNull();
    expect(date.dirty).toBeTrue();
    expect(date.touched).toBeTrue();
  });

  it("allows toggling the existing lock control when explicitly permitted", () => {
    render(true);
    const lockControl = formGroup.requireControl("locked");
    const button = fixture.nativeElement.querySelector("button[data-lock-toggle]") as HTMLButtonElement;

    expect(button).toBeTruthy();
    button.click();
    fixture.detectChanges();

    expect(formGroup.requireControl("locked")).toBe(lockControl);
    expect(lockControl.value).toBeFalse();
  });
});
