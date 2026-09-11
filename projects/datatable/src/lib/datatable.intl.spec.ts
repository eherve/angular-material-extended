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
    expect(intl.columnsActionLabel).toBe('Configurer les colonnes');
    expect(intl.exportActionLabel).toBe('Exporter les données');
    expect(intl.clearFilterLabel).toBe('Effacer le filtre');
    expect(intl.numberOptions.separator).toBe(' ');
    expect(intl.numberOptions.decimal).toBe(',');
    expect(intl.numberOptions.duration).toBe(0.3);
    expect(intl.numberOptions.useEasing).toBeFalse();
  });
});
