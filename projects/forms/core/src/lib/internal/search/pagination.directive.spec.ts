import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { SearchPageDirective } from "./pagination.directive";
@Component({
  imports: [SearchPageDirective],
  template: '<span (editSearchPage)="pages = pages + 1"></span>',
})
class ObserverHost {
  pages = 0;
}
describe("search pagination observer", () => {
  it("requests on intersection and disconnects when the overlay sentinel is destroyed", () => {
    const original = window.IntersectionObserver;
    let callback!: IntersectionObserverCallback;
    let disconnected = false;
    class Observer implements IntersectionObserver {
      root = null;
      rootMargin = "";
      scrollMargin = "";
      thresholds = [];
      constructor(next: IntersectionObserverCallback) {
        callback = next;
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {
        disconnected = true;
      }
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }
    window.IntersectionObserver = Observer;
    try {
      const fixture = TestBed.createComponent(ObserverHost);
      fixture.detectChanges();
      callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      expect(fixture.componentInstance.pages).toBe(0);
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      expect(fixture.componentInstance.pages).toBe(1);
      fixture.destroy();
      expect(disconnected).toBeTrue();
    } finally {
      window.IntersectionObserver = original;
    }
  });
});
