import { ElementRef } from "@angular/core";
import { EditEntityResponsiveGridDirective } from "./edit-entity-responsive-grid.directive";
describe("responsive edit grid", () => {
  it("preserves fixed grid when a card spans rows", () => {
    const element = document.createElement("div");
    Object.defineProperty(element, "clientWidth", { value: 240 });
    const card = document.createElement("div");
    card.style.setProperty("--edit-entity-item-col-span", "1");
    card.style.setProperty("--edit-entity-item-row-span", "2");
    element.append(card);
    document.body.append(element);
    const directive = new EditEntityResponsiveGridDirective(
      new ElementRef(element),
    );
    directive.grid = { columns: 3, minColumnWidth: "200px" };
    directive.ngAfterViewInit();
    expect(
      element.style.getPropertyValue("--edit-entity-grid-effective-columns"),
    ).toBe("3");
    expect(card.style.gridRow).toBe("span 2");
    directive.ngOnDestroy();
    element.remove();
  });
});
