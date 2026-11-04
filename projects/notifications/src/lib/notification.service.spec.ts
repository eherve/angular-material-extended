import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import { NgxMatNotificationService } from "./notification.service";

describe("NgxMatNotificationService", () => {
  let service: NgxMatNotificationService;
  let container: HTMLElement;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMatNotificationService);
    container = TestBed.inject(OverlayContainer).getContainerElement();
  });
  afterEach(() => service.ngOnDestroy());

  it("updates a duplicate id in place and keeps independent notifications", () => {
    service.info("first", { id: "a", duration: null });
    service.info("second", { id: "b", duration: null });
    service.success("replacement", { id: "a", duration: null });
    expect(service.notifications().map((item) => item.id)).toEqual(["b", "a"]);
    expect(service.notifications()[1].message).toBe("replacement");
    service.dismiss("a");
    expect(service.notifications().map((item) => item.id)).toEqual(["b"]);
    service.dismiss("b");
    expect(container.querySelector("ngx-mat-notifications")).toBeNull();
  });

  it("expires only after the remaining duration following hover", fakeAsync(() => {
    service.info("timed", { duration: 1000 });
    TestBed.tick();
    tick(400);
    const card = container.querySelector("article")!;
    card.dispatchEvent(new MouseEvent("mouseenter"));
    tick(2000);
    expect(service.notifications().length).toBe(1);
    card.dispatchEvent(new MouseEvent("mouseleave"));
    tick(599);
    expect(service.notifications().length).toBe(1);
    tick(1);
    expect(service.notifications().length).toBe(0);
  }));

  it("keeps running and failed tasks visible, starts completion duration on update", fakeAsync(() => {
    const ref = service.task({
      message: "upload",
      status: "queued",
      duration: 100,
    });
    tick(1000);
    ref.update({ status: "wip", progress: 0.5 });
    tick(1000);
    ref.update({ status: "error", error: "failed" });
    tick(1000);
    expect(service.notifications().length).toBe(1);
    ref.update({ status: "done", error: undefined });
    tick(100);
    expect(service.notifications().length).toBe(0);
  }));

  it("keeps a hovered running task paused after completion", fakeAsync(() => {
    const ref = service.task({
      message: "upload",
      status: "wip",
      duration: 100,
    });
    TestBed.tick();
    const card = container.querySelector("article")!;
    card.dispatchEvent(new MouseEvent("mouseenter"));
    ref.update({ status: "done" });
    tick(1000);
    expect(service.notifications().length).toBe(1);
    card.dispatchEvent(new MouseEvent("mouseleave"));
    tick(100);
    expect(service.notifications().length).toBe(0);
  }));

  it("does not generate an id already supplied by a caller", () => {
    service.info("custom", { id: "ngx-mat-notification-1", duration: null });
    const generated = service.info("generated", { duration: null });
    expect(generated.id).not.toBe("ngx-mat-notification-1");
    expect(service.notifications().length).toBe(2);
  });

  it("keeps focus and hover pause reasons independent", fakeAsync(() => {
    service.info("timed", { duration: 100 });
    TestBed.tick();
    const card = container.querySelector("article")!;
    card.dispatchEvent(new MouseEvent("mouseenter"));
    card.dispatchEvent(new FocusEvent("focusin"));
    card.dispatchEvent(new MouseEvent("mouseleave"));
    tick(1000);
    expect(service.notifications().length).toBe(1);
    card.dispatchEvent(new FocusEvent("focusout"));
    tick(100);
    expect(service.notifications().length).toBe(0);
  }));

  it("does not let a stale handle affect a replacement with the same id", () => {
    const old = service.info("old", { id: "stable", duration: null });
    old.dismiss();
    service.info("new", { id: "stable", duration: null });
    old.update({ message: "stale update" });
    old.dismiss();
    expect(service.notifications()[0].message).toBe("new");
  });

  it("keeps countdown progress aligned when another notification opens", fakeAsync(() => {
    service.info("first", { id: "first", duration: 1000 });
    tick(400);
    service.info("second", { duration: null });
    TestBed.tick();
    const indicator = container.querySelector(".countdown") as HTMLElement;
    expect(indicator.style.getPropertyValue("--remaining")).toBe("0.6");
    expect(indicator.style.animationDuration).toBe("600ms");
    tick(600);
    expect(service.notifications().length).toBe(1);
  }));

  it("clears hover state before same-tick id reuse while the overlay stays open", fakeAsync(() => {
    service.info("anchor", { id: "anchor", duration: null });
    service.info("first", { id: "a", duration: 100 });
    TestBed.tick();
    container
      .querySelector("article")!
      .dispatchEvent(new MouseEvent("mouseenter"));
    service.dismiss("a");
    service.info("reopened", { id: "a", duration: 100 });
    TestBed.tick();
    const reopened = container.querySelector("article")!;
    reopened.dispatchEvent(new MouseEvent("mouseenter"));
    tick(1000);
    expect(service.notifications().length).toBe(2);
    reopened.dispatchEvent(new MouseEvent("mouseleave"));
    tick(100);
    expect(service.notifications().map((item) => item.id)).toEqual(["anchor"]);
  }));

  it("clears every timer and its owned overlay on destruction", fakeAsync(() => {
    service.info("a", { duration: 100 });
    service.info("b", { duration: 200 });
    service.ngOnDestroy();
    expect(container.querySelector("ngx-mat-notifications")).toBeNull();
    tick(1000);
    expect(service.notifications().length).toBe(0);
  }));

  it("renders plain text by default and sanitizes opted-in HTML", () => {
    service.info("<b>literal</b>", { duration: null });
    service.info(
      '<b>bold</b><img src=x onerror="alert(1)"><script>alert(1)</script>',
      { html: true, duration: null },
    );
    TestBed.tick();
    expect(container.textContent).toContain("<b>literal</b>");
    expect(container.querySelector("b")?.textContent).toBe("bold");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")?.hasAttribute("onerror")).toBeFalse();
  });
});
