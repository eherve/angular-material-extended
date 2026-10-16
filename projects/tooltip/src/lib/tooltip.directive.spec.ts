import { OverlayContainer } from "@angular/cdk/overlay";
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from "@angular/core/testing";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { Position } from "./tooltip.component";
import { NgxMatTooltipModule } from "./tooltip.module";

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (show) {
      <button
        [ngxMatTooltip]="content"
        [ngxMatTooltipContext]="context"
        [ngxMatTooltipDisabled]="disabled"
        [ngxMatTooltipTrigger]="trigger"
        [ngxMatTooltipPosition]="position"
        [ngxMatTooltipOnOverflowOnly]="overflow"
        aria-describedby="existing-description"
      >
        Trigger
      </button>
    }
    <ng-template #details let-name="name"
      ><strong>{{ name }}</strong></ng-template
    >
    <ng-template #oversized>
      <div style="width: 2000px; height: 1200px">Oversized template</div>
    </ng-template>
    <p id="existing-description">Existing description</p>
    <button class="outside">Outside</button>
  `,
})
class TooltipHost {
  content: string | TemplateRef<unknown> | null = "Initial content";
  context = { name: "Alice" };
  disabled: boolean | string = false;
  trigger: "hover" | "click" = "hover";
  position: Position = "bottom";
  overflow = false;
  show = true;
  @ViewChild("details", { static: true }) details!: TemplateRef<unknown>;
  @ViewChild("oversized", { static: true }) oversized!: TemplateRef<unknown>;
}

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  template:
    '<button ngxMatTooltip="Immediate" ngxMatTooltipOpenDelay="0">Trigger</button>',
})
class ImmediateTooltipHost {}

describe("NgxMatTooltipDirective integration", () => {
  let fixture: ComponentFixture<TooltipHost>;
  let host: TooltipHost;
  let button: HTMLButtonElement;
  let container: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TooltipHost, ImmediateTooltipHost],
      imports: [NgxMatTooltipModule],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(TooltipHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector("button");
    container = TestBed.inject(OverlayContainer).getContainerElement();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  function tooltip(): HTMLElement | null {
    return container.querySelector(".ngx-mat-tooltip");
  }

  function send(type: string, target: HTMLElement = button): void {
    target.dispatchEvent(new Event(type, { bubbles: true }));
    fixture.detectChanges();
  }

  function open(): void {
    send("mouseenter");
    tick(100);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  it("opens only after the hover delay and closes after leaving", fakeAsync(() => {
    send("mouseenter");
    tick(99);
    fixture.detectChanges();
    expect(tooltip()).toBeNull();
    tick(1);
    fixture.detectChanges();
    expect(tooltip()?.textContent).toContain("Initial content");
    send("mouseleave");
    tick(100);
    fixture.detectChanges();
    tick();
    expect(tooltip()).toBeNull();
  }));

  it("opens and closes on click after the initial render", fakeAsync(() => {
    host.trigger = "click";
    fixture.detectChanges();
    send("click");
    expect(tooltip()?.textContent).toContain("Initial content");
    send("click");
    tick();
    expect(tooltip()).toBeNull();
  }));

  it("updates text while open", fakeAsync(() => {
    open();
    host.content = "Updated content";
    fixture.detectChanges();
    expect(tooltip()?.textContent).toContain("Updated content");
    expect(tooltip()?.textContent).not.toContain("Initial content");
  }));

  it("updates template context while open", fakeAsync(() => {
    host.content = host.details;
    fixture.detectChanges();
    open();
    expect(tooltip()?.textContent).toContain("Alice");
    host.context = { name: "Bob" };
    fixture.detectChanges();
    expect(tooltip()?.textContent).toContain("Bob");
    expect(tooltip()?.textContent).not.toContain("Alice");
  }));

  it("replaces text with a template without retaining text", fakeAsync(() => {
    open();
    host.content = host.details;
    fixture.detectChanges();
    expect(tooltip()?.querySelector("strong")?.textContent).toBe("Alice");
    expect(tooltip()?.textContent).not.toContain("Initial content");
  }));

  it("replaces a template with text without retaining the template", fakeAsync(() => {
    host.content = host.details;
    fixture.detectChanges();
    open();
    host.content = "Replacement";
    fixture.detectChanges();
    expect(tooltip()?.textContent).toContain("Replacement");
    expect(tooltip()?.querySelector("strong")).toBeNull();
  }));

  for (const content of [null, ""]) {
    it(`closes when content becomes ${JSON.stringify(content)}`, fakeAsync(() => {
      open();
      host.content = content;
      fixture.detectChanges();
      tick();
      expect(tooltip()).toBeNull();
    }));
  }

  it("closes immediately when disabled", fakeAsync(() => {
    open();
    host.disabled = true;
    fixture.detectChanges();
    tick();
    expect(tooltip()).toBeNull();
  }));

  it("cancels a pending opening when disabled", fakeAsync(() => {
    send("mouseenter");
    host.disabled = true;
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
    expect(tooltip()).toBeNull();
  }));

  it("cancels a pending opening when content is cleared", fakeAsync(() => {
    send("mouseenter");
    host.content = null;
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
    expect(tooltip()).toBeNull();
  }));

  it("does not open disabled or empty tooltips", fakeAsync(() => {
    host.disabled = true;
    fixture.detectChanges();
    open();
    expect(tooltip()).toBeNull();
    host.disabled = false;
    host.content = null;
    fixture.detectChanges();
    open();
    expect(tooltip()).toBeNull();
  }));

  it("limits overflow-only tooltips to truncated triggers", fakeAsync(() => {
    host.overflow = true;
    Object.defineProperties(button, {
      offsetWidth: { value: 100, configurable: true },
      scrollWidth: { value: 100, configurable: true },
    });
    fixture.detectChanges();
    open();
    expect(tooltip()).toBeNull();
    Object.defineProperty(button, "scrollWidth", { value: 150 });
    open();
    expect(tooltip()?.textContent).toContain("Initial content");
  }));

  it("keeps the tooltip open when moving from the trigger onto its content", fakeAsync(() => {
    open();
    send("mouseleave");
    send("mouseenter", tooltip()!);
    tick(100);
    fixture.detectChanges();
    expect(tooltip()?.textContent).toContain("Initial content");
    send("mouseleave", tooltip()!);
    tick(100);
    fixture.detectChanges();
    tick();
    expect(tooltip()).toBeNull();
  }));

  it("opens on keyboard focus and preserves existing accessible descriptions", fakeAsync(() => {
    send("focusin");
    tick(100);
    fixture.detectChanges();
    const panel = tooltip();
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("role")).toBe("tooltip");
    expect(panel?.id).toBeTruthy();
    expect(button.getAttribute("aria-describedby")?.split(" ")).toContain(
      "existing-description",
    );
    expect(button.getAttribute("aria-describedby")?.split(" ")).toContain(
      panel?.id ?? "missing-tooltip",
    );
    button.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    fixture.detectChanges();
    tick();
    expect(tooltip()).toBeNull();
    expect(button.getAttribute("aria-describedby")).toBe(
      "existing-description",
    );
  }));

  it("closes after keyboard focus leaves the trigger", fakeAsync(() => {
    send("focusin");
    tick(100);
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();
    send("focusout");
    tick(100);
    fixture.detectChanges();
    tick();
    expect(tooltip()).toBeNull();
  }));

  it("supports tap activation for hover tooltips on touch devices", fakeAsync(() => {
    button.dispatchEvent(
      new PointerEvent("pointerup", { pointerType: "touch", bubbles: true }),
    );
    fixture.detectChanges();
    expect(tooltip()?.textContent).toContain("Initial content");
    button.dispatchEvent(
      new PointerEvent("pointerup", { pointerType: "touch", bubbles: true }),
    );
    fixture.detectChanges();
    tick();
    expect(tooltip()).toBeNull();
  }));

  it("sanitizes HTML strings while retaining safe markup", fakeAsync(() => {
    spyOn(console, "warn");
    host.content = '<strong onclick="alert(1)">Safe</strong>';
    fixture.detectChanges();
    open();
    expect(tooltip()?.querySelector("strong")?.textContent).toBe("Safe");
    expect(
      tooltip()?.querySelector("strong")?.hasAttribute("onclick"),
    ).toBeFalse();
  }));

  it("removes the overlay and cancels timers when its trigger is destroyed", fakeAsync(() => {
    open();
    send("mouseleave");
    host.show = false;
    fixture.detectChanges();
    tick(200);
    expect(tooltip()).toBeNull();
    expect(button.getAttribute("aria-describedby")).toBe(
      "existing-description",
    );
  }));

  it("does not create an overlay after a pending trigger is destroyed", fakeAsync(() => {
    send("mouseenter");
    host.show = false;
    fixture.detectChanges();
    tick(200);
    expect(tooltip()).toBeNull();
  }));

  it("accepts a zero opening delay as used by the product operation graph", fakeAsync(() => {
    const immediate = TestBed.createComponent(ImmediateTooltipHost);
    immediate.detectChanges();
    const trigger: HTMLButtonElement =
      immediate.nativeElement.querySelector("button");
    trigger.dispatchEvent(new Event("mouseenter"));
    immediate.detectChanges();
    expect(tooltip()?.textContent).toContain("Immediate");
    immediate.destroy();
    tick();
  }));

  it("treats the string false as a false boolean input", fakeAsync(() => {
    host.disabled = "false";
    fixture.detectChanges();
    open();
    expect(tooltip()?.textContent).toContain("Initial content");
  }));

  it("closes when clicking outside without consuming the click", fakeAsync(() => {
    open();
    const outside: HTMLButtonElement =
      fixture.nativeElement.querySelector(".outside");
    const clicked = jasmine.createSpy("outside click");
    outside.addEventListener("click", clicked);
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    fixture.detectChanges();
    tick();
    expect(tooltip()).toBeNull();
    expect(clicked).toHaveBeenCalledTimes(1);
  }));

  const positions: {
    position: Position;
    className: string;
    direction: "top" | "bottom" | "left" | "right";
  }[] = [
    { position: "top", className: "position-top", direction: "top" },
    { position: "bottom", className: "position-bottom", direction: "bottom" },
    {
      position: "bottom start",
      className: "position-bottom-start",
      direction: "bottom",
    },
    {
      position: "bottom end",
      className: "position-bottom-end",
      direction: "bottom",
    },
    { position: "left", className: "position-left", direction: "left" },
    { position: "right", className: "position-right", direction: "right" },
  ];

  for (const { position, className, direction } of positions) {
    it(`positions rich content at ${position}`, fakeAsync(() => {
      Object.assign(button.style, {
        position: "fixed",
        left: "350px",
        top: "250px",
      });
      host.position = position;
      host.content = host.details;
      fixture.detectChanges();
      open();
      expect(tooltip()?.classList.contains(className)).toBeTrue();
      const origin = button.getBoundingClientRect();
      const panel = tooltip()!.getBoundingClientRect();
      if (direction === "top")
        expect(panel.bottom).toBeLessThanOrEqual(origin.top);
      if (direction === "bottom")
        expect(panel.top).toBeGreaterThanOrEqual(origin.bottom);
      if (direction === "left")
        expect(panel.right).toBeLessThanOrEqual(origin.left);
      if (direction === "right")
        expect(panel.left).toBeGreaterThanOrEqual(origin.right);
    }));
  }

  it("repositions an open tooltip when its preferred position changes", fakeAsync(() => {
    Object.assign(button.style, {
      position: "fixed",
      left: "350px",
      top: "250px",
    });
    open();
    host.position = "top";
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(tooltip()?.classList.contains("position-top")).toBeTrue();
    expect(tooltip()!.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      button.getBoundingClientRect().top,
    );
  }));

  it("keeps rich content wider than its small trigger within the viewport", fakeAsync(() => {
    Object.assign(button.style, {
      position: "fixed",
      right: "0",
      top: "50px",
      width: "16px",
    });
    host.content = "Rich content wider than a graph node";
    fixture.detectChanges();
    open();
    const rect = tooltip()!.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(100);
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
  }));

  it("contains oversized templates in a scrollable region within the viewport", fakeAsync(() => {
    host.content = host.oversized;
    fixture.detectChanges();
    open();
    const panel = tooltip()!;
    const rect = panel.getBoundingClientRect();
    expect(rect.height).toBeLessThanOrEqual(window.innerHeight - 16);
    expect(rect.width).toBeLessThanOrEqual(window.innerWidth - 16);
    expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
    expect(panel.scrollHeight).toBeLessThanOrEqual(panel.clientHeight);
    const scrollRegion = panel.querySelector<HTMLElement>(
      ".ngx-mat-tooltip-content",
    );
    expect(scrollRegion).not.toBeNull();
    expect(scrollRegion?.scrollWidth).toBeGreaterThan(
      scrollRegion?.clientWidth ?? 0,
    );
    expect(scrollRegion?.scrollHeight).toBeGreaterThan(
      scrollRegion?.clientHeight ?? 0,
    );
  }));
});
