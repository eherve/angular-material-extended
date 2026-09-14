import {
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  Injectable,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from '@angular/core';

@Injectable()
export class DatatableRowViewportObserverService implements OnDestroy {
  private observer?: IntersectionObserver;
  private callbacks = new Map<Element, () => void>();

  observe(element: Element, callback: () => void): void {
    this.callbacks.set(element, callback);
    if (typeof IntersectionObserver === 'undefined') {
      callback();
      this.callbacks.delete(element);
      return;
    }
    this.getObserver(element).observe(element);
  }

  unobserve(element: Element): void {
    this.observer?.unobserve(element);
    this.callbacks.delete(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.callbacks.clear();
  }

  private getObserver(element: Element): IntersectionObserver {
    if (this.observer) return this.observer;
    const root = element.closest('#table-container');
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const callback = this.callbacks.get(entry.target);
          if (!callback) return;
          callback();
          this.unobserve(entry.target);
        });
      },
      { root, rootMargin: '100px 0px', threshold: 0 },
    );
    return this.observer;
  }
}

@Directive({
  selector: '[datatableRowViewport]',
  standalone: true,
})
export class DatatableRowViewportDirective<Record = any> implements OnChanges, OnDestroy {
  @Input({ required: true }) datatableRowViewport!: Record;
  @Output() datatableRowVisible = new EventEmitter<Record>();

  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private observerService = inject(DatatableRowViewportObserverService);

  ngOnChanges(): void {
    const element = this.elementRef.nativeElement;
    this.observerService.unobserve(element);
    this.observerService.observe(element, () => this.datatableRowVisible.emit(this.datatableRowViewport));
  }

  ngOnDestroy(): void {
    this.observerService.unobserve(this.elementRef.nativeElement);
  }
}
