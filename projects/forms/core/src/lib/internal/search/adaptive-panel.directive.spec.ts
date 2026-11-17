import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
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
      .query(By.directive(MatAutocompleteTrigger))
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
});
