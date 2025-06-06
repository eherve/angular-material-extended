/** @format */

import { inject, Inject, Injectable, LOCALE_ID, OnInit } from '@angular/core';

type Labels = {
  noDateLabel: string;
  itemsPerPageLabel: string;
  nextPageLabel: string;
  lastPageLabel: string;
  previousPageLabel: string;
  firstPageLabel: string;
  onLabel: string;
};

const DEFAULT_LABELS: Labels = {
  noDateLabel: 'No data',
  itemsPerPageLabel: `Items per page:`,
  nextPageLabel: `Next page`,
  lastPageLabel: `Last page`,
  previousPageLabel: `Previous page`,
  firstPageLabel: `First page`,
  onLabel: `on`,
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
  },
};

type NumberOptions = {
  separator: string;
  decimal: string;
};

const DEFAULT_NUMBER_OPTIONS = {
  separator: ',',
  decimal: '.',
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

  private setLabels(labels: Labels) {
    this.noDateLabel = labels.noDateLabel;
    this.itemsPerPageLabel = labels.itemsPerPageLabel;
    this.nextPageLabel = labels.nextPageLabel;
    this.lastPageLabel = labels.lastPageLabel;
    this.previousPageLabel = labels.previousPageLabel;
    this.firstPageLabel = labels.firstPageLabel;
    this.onLabel = labels.onLabel;
  }
}
