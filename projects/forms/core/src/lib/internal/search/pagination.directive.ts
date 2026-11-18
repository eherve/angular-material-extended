import {
  afterRenderEffect,
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  input,
  NgZone,
  Output,
} from "@angular/core";

/** The sentinel exists only while more results are available in the open overlay. */
@Directive({ selector: "[editSearchPage]", standalone: true })
export class SearchPageDirective {
  readonly pageResults = input<readonly unknown[]>([], {
    alias: "editSearchPageResults",
  });
  @Output() editSearchPage = new EventEmitter<void>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  constructor() {
    afterRenderEffect({
      read: (onCleanup) => {
        // Fast searches can append results without removing the visible sentinel.
        this.pageResults();
        if (typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting))
            this.zone.run(() => this.editSearchPage.emit());
        });
        observer.observe(this.element.nativeElement);
        onCleanup(() => observer.disconnect());
      },
    });
  }
}
