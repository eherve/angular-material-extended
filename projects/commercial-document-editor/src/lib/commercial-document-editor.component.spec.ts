import { TestBed } from "@angular/core/testing";
import { CommercialDocumentEditorComponent } from "./commercial-document-editor.component";

describe("CommercialDocumentEditorComponent", () => {
  const child = { id: "child", title: "Child", data: {} };
  const root = { id: "root", title: "Root", data: {}, children: [child] };
  const pricing = {
    grossExclTax: 100,
    lineDiscountAmount: 10,
    subtotalExclTax: 90,
    discountAmount: 9,
    totalDiscountAmount: 19,
    totalExclTax: 81,
    totalVat: 16.2,
    totalInclTax: 97.2,
    vatBreakdown: [{ vatRate: 20, baseExclTax: 81, totalVat: 16.2 }],
  };
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [CommercialDocumentEditorComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(CommercialDocumentEditorComponent);
    fixture.componentRef.setInput("locale", "en-US");
    fixture.componentRef.setInput("nodes", [root]);
    fixture.detectChanges();
    return fixture;
  }
  it("routes root and child actions with their parent and blocks read only actions", async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    const remove = jasmine.createSpy();
    const move = jasmine.createSpy();
    component.removeNode.subscribe(remove);
    component.moveNode.subscribe(move);
    component.remove(root, null);
    component.move(child, root, -1);
    expect(remove).toHaveBeenCalledWith({ node: root, parent: null });
    expect(move).toHaveBeenCalledWith({
      node: child,
      parent: root,
      direction: -1,
    });
    fixture.componentRef.setInput("readOnly", true);
    fixture.detectChanges();
    component.remove(root, null);
    component.move(child, root, 1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(move).toHaveBeenCalledTimes(1);
  });
  it("preserves root and child DOM identities when view nodes are recalculated", async () => {
    const fixture = await setup();
    const before = Array.from(
      fixture.nativeElement.querySelectorAll("mat-expansion-panel"),
    );
    fixture.componentRef.setInput("nodes", [
      { ...root, children: [{ ...child }] },
    ]);
    fixture.detectChanges();
    const after = Array.from(
      fixture.nativeElement.querySelectorAll("mat-expansion-panel"),
    );
    expect(after.length).toBe(2);
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
  });
  it("shows supplied net amounts and switches discount details without recalculating", async () => {
    const fixture = await setup();
    fixture.componentRef.setInput("pricing", pricing);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Remises");
    expect(
      fixture.nativeElement.querySelector(".net-total").textContent,
    ).toContain("81");
    fixture.componentRef.setInput("showDiscounts", false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain("Remises");
    expect(fixture.nativeElement.querySelectorAll(".totals-block").length).toBe(
      3,
    );
  });
  it("shows one warning inside discounts and outside when discounts are hidden", async () => {
    const fixture = await setup();
    fixture.componentRef.setInput("pricing", pricing);
    fixture.componentRef.setInput("warning", "Review discount");
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll(".discount-warning").length,
    ).toBe(1);
    expect(
      fixture.nativeElement.querySelector(".discounts-block .discount-warning")
        .textContent,
    ).toContain("Review discount");
    fixture.componentRef.setInput("showDiscounts", false);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll(".discount-warning").length,
    ).toBe(1);
    expect(fixture.nativeElement.querySelector(".discounts-block")).toBeNull();
  });
});
