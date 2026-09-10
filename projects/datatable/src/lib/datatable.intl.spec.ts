import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NgxMatDatatableIntl } from './datatable.intl';

describe('NgxMatDatatableIntl', () => {
  it('should resolve regional French locales with the French labels and number options', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
    });

    const intl = TestBed.inject(NgxMatDatatableIntl);

    expect(intl.itemsPerPageLabel).toBe('Éléments par page :');
    expect(intl.incrementalLoadMoreLabel).toBe('Charger plus');
    expect(intl.numberOptions.separator).toBe(' ');
    expect(intl.numberOptions.decimal).toBe(',');
  });
});
