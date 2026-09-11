/** @format */

import { inject, Injectable, LOCALE_ID } from '@angular/core';

type Labels = {
  noDateLabel: string;
  itemsPerPageLabel: string;
  nextPageLabel: string;
  lastPageLabel: string;
  previousPageLabel: string;
  firstPageLabel: string;
  onLabel: string;
  incrementalLoadingLabel: string;
  incrementalLoadMoreLabel: string;
  columnsActionLabel: string;
  exportActionLabel: string;
  refreshActionLabel: string;
  showColumnActionLabel: string;
  hideColumnActionLabel: string;
  pinColumnActionLabel: string;
  unpinColumnActionLabel: string;
  sortColumnActionLabel: string;
  clearFilterLabel: string;
};

const DEFAULT_LABELS: Labels = {
  noDateLabel: 'No data',
  itemsPerPageLabel: `Items per page:`,
  nextPageLabel: `Next page`,
  lastPageLabel: `Last page`,
  previousPageLabel: `Previous page`,
  firstPageLabel: `First page`,
  onLabel: `on`,
  incrementalLoadingLabel: 'Loading...',
  incrementalLoadMoreLabel: 'Load more',
  columnsActionLabel: 'Configure columns',
  exportActionLabel: 'Export data',
  refreshActionLabel: 'Refresh data',
  showColumnActionLabel: 'Show column',
  hideColumnActionLabel: 'Hide column',
  pinColumnActionLabel: 'Pin column',
  unpinColumnActionLabel: 'Unpin column',
  sortColumnActionLabel: 'Sort column',
  clearFilterLabel: 'Clear filter',
};

const LABELS: { [locale: string]: Labels } = {
  fr: {
    noDateLabel: 'Aucune donnée',
    itemsPerPageLabel: `Éléments par page :`,
    nextPageLabel: `Page suivante`,
    lastPageLabel: `Dernière page`,
    previousPageLabel: `Page précédente`,
    firstPageLabel: `Première page`,
    onLabel: `sur`,
    incrementalLoadingLabel: 'Chargement...',
    incrementalLoadMoreLabel: 'Charger plus',
    columnsActionLabel: 'Configurer les colonnes',
    exportActionLabel: 'Exporter les données',
    refreshActionLabel: 'Actualiser les données',
    showColumnActionLabel: 'Afficher la colonne',
    hideColumnActionLabel: 'Masquer la colonne',
    pinColumnActionLabel: 'Épingler la colonne',
    unpinColumnActionLabel: 'Désépingler la colonne',
    sortColumnActionLabel: 'Trier la colonne',
    clearFilterLabel: 'Effacer le filtre',
  },
};

type NumberOptions = {
  separator: string;
  decimal: string;
  duration: number;
  useEasing: boolean;
};

const DEFAULT_NUMBER_OPTIONS = {
  separator: ',',
  decimal: '.',
  duration: 0.3,
  useEasing: false,
};

const NUMBER_OPTIONS: { [locale: string]: Partial<NumberOptions> } = {
  fr: {
    separator: ' ',
    decimal: ',',
  },
};

@Injectable({ providedIn: 'root' })
export class NgxMatDatatableIntl {
  locale: string = inject(LOCALE_ID);
  noDateLabel!: string;
  itemsPerPageLabel!: string;
  nextPageLabel!: string;
  lastPageLabel!: string;
  previousPageLabel!: string;
  firstPageLabel!: string;
  onLabel!: string;
  incrementalLoadingLabel!: string;
  incrementalLoadMoreLabel!: string;
  columnsActionLabel!: string;
  exportActionLabel!: string;
  refreshActionLabel!: string;
  showColumnActionLabel!: string;
  hideColumnActionLabel!: string;
  pinColumnActionLabel!: string;
  unpinColumnActionLabel!: string;
  sortColumnActionLabel!: string;
  clearFilterLabel!: string;

  numberOptions!: NumberOptions;

  getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) return `0 ${this.onLabel} ${length}`;
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${this.onLabel} ${length}`;
  };

  constructor() {
    const locale = this.locale.toLowerCase().split(/[-_]/)[0];
    this.setLabels(LABELS[locale] ?? DEFAULT_LABELS);
    this.numberOptions = { ...DEFAULT_NUMBER_OPTIONS, ...(NUMBER_OPTIONS[locale] ?? {}) };
  }

  private setLabels(labels: Labels): void {
    this.noDateLabel = labels.noDateLabel;
    this.itemsPerPageLabel = labels.itemsPerPageLabel;
    this.nextPageLabel = labels.nextPageLabel;
    this.lastPageLabel = labels.lastPageLabel;
    this.previousPageLabel = labels.previousPageLabel;
    this.firstPageLabel = labels.firstPageLabel;
    this.onLabel = labels.onLabel;
    this.incrementalLoadingLabel = labels.incrementalLoadingLabel;
    this.incrementalLoadMoreLabel = labels.incrementalLoadMoreLabel;
    this.columnsActionLabel = labels.columnsActionLabel;
    this.exportActionLabel = labels.exportActionLabel;
    this.refreshActionLabel = labels.refreshActionLabel;
    this.showColumnActionLabel = labels.showColumnActionLabel;
    this.hideColumnActionLabel = labels.hideColumnActionLabel;
    this.pinColumnActionLabel = labels.pinColumnActionLabel;
    this.unpinColumnActionLabel = labels.unpinColumnActionLabel;
    this.sortColumnActionLabel = labels.sortColumnActionLabel;
    this.clearFilterLabel = labels.clearFilterLabel;
  }
}
