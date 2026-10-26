/** @format */

import { InjectionToken } from '@angular/core';
import type { MatDateFormats } from '@angular/material/core';

const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'D/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM Y',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM Y',
  },
};

export const RANGE_SELECTOR_DATE_FORMATS = new InjectionToken<MatDateFormats>('RANGE_SELECTOR_DATE_FORMATS', {
  providedIn: 'root',
  factory: (): MatDateFormats => CUSTOM_DATE_FORMATS,
});
