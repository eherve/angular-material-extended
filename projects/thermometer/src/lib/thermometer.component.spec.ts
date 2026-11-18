import { TestBed } from "@angular/core/testing";
import { ThermometerComponent } from "./thermometer.component";

describe("ThermometerComponent", () => {
  it("renders 21 graduations and recomputes value, thresholds and setpoint for changed bounds", () => {
    const fixture = TestBed.createComponent(ThermometerComponent);
    const host: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput("value", 50);
    fixture.componentRef.setInput("setpoint", 50);
    fixture.componentRef.setInput("colors", [[60, "red"], ["blue"]]);
    fixture.detectChanges();
    expect(host.querySelectorAll(".graduations line").length).toBe(21);
    expect(host.getAttribute("role")).toBe("img");
    expect(host.getAttribute("aria-label")).toBe("50 °C");
    expect(host.querySelector("#value")?.getAttribute("fill")).toBe("red");
    expect(host.querySelector("#value")?.getAttribute("style")).toContain(
      "50%",
    );
    fixture.componentRef.setInput("min", 50);
    fixture.componentRef.setInput("max", 150);
    fixture.componentRef.setInput("value", 100);
    fixture.detectChanges();
    expect(host.querySelector("#value")?.getAttribute("fill")).toBe("blue");
    expect(host.querySelector("#value")?.getAttribute("style")).toContain(
      "50%",
    );
    expect(host.querySelector("#csg-value")?.getAttribute("transform")).toBe(
      "translate(700, 472)",
    );
  });
  it("omits invalid ranges and missing/non-finite values safely", () => {
    const fixture = TestBed.createComponent(ThermometerComponent);
    const host: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput("value", NaN);
    fixture.detectChanges();
    expect(host.querySelector("#value")).toBeNull();
    for (const [min, max] of [
      [20, 20],
      [30, 10],
      [0, Infinity],
      [NaN, 100],
    ]) {
      fixture.componentRef.setInput("min", min);
      fixture.componentRef.setInput("max", max);
      fixture.componentRef.setInput("value", 25);
      fixture.detectChanges();
      expect(host.querySelectorAll(".graduations line").length).toBe(0);
      expect(host.querySelector("#value")).toBeNull();
      expect(host.innerHTML).not.toContain("NaN");
    }
  });
  it("clamps fill and setpoint geometry to the range and accepts a localized label", () => {
    const fixture = TestBed.createComponent(ThermometerComponent);
    const host: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput("value", 200);
    fixture.componentRef.setInput("setpoint", -20);
    fixture.componentRef.setInput("setpointLabel", "Target");
    fixture.detectChanges();
    expect(host.querySelector("#value")?.getAttribute("style")).toContain("0%");
    expect(host.querySelector("#csg-value")?.getAttribute("transform")).toBe(
      "translate(700, 472)",
    );
    expect(host.querySelector("#csg-text")?.textContent?.trim()).toBe("Target");
  });
  it("keeps finite extreme range graduations finite", () => {
    const fixture = TestBed.createComponent(ThermometerComponent);
    const host: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput("max", 1e308);
    fixture.componentRef.setInput("value", 5e307);
    fixture.detectChanges();
    expect(host.querySelectorAll(".graduations line").length).toBe(21);
    expect(host.querySelector(".graduations")?.textContent).not.toContain("∞");
    expect(host.querySelector(".graduations")?.textContent).not.toContain(
      "Infinity",
    );
    expect(host.querySelector("#value")?.getAttribute("style")).toContain(
      "50%",
    );
  });
});
