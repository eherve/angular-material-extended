/** @format */

import {
  booleanAttribute,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  numberAttribute,
  OnDestroy,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  inject,
} from "@angular/core";
import { NgxMatTooltipComponent, Position } from "./tooltip.component";

type TooltipType = TemplateRef<unknown> | string | null | undefined;

@Directive({
  selector: "[ngxMatTooltip]",
  standalone: false,
})
export class NgxMatTooltipDirective implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly componentRef: ComponentRef<NgxMatTooltipComponent>;
  private tooltip: TooltipType;
  private readonly openSubscription;
  isDisabled = false;
  onOverflowOnly = false;

  @Input("ngxMatTooltip")
  set setTooltip(tooltip: TooltipType) {
    this.tooltip = tooltip;
    this.componentRef.setInput(
      "content",
      typeof tooltip === "string" ? tooltip : undefined,
    );
    this.componentRef.setInput(
      "templateRef",
      tooltip instanceof TemplateRef ? tooltip : undefined,
    );
    if (!tooltip) this.componentRef.instance.close(0);
  }

  @Input("ngxMatTooltipDisabled")
  set setTooltipDisabled(value: unknown) {
    this.isDisabled = booleanAttribute(value);
    if (this.isDisabled) this.componentRef.instance.close(0);
  }

  @Input("ngxMatTooltipContext")
  set setTooltipContext(context: unknown) {
    this.componentRef.setInput("templateContext", context);
  }

  @Input("ngxMatTooltipTrigger") trigger: "click" | "hover" = "hover";

  @Input("ngxMatTooltipOnOverflowOnly")
  set setOnOverflowOnly(value: unknown) {
    this.onOverflowOnly = booleanAttribute(value);
  }

  @Input("ngxMatTooltipPosition")
  set setPosition(position: Position) {
    this.componentRef.instance.setPosition(position);
  }

  @Input({ alias: "ngxMatTooltipOpenDelay", transform: numberAttribute })
  openDelay = 100;

  constructor() {
    this.componentRef = this.viewContainer.createComponent(
      NgxMatTooltipComponent,
    );
    this.componentRef.setInput("trigger", this.elementRef);
    this.openSubscription = this.componentRef.instance.openChange.subscribe(
      (open) => this.updateDescription(open),
    );
  }

  @HostListener("click")
  onClick(): void {
    if (this.trigger === "click" && this.canOpen())
      this.componentRef.instance.toggle();
  }

  @HostListener("pointerup", ["$event"])
  onPointerUp(event: PointerEvent): void {
    if (
      event.pointerType === "touch" &&
      this.trigger === "hover" &&
      this.canOpen()
    ) {
      this.componentRef.instance.toggle();
    }
  }

  @HostListener("mouseenter")
  @HostListener("focusin")
  onMouseEnter(): void {
    if (this.trigger === "hover" && this.canOpen())
      this.componentRef.instance.open(this.openDelay);
  }

  @HostListener("mouseleave")
  onMouseLeave(): void {
    if (!this.componentRef.instance.hasFocus())
      this.componentRef.instance.close();
  }

  @HostListener("focusout", ["$event"])
  onFocusOut(event: FocusEvent): void {
    if (
      !this.elementRef.nativeElement.contains(
        event.relatedTarget as Node | null,
      )
    ) {
      this.componentRef.instance.close();
    }
  }

  @HostListener("keydown.escape")
  onEscape(): void {
    this.componentRef.instance.close(0);
  }

  ngOnDestroy(): void {
    this.openSubscription.unsubscribe();
    this.updateDescription(false);
    this.componentRef.destroy();
  }

  private canOpen(): boolean {
    const element = this.elementRef.nativeElement;
    return (
      !this.isDisabled &&
      !!this.tooltip &&
      (!this.onOverflowOnly || element.offsetWidth < element.scrollWidth)
    );
  }

  private updateDescription(open: boolean): void {
    const element = this.elementRef.nativeElement;
    const id = this.componentRef.instance.id;
    const ids = (element.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((value) => value && value !== id);
    if (open) ids.push(id);
    if (ids.length)
      this.renderer.setAttribute(element, "aria-describedby", ids.join(" "));
    else this.renderer.removeAttribute(element, "aria-describedby");
  }
}
