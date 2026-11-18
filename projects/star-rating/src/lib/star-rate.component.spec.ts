import { TestBed } from "@angular/core/testing";
import { StarRateComponent } from "./star-rate.component";

describe("StarRateComponent", () => {
  it("updates full and compact ratings when value, max or step changes", () => {
    const fixture = TestBed.createComponent(StarRateComponent);
    const host: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput("value", 2.3);
    fixture.detectChanges();
    expect(host.querySelectorAll("path.value").length).toBe(5);
    expect(host.getAttribute("role")).toBe("img");
    expect(host.getAttribute("aria-label")).toBe("2.3 / 5");
    fixture.componentRef.setInput("shrink", true);
    fixture.componentRef.setInput("step", 0.5);
    fixture.componentRef.setInput("max", 10);
    fixture.detectChanges();
    expect(host.querySelector("path.value")?.getAttribute("style")).toContain(
      "12.5%",
    );
    expect(host.querySelector("text")?.textContent?.trim()).toBe("2.3");
  });
  it("bounds invalid and out-of-range ratings without throwing", () => {
    const fixture = TestBed.createComponent(StarRateComponent);
    const host: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput("shrink", true);
    for (const [value, expected] of [
      [-2, "0"],
      [30, "5"],
      [NaN, "0"],
      [Infinity, "0"],
    ] as const) {
      fixture.componentRef.setInput("value", value);
      fixture.detectChanges();
      expect(host.querySelector("text")?.textContent?.trim()).toBe(expected);
      expect(host.innerHTML).not.toContain("NaN");
    }
    fixture.componentRef.setInput("max", -1);
    fixture.componentRef.setInput("shrink", false);
    fixture.detectChanges();
    expect(host.querySelectorAll("path").length).toBe(0);
  });
});
