import {
  ChangeDetectionStrategy,
  Component,
  ErrorHandler,
  ViewChild,
  provideZonelessChangeDetection,
} from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flushMicrotasks,
} from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { BehaviorSubject, Observable, finalize } from "rxjs";
import { SectionTabsIntl } from "./section-tabs-intl";
import { SectionTabsModule } from "./section-tabs.module";
import { SectionTabsComponent } from "./section-tabs.component";
import {
  SECTION_SELECTION_HANDLER,
  SectionSelectionHandler,
} from "./section-selection-handler";

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <app-section-tabs
    [queryParamKey]="key"
    [selectedIndex]="initialIndex"
    (selectedIndexChange)="events.push($event)"
  >
    <ng-template appSectionTabsMenuHeader>Menu</ng-template>
    <ng-template appSectionTabsFooter>Footer</ng-template>
    <app-section-tab type="separator"
      ><ng-template appSectionTabLabel>Group</ng-template></app-section-tab
    >
    <app-section-tab queryParamValue="details" [disabled]="disableAll">
      <ng-template appSectionTabLabel>Details</ng-template
      ><ng-template appSectionTabContent>Details panel</ng-template>
    </app-section-tab>
    <app-section-tab
      queryParamValue="history"
      [disabled]="disabled || disableAll"
      [done]="0"
      [total]="10"
    >
      <ng-template appSectionTabLabel>History</ng-template
      ><ng-template appSectionTabContent>History panel</ng-template>
    </app-section-tab>
    @if (showLate) {
      <app-section-tab queryParamValue="late"
        ><ng-template appSectionTabLabel>Late</ng-template
        ><ng-template appSectionTabContent
          >Late panel</ng-template
        ></app-section-tab
      >
    }
  </app-section-tabs>`,
})
class Host {
  key: string | undefined = "groupA";
  initialIndex = 0;
  disabled = false;
  disableAll = false;
  showLate = false;
  events: number[] = [];
  @ViewChild(SectionTabsComponent) tabs!: SectionTabsComponent;
}
class Handler implements SectionSelectionHandler {
  streams = new Map<string, BehaviorSubject<string | null>>();
  releases: string[] = [];
  select = jasmine.createSpy("select");
  stream(key: string): BehaviorSubject<string | null> {
    if (!this.streams.has(key))
      this.streams.set(key, new BehaviorSubject<string | null>(null));
    return this.streams.get(key)!;
  }
  observe(key: string): Observable<string | null> {
    return this.stream(key).pipe(finalize(() => this.releases.push(key)));
  }
}
describe("SectionTabsComponent", () => {
  let handler: Handler;
  let errors: jasmine.Spy;
  function create(withHandler = true): ComponentFixture<Host> {
    TestBed.configureTestingModule({
      declarations: [Host],
      imports: [SectionTabsModule, NoopAnimationsModule],
      providers: [
        { provide: ErrorHandler, useValue: { handleError: errors } },
        ...(withHandler
          ? [{ provide: SECTION_SELECTION_HANDLER, useValue: handler }]
          : []),
      ],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture;
  }
  function click(f: ComponentFixture<Host>, index: number): void {
    (
      f.nativeElement.querySelectorAll("[role=tab]")[index] as HTMLButtonElement
    ).click();
    f.detectChanges();
  }
  function panel(f: ComponentFixture<Host>): string {
    flushMicrotasks();
    return (
      f.nativeElement.querySelector("[role=tabpanel]")?.textContent.trim() ?? ""
    );
  }
  beforeEach(() => {
    handler = new Handler();
    errors = jasmine.createSpy("handleError");
  });
  it("rendersWithoutRouter", fakeAsync(() => {
    const f = create(false);
    expect(panel(f)).toBe("Details panel");
    expect(f.componentInstance.tabs.selectedIndex).toBe(0);
    expect(f.nativeElement.textContent).toContain("Menu");
    expect(f.nativeElement.textContent).toContain("Footer");
    expect(f.nativeElement.querySelectorAll("[role=tab]").length).toBe(2);
    click(f, 1);
    expect(panel(f)).toBe("History panel");
    expect(f.componentInstance.events).toEqual([1]);
    click(f, 1);
    expect(f.componentInstance.events).toEqual([1]);
  }));
  it("selectsExternalValueWithoutWriting", fakeAsync(() => {
    handler.stream("groupA").next("history");
    const f = create();
    expect(panel(f)).toBe("History panel");
    expect(f.componentInstance.events).toEqual([1]);
    expect(handler.select).not.toHaveBeenCalled();
    handler.stream("groupA").next(null);
    f.detectChanges();
    expect(panel(f)).toBe("History panel");
  }));
  it("emitsOneUserSelection", fakeAsync(() => {
    const f = create();
    click(f, 1);
    expect(panel(f)).toBe("History panel");
    expect(f.componentInstance.events).toEqual([1]);
    expect(handler.select).toHaveBeenCalledOnceWith("groupA", "history");
    handler.stream("groupA").next("history");
    f.detectChanges();
    click(f, 1);
    expect(handler.select).toHaveBeenCalledTimes(1);
    expect(f.componentInstance.events).toEqual([1]);
  }));
  it("retriesUnavailableExternalSection", fakeAsync(() => {
    handler.stream("groupA").next("late");
    const f = create();
    expect(panel(f)).toBe("Details panel");
    expect(handler.select).not.toHaveBeenCalled();
    f.componentInstance.showLate = true;
    f.detectChanges();
    expect(panel(f)).toBe("Late panel");
    expect(f.componentInstance.events).toEqual([2]);
    expect(handler.select).not.toHaveBeenCalled();
  }));
  it("retriesDisabledExternalSection", fakeAsync(() => {
    const f = create();
    f.componentInstance.disabled = true;
    f.detectChanges();
    handler.stream("groupA").next("history");
    f.detectChanges();
    click(f, 1);
    expect(panel(f)).toBe("Details panel");
    expect(handler.select).not.toHaveBeenCalled();
    f.componentInstance.disabled = false;
    f.detectChanges();
    expect(panel(f)).toBe("History panel");
    expect(f.componentInstance.events).toEqual([1]);
  }));
  it("unsubscribesOnKeyChange", fakeAsync(() => {
    const f = create();
    handler.stream("groupB").next("history");
    f.componentInstance.key = "groupB";
    f.detectChanges();
    expect(handler.releases).toEqual(["groupA"]);
    expect(panel(f)).toBe("History panel");
    handler.stream("groupA").next("details");
    f.detectChanges();
    expect(panel(f)).toBe("History panel");
    f.destroy();
    expect(handler.releases).toEqual(["groupA", "groupB"]);
  }));
  it("keepsGroupsIndependent", fakeAsync(() => {
    const a = create();
    const b = TestBed.createComponent(Host);
    b.componentInstance.key = "groupB";
    b.detectChanges();
    handler.stream("groupA").next("history");
    a.detectChanges();
    b.detectChanges();
    expect(panel(a)).toBe("History panel");
    expect(panel(b)).toBe("Details panel");
    expect(a.nativeElement.querySelector("[role=tab]").id).not.toBe(
      b.nativeElement.querySelector("[role=tab]").id,
    );
    a.destroy();
    handler.stream("groupB").next("history");
    b.detectChanges();
    expect(panel(b)).toBe("History panel");
  }));
  it("reportsHandlerFailure", fakeAsync(() => {
    const f = create();
    const sync = new Error("sync");
    handler.select.and.callFake(() => {
      throw sync;
    });
    click(f, 1);
    expect(panel(f)).toBe("History panel");
    expect(errors).toHaveBeenCalledWith(sync);
    const rejection = new Error("rejection");
    handler.select.and.callFake(() => Promise.reject(rejection));
    click(f, 0);
    flushMicrotasks();
    expect(errors).toHaveBeenCalledWith(rejection);
    expect(panel(f)).toBe("Details panel");
    const stream = new Error("stream");
    handler.stream("groupA").error(stream);
    expect(errors).toHaveBeenCalledWith(stream);
    handler.select.and.returnValue(undefined);
    click(f, 1);
    expect(panel(f)).toBe("History panel");
  }));
  it("ignoresBlankKeyAndFallsBackWhenAllDisabled", fakeAsync(() => {
    const f = create();
    f.componentInstance.key = " ";
    f.componentInstance.disableAll = true;
    f.detectChanges();
    expect(panel(f)).toBe("");
    expect(f.componentInstance.events).toEqual([]);
    f.componentInstance.disableAll = false;
    f.detectChanges();
    click(f, 1);
    expect(panel(f)).toBe("History panel");
    expect(handler.select).not.toHaveBeenCalled();
    expect(handler.streams.has(" ")).toBeFalse();
  }));
  it("honorsAnInitialIndexAndPreservesCounterZero", fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Host],
      imports: [SectionTabsModule, NoopAnimationsModule],
    });
    const f = TestBed.createComponent(Host);
    f.componentInstance.initialIndex = 1;
    f.detectChanges();
    expect(panel(f)).toBe("History panel");
    expect(f.componentInstance.events).toEqual([]);
    expect(
      f.nativeElement
        .querySelector(".section-tabs__mini-chip")
        .textContent.trim(),
    ).toBe("0/10");
  }));
  it("rendersNoPanelForSeparatorsOnly", fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Host],
      imports: [SectionTabsModule, NoopAnimationsModule],
    });
    TestBed.overrideComponent(Host, {
      set: {
        template: `<app-section-tabs><app-section-tab type="separator"><ng-template appSectionTabLabel>Group</ng-template></app-section-tab></app-section-tabs>`,
      },
    });
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(panel(f)).toBe("");
    expect(f.nativeElement.querySelectorAll("[role=tab]").length).toBe(0);
    expect(f.componentInstance.tabs.activeTabItems).toEqual([]);
  }));
  it("updatesExternalSelectionInAZonelessHostWithoutAnOutputListener", async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    TestBed.overrideComponent(Host, {
      set: {
        template: `
          <app-section-tabs queryParamKey="groupA">
            <app-section-tab queryParamValue="details">
              <ng-template appSectionTabLabel>Details</ng-template>
              <ng-template appSectionTabContent>Details panel</ng-template>
            </app-section-tab>
            <app-section-tab queryParamValue="history">
              <ng-template appSectionTabLabel>History</ng-template>
              <ng-template appSectionTabContent>History panel</ng-template>
            </app-section-tab>
          </app-section-tabs>`,
      },
    });
    const f = create();
    await f.whenStable();
    handler.stream("groupA").next("history");
    await f.whenStable();
    expect(
      f.nativeElement.querySelector("[role=tabpanel]").textContent.trim(),
    ).toBe("History panel");
  });

  it("refreshesRuntimeTranslations", async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const f = create();
    await f.whenStable();
    const intl = TestBed.inject(SectionTabsIntl);
    intl.messages = { ...intl.messages, sections: "Sections translated" };
    intl.changes.next();
    await f.whenStable();
    expect(
      f.nativeElement.querySelector("aside").getAttribute("aria-label"),
    ).toBe("Sections translated");
  });
});
