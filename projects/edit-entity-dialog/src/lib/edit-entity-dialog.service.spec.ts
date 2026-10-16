import { TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { EditEntityDialogService } from "./edit-entity-dialog.service";
import { EditEntityDialog } from "./components/edit-entity-dialog/edit-entity-dialog.component";
import { EditEntityComponentOptions } from "./edit-entity-dialog.types";
describe("EditEntityDialogService configuration", () => {
  it("preserves source viewport height and caller overrides", () => {
    const open = jasmine.createSpy().and.returnValue({});
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: { open } }],
    });
    const service = TestBed.inject(EditEntityDialogService);
    const options: EditEntityComponentOptions = {
      displayOptions: { sections: [] },
    };
    service.open(options, { nested: null });
    expect(open).toHaveBeenCalledWith(
      EditEntityDialog,
      jasmine.objectContaining({
        height: "90vh",
        maxHeight: "90vh",
        data: options,
      }),
    );
    service.open(options, { nested: null, height: "75vh" });
    expect(open.calls.mostRecent().args[1].height).toBe("75vh");
  });
});
