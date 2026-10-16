import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
} from "@angular/core";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { fromEvent, merge, Subscription } from "rxjs";
@Directive({ selector: "[editAdaptivePanel]", standalone: true })
export class AdaptiveSearchPanelDirective implements AfterViewInit, OnDestroy {
  private trigger = inject(MatAutocompleteTrigger);
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private subscriptions = new Subscription();
  private frame = 0;
  ngAfterViewInit(): void {
    this.subscriptions.add(
      merge(
        this.trigger.autocomplete.opened,
        this.trigger.autocomplete.options.changes,
        fromEvent(window, "resize"),
        fromEvent(window, "scroll", { capture: true }),
      ).subscribe(() => {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.resize());
      }),
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    cancelAnimationFrame(this.frame);
  }
  private resize(): void {
    if (!this.trigger.panelOpen) return;
    const panel: HTMLElement | undefined =
      this.trigger.autocomplete.panel?.nativeElement;
    if (!panel) return;
    const rect = this.element.nativeElement.getBoundingClientRect();
    const below = panel.getBoundingClientRect().top >= rect.bottom - 1;
    panel.style.maxHeight = `${Math.max(0, below ? window.innerHeight - rect.bottom - 8 : rect.top - 8)}px`;
    panel.style.overflowY = "auto";
  }
}
