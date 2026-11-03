import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter,
  NgZone,
} from "@angular/core";
/** The sentinel exists only while more results are available in the open overlay. */
@Directive({ selector: "[editSearchPage]", standalone: true })
export class SearchPageDirective implements AfterViewInit, OnDestroy {
  @Output() editSearchPage = new EventEmitter<void>();
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private zone = inject(NgZone);
  private observer?: IntersectionObserver;
  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === "undefined") return;
    this.observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting))
        this.zone.run(() => this.editSearchPage.emit());
    });
    this.observer.observe(this.element.nativeElement);
  }
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
