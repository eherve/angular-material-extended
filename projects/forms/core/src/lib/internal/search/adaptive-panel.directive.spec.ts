import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { AdaptiveSearchPanelDirective } from "./adaptive-panel.directive";

@Component({
  imports: [
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    AdaptiveSearchPanelDirective,
  ],
  template: `
    <mat-form-field>
      <input
        matInput
        [matAutocomplete]="panel"
        editAdaptivePanel
        [editAdaptivePanelMin]="80"
      />
    </mat-form-field>
    <mat-autocomplete #panel="matAutocomplete"
      ><mat-option value="one">One</mat-option></mat-autocomplete
    >
  `,
})
class SiblingPanelHost {}

describe("Adaptive search panel initialization", () => {
  it("waits for the later sibling autocomplete content queries before subscribing", async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(SiblingPanelHost);
    expect(() => fixture.detectChanges()).not.toThrow();
    await fixture.whenStable();
    const trigger = fixture.debugElement
      .query((element) =>
        element.providerTokens.includes(MatAutocompleteTrigger),
      )
      .injector.get(MatAutocompleteTrigger);
    expect(trigger.autocomplete.options.length).toBe(1);
    trigger.openPanel();
    await fixture.whenStable();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    expect(trigger.autocomplete.panel.nativeElement.style.minHeight).toBe(
      "80px",
    );
    fixture.destroy();
  });

  for (const position of ["below", "above"] as const) {
    it(`caps the panel at the viewport edge when it opens ${position}`, async () => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });
      const fixture = TestBed.createComponent(SiblingPanelHost);
      fixture.detectChanges();
      await fixture.whenStable();

      const input = fixture.debugElement.query((element) =>
        element.providerTokens.includes(MatAutocompleteTrigger),
      );
      const trigger = input.injector.get(MatAutocompleteTrigger);
      trigger.openPanel();
      await fixture.whenStable();
      const panel: HTMLElement = trigger.autocomplete.panel.nativeElement;
      const inputTop = position === "below" ? window.innerHeight - 84 : 60;
      const panelTop = position === "below" ? window.innerHeight - 40 : -40;
      spyOn(
        input.nativeElement as HTMLElement,
        "getBoundingClientRect",
      ).and.returnValue(new DOMRect(0, inputTop, 200, 24));
      spyOn(panel, "getBoundingClientRect").and.returnValue(
        new DOMRect(0, panelTop, 200, 80),
      );

      window.dispatchEvent(new Event("resize"));
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );

      const available = "32px";
      expect(panel.style.maxHeight).toBe(available);
      expect(panel.style.minHeight).toBe(available);
      expect(panel.style.overflowY).toBe("auto");
      fixture.destroy();
    });
  }
});
