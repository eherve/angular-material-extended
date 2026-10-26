/** @format */

import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RangeSelectorComponent } from './range-selector.component';

describe('RangeSelectorComponent calendar navigation', () => {
  it('delegates native calendar views and navigation without emitting calculated date ranges', () => {
    TestBed.configureTestingModule({ imports: [RangeSelectorComponent], providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(RangeSelectorComponent);
    const actions: string[] = [];
    const rangeChanged = jasmine.createSpy('rangeChanged');
    fixture.componentInstance.changed.subscribe(rangeChanged);
    fixture.componentRef.setInput('ranges', [
      { id: 'month', label: 'Mois' },
      { id: 'agenda', label: 'Agenda' },
    ]);
    fixture.componentRef.setInput('allowAllDates', false);
    fixture.componentRef.setInput('navigation', {
      selectedId: 'agenda',
      title: '19–25 octobre 2026',
      disableToday: false,
      select: (id: string): void => {
        actions.push(id);
      },
      previous: (): void => {
        actions.push('previous');
      },
      next: (): void => {
        actions.push('next');
      },
      today: (): void => {
        actions.push('today');
      },
    });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    (element.querySelector('[aria-label="Période précédente"]') as HTMLButtonElement).click();
    (element.querySelector('[aria-label="Période suivante"]') as HTMLButtonElement).click();
    (
      [...element.querySelectorAll('button')].find(button =>
        button.textContent?.includes("Aujourd'hui"),
      ) as HTMLButtonElement
    ).click();
    (
      [...element.querySelectorAll('mat-button-toggle button')].find(button =>
        button.textContent?.includes('Mois'),
      ) as HTMLButtonElement
    ).click();
    expect(actions).toEqual(['previous', 'next', 'today', 'month']);
    expect(element.querySelector('.app-period-value')?.textContent).toContain('19–25 octobre 2026');
    expect(element.querySelector('mat-date-range-input')).toBeNull();
    expect(rangeChanged).not.toHaveBeenCalled();
    fixture.destroy();
  });
});
