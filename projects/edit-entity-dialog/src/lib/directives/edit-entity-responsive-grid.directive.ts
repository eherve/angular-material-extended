/** @format */

import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import type { EditEntityGridOptions } from "../edit-entity-dialog.types";

interface EditEntityResponsiveGridItem {
  element: HTMLElement;
  colSpan: number;
  rowSpan: number;
}

@Directive({
  selector: "[appEditEntityResponsiveGrid]",
  standalone: false,
})
export class EditEntityResponsiveGridDirective
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input("appEditEntityResponsiveGrid") grid?: EditEntityGridOptions;

  private initialized = false;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.initialized = true;
    this.refreshObservers();
    this.applyLayout();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.initialized) return;

    this.refreshObservers();
    this.applyLayout();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }

  private refreshObservers(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver((): void => this.applyLayout());
      this.resizeObserver.observe(this.elementRef.nativeElement);
    }

    if (typeof MutationObserver !== "undefined") {
      this.mutationObserver = new MutationObserver((): void =>
        this.applyLayout(),
      );
      this.observeMutations();
    }
  }

  private observeMutations(): void {
    this.mutationObserver?.observe(this.elementRef.nativeElement, {
      childList: true,
    });
  }

  private applyLayout(): void {
    const element = this.elementRef.nativeElement;
    const configuredColumns = this.normalizePositiveInteger(
      this.grid?.columns,
      1,
    );
    const availableWidth = this.getContentWidth(element);
    if (availableWidth <= 0) return;

    const gap = this.getGap(element);
    const minColumnWidth = this.measureCssLength(
      this.grid?.minColumnWidth || "0px",
      element,
    );
    const items = this.getItems(configuredColumns);
    const preserveConfiguredLayout = this.canPreserveConfiguredLayout(
      items,
      configuredColumns,
      availableWidth,
      gap,
      minColumnWidth,
    );

    if (preserveConfiguredLayout) {
      element.style.setProperty(
        "--edit-entity-grid-effective-columns",
        `${configuredColumns}`,
      );
      this.restoreConfiguredLayout(items);
      return;
    }

    const effectiveColumns = this.resolveEffectiveColumns(
      configuredColumns,
      availableWidth,
      gap,
      minColumnWidth,
    );
    element.style.setProperty(
      "--edit-entity-grid-effective-columns",
      `${effectiveColumns}`,
    );
    this.applyResponsiveLayout(items, effectiveColumns);
  }

  private getItems(columns: number): EditEntityResponsiveGridItem[] {
    const items: EditEntityResponsiveGridItem[] = [];

    for (const child of Array.from(this.elementRef.nativeElement.children)) {
      if (!(child instanceof HTMLElement) || this.isFullWidthElement(child))
        continue;

      items.push({
        element: child,
        colSpan: this.readOriginalSpan(
          child,
          "--edit-entity-item-col-span",
          columns,
        ),
        rowSpan: this.readOriginalSpan(
          child,
          "--edit-entity-item-row-span",
          Number.MAX_SAFE_INTEGER,
        ),
      });
    }

    return items;
  }

  private canPreserveConfiguredLayout(
    items: EditEntityResponsiveGridItem[],
    columns: number,
    availableWidth: number,
    gap: number,
    minColumnWidth: number,
  ): boolean {
    if (
      columns <= 1 ||
      minColumnWidth <= 0 ||
      !items.length ||
      items.some((item) => item.rowSpan > 1)
    )
      return true;

    const trackWidth = (availableWidth - gap * (columns - 1)) / columns;
    if (trackWidth <= 0) return false;

    return items.every((item) => {
      const itemWidth =
        trackWidth * item.colSpan + gap * Math.max(0, item.colSpan - 1);
      return itemWidth + 0.5 >= minColumnWidth;
    });
  }

  private applyResponsiveLayout(
    items: EditEntityResponsiveGridItem[],
    columns: number,
  ): void {
    const rows: EditEntityResponsiveGridItem[][] = [];
    let currentRow: EditEntityResponsiveGridItem[] = [];
    let occupiedColumns = 0;

    const flushRow = (): void => {
      if (!currentRow.length) return;
      rows.push(currentRow);
      currentRow = [];
      occupiedColumns = 0;
    };

    for (const child of Array.from(this.elementRef.nativeElement.children)) {
      if (!(child instanceof HTMLElement)) continue;

      if (this.isFullWidthElement(child)) {
        flushRow();
        this.applyFullWidthLayout(child);
        continue;
      }

      const item = items.find((candidate) => candidate.element === child);
      if (!item) continue;

      const colSpan = Math.min(item.colSpan, columns);
      if (occupiedColumns > 0 && occupiedColumns + colSpan > columns) {
        flushRow();
        rows.push([{ ...item, colSpan: columns, rowSpan: 1 }]);
        continue;
      }

      currentRow.push({ ...item, colSpan, rowSpan: 1 });
      occupiedColumns += colSpan;
      if (occupiedColumns === columns) flushRow();
    }

    flushRow();

    for (const row of rows) {
      const singleItem = row.length === 1 ? row[0] : undefined;
      if (singleItem && singleItem.colSpan < columns)
        singleItem.colSpan = columns;

      row.forEach((item) => {
        this.applyColumnSpan(item.element, item.colSpan);
        item.element.style.removeProperty("grid-row");
      });
    }
  }

  private restoreConfiguredLayout(items: EditEntityResponsiveGridItem[]): void {
    for (const child of Array.from(this.elementRef.nativeElement.children)) {
      if (!(child instanceof HTMLElement)) continue;

      if (this.isFullWidthElement(child)) {
        this.applyFullWidthLayout(child);
        continue;
      }

      const item = items.find((candidate) => candidate.element === child);
      if (!item) continue;

      this.applyColumnSpan(item.element, item.colSpan);
      if (item.rowSpan > 1)
        item.element.style.setProperty("grid-row", `span ${item.rowSpan}`);
      else item.element.style.removeProperty("grid-row");
    }
  }

  private applyColumnSpan(element: HTMLElement, span: number): void {
    element.style.setProperty("grid-column", `span ${span}`);
    if (element.classList.contains("edit-entity-item--break-before")) {
      element.style.setProperty("grid-column-start", "1");
      element.style.setProperty("grid-column-end", `span ${span}`);
    }
  }

  private applyFullWidthLayout(element: HTMLElement): void {
    element.style.setProperty("grid-column", "1 / -1");
    element.style.removeProperty("grid-row");
  }

  private isFullWidthElement(element: HTMLElement): boolean {
    return element.classList.contains("edit-entity-grid-break");
  }

  private readOriginalSpan(
    element: HTMLElement,
    property: string,
    max: number,
  ): number {
    const value = Number(element.style.getPropertyValue(property));
    return Math.min(this.normalizePositiveInteger(value, 1), max);
  }

  private resolveEffectiveColumns(
    configuredColumns: number,
    availableWidth: number,
    gap: number,
    minColumnWidth: number,
  ): number {
    if (configuredColumns <= 1 || minColumnWidth <= 0) return configuredColumns;

    const fittingColumns = Math.floor(
      (availableWidth + gap) / (minColumnWidth + gap),
    );
    return Math.max(1, Math.min(configuredColumns, fittingColumns));
  }

  private getContentWidth(element: HTMLElement): number {
    const styles = getComputedStyle(element);
    const horizontalPadding =
      this.parsePixelValue(styles.paddingLeft) +
      this.parsePixelValue(styles.paddingRight);
    return Math.max(0, element.clientWidth - horizontalPadding);
  }

  private getGap(element: HTMLElement): number {
    const styles = getComputedStyle(element);
    return this.parsePixelValue(
      styles.columnGap === "normal" ? "0px" : styles.columnGap,
    );
  }

  private measureCssLength(value: string, element: HTMLElement): number {
    if (!value || value === "0" || value === "0px") return 0;

    this.mutationObserver?.disconnect();

    const probe = element.ownerDocument.createElement("div");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.width = value;
    probe.style.height = "0";
    element.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();

    this.observeMutations();
    return width;
  }

  private parsePixelValue(value: string): number {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private normalizePositiveInteger(value: unknown, fallback: number): number {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue <= 0) return fallback;
    return Math.max(1, Math.floor(numberValue));
  }
}
