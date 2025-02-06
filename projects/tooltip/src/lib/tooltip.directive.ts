/** @format */

import {
  ApplicationRef,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { NgxMatTooltipComponent, Position } from './tooltip.component';

type TooltipType = TemplateRef<any> | string | null | undefined;

@Directive({
  selector: '[ngxMatTooltip]',
  standalone: false,
})
export class NgxMatTooltipDirective {
  @Input('ngxMatTooltip')
  set setTooltip(tooltip: TooltipType) {
    this.tooltip = tooltip;
    if (typeof tooltip === 'string') this.componentRef.instance.content = tooltip;
    else if (tooltip instanceof TemplateRef) this.componentRef.instance.templateRef = tooltip;
  }

  @Input('ngxMatTooltipDisabled')
  set setTooltipDisabled(isDisabled: any) {
    this.isDisabled = isDisabled !== false;
  }
  isDisabled: boolean = false;

  @Input('ngxMatTooltipContext')
  set setTooltipContext(context: any) {
    this.componentRef.instance.templateContext = context;
  }

  @Input('ngxMatTooltipTrigger')
  trigger: 'click' | 'hover' = 'hover';

  @Input('ngxMatTooltipOnOverflowOnly')
  set setOnOverflowOnly(onOverflowOnly: boolean | '') {
    this.onOverflowOnly = onOverflowOnly !== false;
  }
  onOverflowOnly: boolean = false;

  @Input('ngxMatTooltipPosition')
  set setPosition(position: Position) {
    this.componentRef.instance.setPosition(position);
  }

  private tooltip: TooltipType;
  private componentRef: ComponentRef<NgxMatTooltipComponent>;

  @HostListener('click')
  onClick(): void {
    if (this.isDisabled || !this.tooltip) return;
    if (this.trigger === 'click') this.componentRef.instance.toggle();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.isDisabled || !this.tooltip) return;
    if (this.trigger === 'hover') {
      const element = this.elementRef.nativeElement;
      if (!this.onOverflowOnly || element.offsetWidth < element.scrollWidth) {
        this.componentRef.instance.open();
      }
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.isDisabled || !this.tooltip) return;
    this.componentRef.instance.close();
  }

  appRef = inject(ApplicationRef);
  elementRef = inject(ElementRef);
  viewContainer = inject(ViewContainerRef);

  constructor() {
    this.componentRef = this.viewContainer.createComponent(NgxMatTooltipComponent);
    this.componentRef.instance.trigger = this.elementRef;
  }
}
