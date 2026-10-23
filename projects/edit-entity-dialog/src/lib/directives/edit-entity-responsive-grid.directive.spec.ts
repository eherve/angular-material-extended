import { ElementRef } from "@angular/core";
import { EditEntityResponsiveGridDirective } from "./edit-entity-responsive-grid.directive";
describe("responsive edit grid", () => {
  for (const explicitGap of [undefined, '12px']) {
    it(`refreshes inherited gap changes on ancestors while preserving ${explicitGap ?? 'the default gap'}`, async () => {
      const theme = document.createElement('style');
      theme.textContent = '.responsive-grid-wide-gap { --ngx-mat-extended-space-3: 32px; }';
      document.head.append(theme);
      const ancestor = document.createElement('div');
      ancestor.style.setProperty('--ngx-mat-extended-space-3', '12px');
      const element = document.createElement('div');
      element.style.cssText = 'display:grid;width:420px;height:40px;grid-template-columns:repeat(var(--edit-entity-grid-effective-columns, 2), 1fr)';
      element.style.columnGap = explicitGap ?? 'var(--ngx-mat-extended-space-3, 16px)';
      for (let index = 0; index < 2; index++) {
        const item = document.createElement('div');
        item.style.height = '20px';
        element.append(item);
      }
      ancestor.append(element);
      document.body.append(ancestor);
      const directive = new EditEntityResponsiveGridDirective(new ElementRef(element));
      directive.grid = { columns: 2, gap: explicitGap ?? 'var(--ngx-mat-extended-space-3, 16px)', minColumnWidth: '200px' };
      try {
        directive.ngAfterViewInit();
        expect(element.style.getPropertyValue('--edit-entity-grid-effective-columns')).toBe('2');
        ancestor.style.setProperty('--ngx-mat-extended-space-3', '32px');
        await Promise.resolve();
        expect(element.style.getPropertyValue('--edit-entity-grid-effective-columns')).toBe(explicitGap ? '2' : '1');
        ancestor.style.removeProperty('--ngx-mat-extended-space-3');
        await Promise.resolve();
        expect(element.style.getPropertyValue('--edit-entity-grid-effective-columns')).toBe('2');
        ancestor.classList.add('responsive-grid-wide-gap');
        await Promise.resolve();
        expect(element.style.getPropertyValue('--edit-entity-grid-effective-columns')).toBe(explicitGap ? '2' : '1');
      } finally { directive.ngOnDestroy(); ancestor.remove(); theme.remove(); }
    });
  }
  for (const gap of ["var(--ngx-mat-extended-space-3, 16px)", "12px"]) {
    it(`uses computed ${gap} spacing for responsive item dimensions`, () => {
      const ancestor = document.createElement("div");
      ancestor.style.setProperty("--ngx-mat-extended-space-3", "32px");
      const element = document.createElement("div");
      element.style.columnGap = gap;
      Object.defineProperty(element, "clientWidth", { value: 420 });
      element.append(document.createElement("div"), document.createElement("div"));
      ancestor.append(element);
      document.body.append(ancestor);
      const directive = new EditEntityResponsiveGridDirective(new ElementRef(element));
      directive.grid = { columns: 2, gap: "12px", minColumnWidth: "200px" };
      try {
        directive.ngAfterViewInit();
        expect(element.style.getPropertyValue("--edit-entity-grid-effective-columns")).toBe(gap === "12px" ? "2" : "1");
      } finally { directive.ngOnDestroy(); ancestor.remove(); }
    });
  }
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
