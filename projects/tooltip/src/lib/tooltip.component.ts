/** @format */

import { DOCUMENT } from "@angular/common";
import { animate, style, transition, trigger } from "@angular/animations";
import {
  CdkConnectedOverlay,
  ConnectedOverlayPositionChange,
  ConnectedPosition,
} from "@angular/cdk/overlay";
import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  TemplateRef,
  ChangeDetectionStrategy,
  EventEmitter,
  inject,
  Injector,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";

const topPosition: ConnectedPosition = {
  originX: "center",
  originY: "top",
  overlayX: "center",
  overlayY: "bottom",
  offsetY: -10,
  offsetX: 0,
  panelClass: "position-top",
};

const bottomPosition: ConnectedPosition = {
  originX: "center",
  originY: "bottom",
  overlayX: "center",
  overlayY: "top",
  offsetY: 10,
  offsetX: 0,
  panelClass: "position-bottom",
};

const bottomStartPosition: ConnectedPosition = {
  originX: "end",
  originY: "bottom",
  overlayX: "end",
  overlayY: "top",
  offsetY: 10,
  offsetX: 0,
  panelClass: "position-bottom-start",
};

const bottomEndPosition: ConnectedPosition = {
  originX: "start",
  originY: "bottom",
  overlayX: "start",
  overlayY: "top",
  offsetY: 10,
  offsetX: 0,
  panelClass: "position-bottom-end",
};

const leftPosition: ConnectedPosition = {
  originX: "start",
  originY: "center",
  overlayX: "end",
  overlayY: "center",
  offsetY: 0,
  offsetX: -10,
  panelClass: "position-left",
};

const rightPosition: ConnectedPosition = {
  originX: "end",
  originY: "center",
  overlayX: "start",
  overlayY: "center",
  offsetY: 0,
  offsetX: 10,
  panelClass: "position-right",
};

export type Position =
  | "bottom"
  | "bottom start"
  | "bottom end"
  | "right"
  | "top"
  | "left";

let nextTooltipId = 0;

@Component({
  selector: "lib-tooltip",
  templateUrl: "./tooltip.component.html",
  styleUrl: "./tooltip.component.scss",
  animations: [
    trigger("fade", [
      transition(":enter", [
        style({ opacity: 0 }), // initial
        animate("0.2s", style({ opacity: 1 })), // final
      ]),
      transition(":leave", [
        style({ opacity: 1 }), // initial
        animate("0.2s", style({ opacity: 0 })), // final
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class NgxMatTooltipComponent implements OnChanges, OnDestroy {
  @Input() templateRef?: TemplateRef<unknown>;
  @Input() templateContext: unknown;
  @Input() content?: string;

  @Input()
  trigger?: ElementRef<HTMLElement>;

  @Input()
  isOpen = false;

  readonly id = `ngx-mat-tooltip-${nextTooltipId++}`;
  @Output() readonly openChange = new EventEmitter<boolean>();
  @ViewChild("tooltipContent") private tooltipContent?: ElementRef<HTMLElement>;
  @ViewChild(CdkConnectedOverlay) private overlay?: CdkConnectedOverlay;
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private openTm?: ReturnType<typeof setTimeout>;
  private closeTm?: ReturnType<typeof setTimeout>;

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

  setPosition(position: Position): void {
    switch (position) {
      case "bottom":
        this.positions = [bottomPosition];
        break;
      case "bottom start":
        this.positions = [bottomStartPosition];
        break;
      case "bottom end":
        this.positions = [bottomEndPosition];
        break;
      case "right":
        this.positions = [rightPosition];
        break;
      case "top":
        this.positions = [topPosition];
        break;
      case "left":
        this.positions = [leftPosition];
        break;
    }
    this.changeDetectorRef.markForCheck();
    this.updatePositionAfterRender();
  }

  ngOnChanges(): void {
    this.updatePositionAfterRender();
  }

  toggle(): void {
    this.cancelTimers();
    this.setOpen(!this.isOpen);
  }

  // Delays allow the pointer/focus to cross the gap between trigger and overlay.
  open(delay = 100): void {
    clearTimeout(this.closeTm);
    this.closeTm = undefined;
    if (this.isOpen || this.openTm !== undefined) return;
    if (delay <= 0) this.setOpen(true);
    else
      this.openTm = setTimeout(() => {
        this.openTm = undefined;
        this.setOpen(true);
      }, delay);
  }

  close(delay = 100): void {
    clearTimeout(this.openTm);
    this.openTm = undefined;
    if (delay <= 0) {
      clearTimeout(this.closeTm);
      this.closeTm = undefined;
      this.setOpen(false);
    } else if (this.isOpen && this.closeTm === undefined) {
      this.closeTm = setTimeout(() => {
        this.closeTm = undefined;
        this.setOpen(false);
      }, delay);
    }
  }

  onMouseEnter(): void {
    this.open(0);
  }

  onMouseLeave(): void {
    if (!this.hasFocus()) this.close();
  }

  onFocusOut(event: FocusEvent): void {
    if (
      !this.tooltipContent?.nativeElement.contains(
        event.relatedTarget as Node | null,
      ) &&
      !this.trigger?.nativeElement.contains(event.relatedTarget as Node | null)
    )
      this.close();
  }

  hasFocus(): boolean {
    const active = this.document.activeElement;
    return (
      !!active &&
      (!!this.trigger?.nativeElement.contains(active) ||
        !!this.tooltipContent?.nativeElement.contains(active))
    );
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") this.close(0);
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.trigger?.nativeElement.contains(event.target as Node | null))
      this.close(0);
  }

  positionChange(event: ConnectedOverlayPositionChange): void {
    this.position = event.connectionPair;
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.cancelTimers();
  }

  private cancelTimers(): void {
    clearTimeout(this.openTm);
    clearTimeout(this.closeTm);
    this.openTm = undefined;
    this.closeTm = undefined;
  }

  private setOpen(open: boolean): void {
    if (this.isOpen === open) return;
    this.isOpen = open;
    this.openChange.emit(open);
    this.changeDetectorRef.markForCheck();
  }

  private updatePositionAfterRender(): void {
    afterNextRender(
      () => {
        if (this.isOpen) this.overlay?.overlayRef.updatePosition();
      },
      { injector: this.injector },
    );
  }
}
