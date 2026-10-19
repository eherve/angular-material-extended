import { TestBed } from "@angular/core/testing";
import { EMPTY } from "rxjs";
import moment from "moment";
import {
  EditEntityComponentOptions,
  EditEntityDialogService,
  EditEntityFormGroup,
} from "@eherve/angular-material-edit-entity-dialog";
import { EditEntityDialogDemoComponent } from "./edit-entity-dialog-demo.component";
interface TestRecord {
  _id?: string;
  name: string;
}
describe("EditEntityDialog demo adapter values", () => {
  let component: EditEntityDialogDemoComponent;
  let opened: EditEntityComponentOptions<TestRecord>[];
  beforeEach(() => {
    opened = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EditEntityDialogService,
          useValue: {
            open: (options: EditEntityComponentOptions<TestRecord>) => {
              opened.push(options);
              return { afterClosed: () => EMPTY };
            },
          },
        },
      ],
    });
    component = TestBed.runInInjectionContext(
      () => new EditEntityDialogDemoComponent(),
    );
  });
  it("persists archive then unarchive state across reopened dialogs", async () => {
    component.openEdit();
    const archived = await opened[0].service!.archive!("demo-1");
    expect(archived && archived.isArchived).toBeTrue();
    expect(archived && Reflect.get(archived, "at")).toEqual(
      jasmine.any(String),
    );
    component.openEdit();
    expect(Reflect.get(opened[1].record!, "__archived")).toEqual(archived);
    const unarchived = await opened[1].service!.archive!("demo-1");
    expect(unarchived && unarchived.isArchived).toBeFalse();
    expect(unarchived && Reflect.get(unarchived, "at")).toEqual(
      jasmine.any(String),
    );
    component.openEdit();
    expect(Reflect.get(opened[2].record!, "__archived")).toEqual(unarchived);
  });
  it("creates and reopens a Moment date without losing its adapter type or sharing state", async () => {
    component.openCreate();
    const options = opened[0];
    const form = new EditEntityFormGroup();
    const selected = moment([2026, 9, 16]);
    try {
      const created = await options.service!.create!(
        { name: "Created with date", date: selected },
        form,
        options,
      );
      expect(created).not.toBeFalse();
      if (!created) throw new Error("Expected created record");
      const returnedDate = Reflect.get(created, "date");
      expect(moment.isMoment(returnedDate)).toBeTrue();
      expect(returnedDate.valueOf()).toBe(selected.valueOf());
      expect(returnedDate).not.toBe(selected);
      selected.add(7, "days");
      component.openEdit();
      const reopened = Reflect.get(opened[1].record!, "date");
      expect(moment.isMoment(reopened)).toBeTrue();
      expect(reopened.format("YYYY-MM-DD")).toBe("2026-10-16");
      reopened.add(2, "days");
      component.openEdit();
      expect(Reflect.get(opened[2].record!, "date").format("YYYY-MM-DD")).toBe(
        "2026-10-16",
      );
    } finally {
      form.destroy();
    }
  });
  it("updates and reopens Moment and native Date values without serializing either", async () => {
    component.openEdit();
    const options = opened[0];
    const form = new EditEntityFormGroup();
    const selected = moment([2026, 9, 16]);
    const native = new Date(2026, 9, 17, 14, 30);
    try {
      const updated = await options.service!.update!(
        "demo-1",
        { date: selected, datetime: native },
        form,
        options,
      );
      expect(typeof updated).toBe("object");
      if (typeof updated !== "object")
        throw new Error("Expected updated record");
      expect(moment.isMoment(Reflect.get(updated, "date"))).toBeTrue();
      expect(Reflect.get(updated, "datetime") instanceof Date).toBeTrue();
      expect(Reflect.get(updated, "datetime").getTime()).toBe(native.getTime());
      expect(Reflect.get(updated, "datetime")).not.toBe(native);
      const savedTimestamp = native.getTime();
      selected.add(7, "days");
      native.setDate(native.getDate() + 7);
      component.openEdit();
      expect(Reflect.get(opened[1].record!, "date").format("YYYY-MM-DD")).toBe(
        "2026-10-16",
      );
      expect(Reflect.get(opened[1].record!, "datetime").getTime()).toBe(
        savedTimestamp,
      );
    } finally {
      form.destroy();
    }
  });
});
