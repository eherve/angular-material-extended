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
  },
};

type NumberOptions = {
  separator: string;
  decimal: string;
};

const DEFAULT_NUMBER_OPTIONS = {
  separator: ',',
  decimal: '.',
  duration: 0.3,
  useEasing: false,
};

const NUMBER_OPTIONS: { [locale: string]: NumberOptions } = {
  fr: {
    separator: ' ',
    decimal: ',',
  },
};

@Injectable()
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

  numberOptions!: NumberOptions;

  getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) return `0 ${this.onLabel} ${length}`;
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${this.onLabel} ${length}`;
  };

  constructor() {
    this.setLabels(LABELS[this.locale] ?? DEFAULT_LABELS);
    this.numberOptions = NUMBER_OPTIONS[this.locale] ?? DEFAULT_NUMBER_OPTIONS;
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
  }
}
