/** @format */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface RangeSelectorMessages {
  year: string;
  month: string;
  week: string;
  day: string;
  allDates: string;
  today: string;
  previousPeriod: string;
  nextPeriod: string;
  startDate: string;
  endDate: string;
}

@Injectable({ providedIn: 'root' })
export class RangeSelectorIntl {
  readonly changes = new Subject<void>();
  messages: RangeSelectorMessages = {
    year: 'Année',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    allDates: 'Toutes',
    today: "Aujourd'hui",
    previousPeriod: 'Période précédente',
    nextPeriod: 'Période suivante',
    startDate: 'du',
    endDate: 'au',
  };
}
