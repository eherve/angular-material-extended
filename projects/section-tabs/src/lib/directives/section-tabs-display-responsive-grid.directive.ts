/** @format */

import { AfterViewInit, Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import type { SectionTabsDisplayGrid } from '../section-tabs-display/section-tabs-display.types';

interface ResponsiveGridItem {
  element: HTMLElement;
  span: number;
}

@Directive({
  selector: '[appSectionTabsDisplayResponsiveGrid]',
  standalone: false,
})
export class SectionTabsDisplayResponsiveGridDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input('appSectionTabsDisplayResponsiveGrid') grid?: SectionTabsDisplayGrid;
  @Input() sectionTabsDisplayResponsiveGridEnabled = true;

  private initialized = false;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.initialized = true;
    this.refreshObserver();
    this.applyLayout();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.initialized) return;

    this.refreshObserver();
    this.applyLayout();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }

  private refreshObserver(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.resizeObserver = undefined;
    this.mutationObserver = undefined;

    if (!this.sectionTabsDisplayResponsiveGridEnabled) return;

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((): void => this.applyLayout());
      this.resizeObserver.observe(this.elementRef.nativeElement);
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver((): void => this.applyLayout());
      this.observeMutations();
    }
  }

  private observeMutations(): void {
    this.mutationObserver?.observe(this.elementRef.nativeElement, { childList: true });
  }

  private applyLayout(): void {
    const element = this.elementRef.nativeElement;
    const configuredColumns = this.normalizePositiveInteger(this.grid?.columns, 1);

    if (!this.sectionTabsDisplayResponsiveGridEnabled) {
      element.style.removeProperty('--section-tabs-display-grid-effective-columns');
      this.restoreConfiguredSpans(configuredColumns);
      return;
    }

    const availableWidth = this.getContentWidth(element);
    if (availableWidth <= 0) return;

    const gap = this.getGap(element);
    const minColumnWidth = this.measureCssLength(this.grid?.minColumnWidth || '0px', element);
    const effectiveColumns = this.resolveEffectiveColumns(configuredColumns, availableWidth, gap, minColumnWidth);

    element.style.setProperty('--section-tabs-display-grid-effective-columns', `${effectiveColumns}`);
    this.applyResponsiveSpans(effectiveColumns);
  }

  private applyResponsiveSpans(columns: number): void {
    const rows: ResponsiveGridItem[][] = [];
    let currentRow: ResponsiveGridItem[] = [];
    let occupiedColumns = 0;

    const flushRow = (): void => {
      if (!currentRow.length) return;
      rows.push(currentRow);
      currentRow = [];
      occupiedColumns = 0;
    };

    for (const child of Array.from(this.elementRef.nativeElement.children)) {
      if (!(child instanceof HTMLElement)) continue;

      if (child.classList.contains('section-tabs-display__grid-break')) {
        flushRow();
        continue;
      }

      const originalSpan = this.readOriginalSpan(child, columns);
      const span = Math.min(originalSpan, columns);

      if (occupiedColumns > 0 && occupiedColumns + span > columns) {
        flushRow();
        rows.push([{ element: child, span: columns }]);
        continue;
      }

      currentRow.push({ element: child, span });
      occupiedColumns += span;
      if (occupiedColumns === columns) flushRow();
    }

    flushRow();

    for (const row of rows) {
      const singleItem = row.length === 1 ? row[0] : undefined;
      if (singleItem && singleItem.span < columns) singleItem.span = columns;
      row.forEach((item): void => item.element.style.setProperty('grid-column', `span ${item.span}`));
    }
  }

  private restoreConfiguredSpans(columns: number): void {
    for (const child of Array.from(this.elementRef.nativeElement.children)) {
      if (!(child instanceof HTMLElement) || child.classList.contains('section-tabs-display__grid-break')) continue;
      child.style.setProperty('grid-column', `span ${this.readOriginalSpan(child, columns)}`);
    }
  }

  private readOriginalSpan(element: HTMLElement, columns: number): number {
    const value = element.style.getPropertyValue('--section-tabs-display-item-col-span');
    return Math.min(this.normalizePositiveInteger(Number(value), 1), columns);
  }

  private resolveEffectiveColumns(
    configuredColumns: number,
    availableWidth: number,
    gap: number,
    minColumnWidth: number,
  ): number {
    if (configuredColumns <= 1 || minColumnWidth <= 0) return configuredColumns;

    const fittingColumns = Math.floor((availableWidth + gap) / (minColumnWidth + gap));
    return Math.max(1, Math.min(configuredColumns, fittingColumns));
  }

  private getContentWidth(element: HTMLElement): number {
    const styles = getComputedStyle(element);
    const horizontalPadding = this.parsePixelValue(styles.paddingLeft) + this.parsePixelValue(styles.paddingRight);
    return Math.max(0, element.clientWidth - horizontalPadding);
  }

  private getGap(element: HTMLElement): number {
    const styles = getComputedStyle(element);
    return this.parsePixelValue(styles.columnGap === 'normal' ? '0px' : styles.columnGap);
  }

  private measureCssLength(value: string, element: HTMLElement): number {
    if (!value || value === '0' || value === '0px') return 0;

    this.mutationObserver?.disconnect();

    const probe = element.ownerDocument.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.width = value;
    probe.style.height = '0';
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

  private normalizePositiveInteger(value: number | null | undefined, fallback: number): number {
    if (!Number.isFinite(value) || Number(value) <= 0) return fallback;
    return Math.max(1, Math.floor(Number(value)));
  }
}
