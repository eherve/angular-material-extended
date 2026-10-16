/** @format */

import { Injectable, inject, DOCUMENT } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DisplayDialog } from './display-dialog.component';
import { DisplayDialogData } from './display-dialog.types';

export interface DisplayDialogNestedOptions {
  inset?: number;
  minWidth?: number;
  minHeight?: number;
  viewportMargin?: number;
}

export type DisplayDialogOpenConfig<TRecord extends object> = MatDialogConfig<DisplayDialogData<TRecord>> & {
  nested?: DisplayDialogNestedOptions | null;
};

export const DEFAULT_NESTED_OPTIONS: Required<DisplayDialogNestedOptions> = {
  inset: 64,
  minWidth: 640,
  minHeight: 480,
  viewportMargin: 16,
};

@Injectable({ providedIn: 'root' })
export class DisplayDialogService {
  private readonly document = inject(DOCUMENT);
  private readonly matDialog: MatDialog = inject(MatDialog);

  open<TRecord extends object>(
    data: DisplayDialogData<TRecord>,
    config: DisplayDialogOpenConfig<TRecord> = {},
  ): MatDialogRef<DisplayDialog<TRecord>, unknown> {
    const { nested, ...dialogOverrides } = config;
    const nestedDialogConfig = nested === null ? {} : this.buildNestedDialogConfig(nested);
    const dialogConfig: MatDialogConfig<DisplayDialogData<TRecord>> = {
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'display-dialog-panel',
      ...nestedDialogConfig,
      ...dialogOverrides,
      data,
    };
    const dialogRef = this.matDialog.open<DisplayDialog<TRecord>, DisplayDialogData<TRecord>, unknown>(
      DisplayDialog,
      dialogConfig,
    );

    return dialogRef;
  }

  private buildNestedDialogConfig(
    options?: DisplayDialogNestedOptions,
  ): Pick<MatDialogConfig<unknown>, 'width' | 'height' | 'maxWidth' | 'maxHeight'> {
    const parentSurface = this.findParentDialogSurface();
    if (!parentSurface) return {};

    const resolvedOptions: Required<DisplayDialogNestedOptions> = {
      ...DEFAULT_NESTED_OPTIONS,
      ...options,
    };

    const inset = Math.max(0, resolvedOptions.inset);
    const viewportMargin = Math.max(0, resolvedOptions.viewportMargin);
    const viewportWidth = this.document.documentElement.clientWidth;
    const viewportHeight = this.document.documentElement.clientHeight;
    const availableWidth = Math.max(0, viewportWidth - viewportMargin * 2);
    const availableHeight = Math.max(0, viewportHeight - viewportMargin * 2);

    if (availableWidth === 0 || availableHeight === 0) return {};

    const parentRect = parentSurface.getBoundingClientRect();
    const minWidth = Math.min(Math.max(0, resolvedOptions.minWidth), availableWidth);
    const minHeight = Math.min(Math.max(0, resolvedOptions.minHeight), availableHeight);
    const width = Math.max(minWidth, Math.min(parentRect.width - inset, availableWidth));
    const height = Math.max(minHeight, Math.min(parentRect.height - inset, availableHeight));

    return {
      width: `${Math.round(width)}px`,
      height: `${Math.round(height)}px`,
      maxWidth: `${Math.round(availableWidth)}px`,
      maxHeight: `${Math.round(availableHeight)}px`,
    };
  }

  private findParentDialogSurface(): HTMLElement | null {
    const activeElement = this.document.activeElement;

    if (activeElement instanceof HTMLElement) {
      const activeSurface = activeElement.closest<HTMLElement>('.mat-mdc-dialog-surface');
      if (activeSurface) return activeSurface;
    }

    const visibleSurfaces = Array.from(this.document.querySelectorAll<HTMLElement>('.mat-mdc-dialog-surface')).filter(
      surface => surface.getClientRects().length > 0,
    );

    return visibleSurfaces[visibleSurfaces.length - 1] ?? null;
  }
}
