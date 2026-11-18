import { TestBed } from "@angular/core/testing";
import { AvatarComponent } from "./avatar.component";

describe("AvatarComponent", () => {
  it("normalizes Gravatar email, falls back to initials and retries changed images", () => {
    const fixture = TestBed.createComponent(AvatarComponent);
    const host: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput("email", " Test@example.com ");
    fixture.componentRef.setInput("name", " Alice Martin ");
    fixture.detectChanges();
    expect(host.querySelector("img")?.src).toContain(
      "55502f40dc8b7c769880b10874abc9d0",
    );
    host.querySelector("img")!.dispatchEvent(new Event("error"));
    fixture.detectChanges();
    expect(host.querySelector(".avatar-text")?.textContent?.trim()).toBe("AM");
    fixture.componentRef.setInput("email", "other@example.com");
    fixture.detectChanges();
    expect(host.querySelector("img")).not.toBeNull();
    host.querySelector("img")!.dispatchEvent(new Event("error"));
    fixture.detectChanges();
    fixture.componentRef.setInput("size", 24);
    fixture.detectChanges();
    expect(host.querySelector("img")?.width).toBe(24);
  });
  it("renders text without an image request and keeps invalid dimensions finite", () => {
    const fixture = TestBed.createComponent(AvatarComponent);
    const host: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput("value", "+ 3");
    fixture.componentRef.setInput("size", 24);
    fixture.componentRef.setInput("textSizeRatio", 2);
    fixture.detectChanges();
    expect(host.querySelector("img")).toBeNull();
    expect(host.querySelector(".avatar-text")?.textContent?.trim()).toBe("+ 3");
    expect(
      (host.querySelector(".avatar-text") as HTMLElement).style.fontSize,
    ).toBe("12px");
    fixture.componentRef.setInput("textSizeRatio", 0);
    fixture.detectChanges();
    expect(host.innerHTML).not.toContain("Infinity");
  });
  it("gives explicit colors priority over host theme defaults", () => {
    const fixture = TestBed.createComponent(AvatarComponent);
    const host: HTMLElement = fixture.nativeElement;
    host.style.setProperty("--ngx-mat-avatar-color", "rgb(1, 2, 3)");
    host.style.setProperty("--ngx-mat-avatar-background", "rgb(4, 5, 6)");
    fixture.componentRef.setInput("name", "Alice Martin");
    fixture.componentRef.setInput("fgColor", "rgb(10, 11, 12)");
    fixture.componentRef.setInput("bgColor", "rgb(13, 14, 15)");
    fixture.detectChanges();
    const text = host.querySelector(".avatar-text")!;
    expect(getComputedStyle(text).color).toBe("rgb(10, 11, 12)");
    expect(getComputedStyle(text).backgroundColor).toBe("rgb(13, 14, 15)");
  });
  it("uses host foreground and deterministic palette tokens when colors are omitted", () => {
    const fixture = TestBed.createComponent(AvatarComponent);
    const host: HTMLElement = fixture.nativeElement;
    host.style.setProperty("--ngx-mat-avatar-color", "rgb(1, 2, 3)");
    host.style.setProperty("--ngx-mat-avatar-palette-2", "rgb(4, 5, 6)");
    fixture.componentRef.setInput("name", "A");
    fixture.detectChanges();
    const text = host.querySelector(".avatar-text")!;
    expect(getComputedStyle(text).color).toBe("rgb(1, 2, 3)");
    expect(getComputedStyle(text).backgroundColor).toBe("rgb(4, 5, 6)");
  });
});
