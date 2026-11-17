/** @format */

import { ComponentType } from "@angular/cdk/portal";
import { DOCUMENT, Injectable, inject } from "@angular/core";
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  EditEntityComponentOptions,
  EditEntityDialogResult,
  EditEntityRecord,
} from "@eherve/angular-material-forms/core";

export interface EntityDialogNestedOptions {
  inset?: number;
  minWidth?: number;
  minHeight?: number;
  viewportMargin?: number;
}

export type EntityDialogOpenConfig<TRecord extends EditEntityRecord> =
  MatDialogConfig<EditEntityComponentOptions<TRecord>> & {
    nested?: EntityDialogNestedOptions | null;
  };

const DEFAULT_NESTED_OPTIONS: Required<EntityDialogNestedOptions> = {
  inset: 64,
  minWidth: 640,
  minHeight: 480,
  viewportMargin: 16,
};

@Injectable({ providedIn: "root" })
export class EntityDialogLauncher {
  private readonly document = inject(DOCUMENT);
  private readonly matDialog = inject(MatDialog);

  open<TRecord extends EditEntityRecord, TComponent>(
    component: ComponentType<TComponent>,
    options: EditEntityComponentOptions<TRecord>,
    config: EntityDialogOpenConfig<TRecord> = {},
  ): MatDialogRef<TComponent, EditEntityDialogResult<TRecord>> {
    const { nested, ...dialogOverrides } = config;
    const nestedDialogConfig =
      nested === null ? {} : this.buildNestedDialogConfig(nested);
    const dialogConfig: MatDialogConfig<EditEntityComponentOptions<TRecord>> = {
      width: "90vw",
      height: "90vh",
      maxWidth: "90vw",
      maxHeight: "90vh",
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      panelClass: "edit-entity-dialog-panel",
      ...nestedDialogConfig,
      ...dialogOverrides,
      data: options,
    };

    return this.matDialog.open<
      TComponent,
      EditEntityComponentOptions<TRecord>,
      EditEntityDialogResult<TRecord>
    >(component, dialogConfig);
  }

  private buildNestedDialogConfig(
    options?: EntityDialogNestedOptions,
  ): Pick<
    MatDialogConfig<unknown>,
    "width" | "height" | "maxWidth" | "maxHeight"
  > {
    const parentSurface = this.findParentDialogSurface();
    if (!parentSurface) return {};

    const resolvedOptions: Required<EntityDialogNestedOptions> = {
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
    const minWidth = Math.min(
      Math.max(0, resolvedOptions.minWidth),
      availableWidth,
    );
    const minHeight = Math.min(
      Math.max(0, resolvedOptions.minHeight),
      availableHeight,
    );
    const width = Math.max(
      minWidth,
      Math.min(parentRect.width - inset, availableWidth),
    );
    const height = Math.max(
      minHeight,
      Math.min(parentRect.height - inset, availableHeight),
    );

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
      const activeSurface = activeElement.closest<HTMLElement>(
        ".mat-mdc-dialog-surface",
      );
      if (activeSurface) return activeSurface;
    }

    const visibleSurfaces = Array.from(
      this.document.querySelectorAll<HTMLElement>(".mat-mdc-dialog-surface"),
    ).filter((surface) => surface.getClientRects().length > 0);
    return visibleSurfaces[visibleSurfaces.length - 1] ?? null;
  }
}
