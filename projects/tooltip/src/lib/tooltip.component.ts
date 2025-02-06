/** @format */

import { animate, style, transition, trigger } from '@angular/animations';
import { ConnectedOverlayPositionChange, ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, TemplateRef } from '@angular/core';

const topPosition: ConnectedPosition = {
  originX: 'center',
  originY: 'top',
  overlayX: 'center',
  overlayY: 'bottom',
  offsetY: -10,
  offsetX: 0,
  panelClass: 'position-top',
};

const bottomPosition: ConnectedPosition = {
  originX: 'center',
  originY: 'bottom',
  overlayX: 'center',
  overlayY: 'top',
  offsetY: 10,
  offsetX: 0,
  panelClass: 'position-bottom',
};

const bottomStartPosition: ConnectedPosition = {
  originX: 'end',
  originY: 'bottom',
  overlayX: 'end',
  overlayY: 'top',
  offsetY: 10,
  offsetX: 0,
  panelClass: 'position-bottom-start',
};

const bottomEndPosition: ConnectedPosition = {
  originX: 'start',
  originY: 'bottom',
  overlayX: 'start',
  overlayY: 'top',
  offsetY: 10,
  offsetX: 0,
  panelClass: 'position-bottom-end',
};

const leftPosition: ConnectedPosition = {
  originX: 'start',
  originY: 'center',
  overlayX: 'end',
  overlayY: 'center',
  offsetY: 0,
  offsetX: -10,
  panelClass: 'position-left',
};

const rightPosition: ConnectedPosition = {
  originX: 'end',
  originY: 'center',
  overlayX: 'start',
  overlayY: 'center',
  offsetY: 0,
  offsetX: 10,
  panelClass: 'position-right',
};

export type Position = 'bottom' | 'bottom start' | 'bottom end' | 'right' | 'top' | 'left';

@Component({
  selector: 'lib-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }), // initial
        animate('0.2s', style({ opacity: 1 })), // final
      ]),
      transition(':leave', [
        style({ opacity: 1 }), // initial
        animate('0.2s', style({ opacity: 0 })), // final
      ]),
    ]),
  ],
  standalone: false,
})
export class NgxMatTooltipComponent {
  @Input() templateRef?: TemplateRef<any>;
  @Input() templateContext: any;
  @Input() content?: string;

  @Input()
  trigger?: ElementRef<any>;

  @Input()
  isOpen = false;

  positions: ConnectedPosition[] = [
    bottomPosition,
    bottomStartPosition,
    bottomEndPosition,
    rightPosition,
    topPosition,
    leftPosition,
  ];
  position?: ConnectedPosition;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  setPosition(position: Position) {
    switch (position) {
      case 'bottom':
        this.positions = [bottomPosition];
        break;
      case 'bottom start':
        this.positions = [bottomStartPosition];
        break;
      case 'bottom end':
        this.positions = [bottomEndPosition];
        break;
      case 'right':
        this.positions = [rightPosition];
        break;
      case 'top':
        this.positions = [topPosition];
        break;
      case 'left':
        this.positions = [leftPosition];
        break;
    }
  }

  toggle() {
    clearTimeout(this.openTm);
    this.openTm = null;
    clearTimeout(this.closeTm);
    this.closeTm = null;
    this.isOpen = !this.isOpen;
  }

  openTm: any;
  open(delay = 100) {
    if (this.closeTm) clearTimeout(this.closeTm), (this.closeTm = null);
    if (!this.openTm) {
      this.openTm = setTimeout(() => {
        this.openTm = null;
        this.isOpen = true;
        this.changeDetectorRef.detectChanges();
      }, delay);
    }
  }

  closeTm: any;
  close(delay = 100) {
    if (this.openTm) clearTimeout(this.openTm), (this.openTm = null);
    if (!this.closeTm)
      this.closeTm = setTimeout(() => {
        this.closeTm = null;
        this.isOpen = false;
        this.changeDetectorRef.detectChanges();
      }, delay);
  }

  onMouseEnter(): void {
    this.open();
  }

  onMouseLeave(): void {
    this.close();
  }

  positionChange($event: ConnectedOverlayPositionChange) {
    this.position = $event.connectionPair;
  }
}
