/** @format */

import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import moment from 'moment';
import 'moment/locale/fr.js';
import { RangeSelectorComponent } from './range-selector.component';
import { RangeDate, RangeSelectorState } from '../range-selector.types';
import { RangeSelectorIntl } from '../range-selector-intl';
import { RANGE_SELECTOR_DATE_FORMATS } from '../range-selector-date-formats';

@Component({ selector: 'range-probe', template: '' })
class RangeProbe {
  current: RangeDate | null = null;
  trigger: string | undefined;

  setExtremes(range: RangeDate, _redraw: boolean, trigger?: string): void {
    this.current = range;
    this.trigger = trigger;
  }

  clearExtremes(): void {
    this.current = null;
  }
}

@Component({
  imports: [RangeSelectorComponent, RangeProbe, MatCardModule],
  template: `<app-range-selector display="toolbar" (stateChanged)="states.push($event)">
    <button rangeActions>Exporter</button>
    <article #rangeElement>Contenu projeté</article>
    <range-probe #rangeElement />
    <mat-card><mat-card-content class="projected-card-body">Rapport</mat-card-content></mat-card>
  </app-range-selector>`,
})
class ProjectionHost {
  readonly selector = viewChild.required(RangeSelectorComponent);
  readonly probe = viewChild.required(RangeProbe);
  readonly states: RangeSelectorState[] = [];
}

describe('RangeSelectorComponent public contract', () => {
  let fixture: ComponentFixture<RangeSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RangeSelectorComponent, ProjectionHost],
      providers: [provideNoopAnimations(), { provide: MAT_DATE_LOCALE, useValue: 'fr' }],
    });
    fixture = TestBed.createComponent(RangeSelectorComponent);
  });

  it('refreshes translated controls and default presets without resetting the selected dates', () => {
    fixture.detectChanges();
    fixture.componentInstance.setRange({ start: new Date(2024, 1, 10), end: new Date(2024, 1, 20) });
    const intl = TestBed.inject(RangeSelectorIntl);
    intl.messages = { ...intl.messages, month: 'Month', today: 'Today', previousPeriod: 'Previous' };
    intl.changes.next();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Month');
    expect(element.textContent).toContain('Today');
    expect(element.querySelector('[aria-label="Previous"]')).not.toBeNull();
    expect(fixture.componentInstance.rangeDate?.start.getDate()).toBe(10);
    expect(fixture.componentInstance.rangeDate?.end.getDate()).toBe(20);
  });

  it('inherits toolbar colors and spacing from the host theme', () => {
    const host = TestBed.createComponent(ProjectionHost);
    const element = (host.nativeElement as HTMLElement).querySelector<HTMLElement>('app-range-selector')!;
    element.style.setProperty('--ngx-mat-range-selector-header-background', 'rgb(12, 34, 56)');
    element.style.setProperty('--ngx-mat-extended-space-2', '11px');
    host.detectChanges();
    const toolbar = element.querySelector<HTMLElement>('.app-period-toolbar')!;
    expect(getComputedStyle(toolbar).backgroundColor).toBe('rgb(12, 34, 56)');
    expect(getComputedStyle(toolbar).paddingTop).toBe('11px');
    element.style.setProperty('--ngx-mat-range-selector-header-background', 'rgb(65, 43, 21)');
    expect(getComputedStyle(toolbar).backgroundColor).toBe('rgb(65, 43, 21)');
  });

  it('leaves the internal layout of projected Material cards unchanged', () => {
    const host = TestBed.createComponent(ProjectionHost);
    host.detectChanges();
    const content = (host.nativeElement as HTMLElement).querySelector<HTMLElement>('.projected-card-body')!;
    expect(getComputedStyle(content).display).toBe('block');
  });

  it('uses the themed foreground for outlined-button interaction feedback', () => {
    const host = TestBed.createComponent(ProjectionHost);
    host.detectChanges();
    const element = (host.nativeElement as HTMLElement).querySelector<HTMLElement>('app-range-selector')!;
    element.style.setProperty('--ngx-mat-range-selector-header-text', 'rgb(210, 230, 240)');
    const button = element.querySelector<HTMLButtonElement>('button[mat-stroked-button]')!;
    // Material's button harness has no color API; inspect the rendered state layer.
    const layer = button.querySelector<HTMLElement>('span')!;
    expect(getComputedStyle(layer, '::before').backgroundColor).toBe('rgb(210, 230, 240)');
  });

  it('applies the requested theme class to the datepicker overlay', () => {
    fixture.componentRef.setInput('datepickerPanelClass', 'brand-calendar');
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLButtonElement>('mat-datepicker-toggle button')!.click();
    fixture.detectChanges();
    expect(document.querySelector('.brand-calendar')).not.toBeNull();
  });

  it('keeps inclusive leap-month boundaries when moving between calendar months', () => {
    fixture.detectChanges();
    const selector = fixture.componentInstance;
    selector.setRange({ start: new Date(2024, 0, 1), end: new Date(2024, 0, 31, 23, 59, 59, 999) });
    selector.view = 'month';
    selector.next();
    expect(selector.rangeDate?.start.getTime()).toBe(new Date(2024, 1, 1).getTime());
    expect(selector.rangeDate?.end.getTime()).toBe(new Date(2024, 1, 29, 23, 59, 59, 999).getTime());
    selector.next();
    expect(selector.rangeDate?.end.getTime()).toBe(new Date(2024, 2, 31, 23, 59, 59, 999).getTime());
  });

  it('uses the application locale for calendar weeks', () => {
    fixture.detectChanges();
    const selector = fixture.componentInstance;
    selector.setRange({ start: new Date(2024, 1, 12), end: new Date(2024, 1, 18, 23, 59, 59, 999) });
    selector.view = 'week';
    selector.next();
    expect(selector.rangeDate?.start.getTime()).toBe(new Date(2024, 1, 19).getTime());
    expect(selector.rangeDate?.end.getTime()).toBe(new Date(2024, 1, 25, 23, 59, 59, 999).getTime());
  });

  it('clears the active range in all-dates mode and restores navigation from today', () => {
    fixture.detectChanges();
    const selector = fixture.componentInstance;
    const states: RangeSelectorState[] = [];
    selector.stateChanged.subscribe(state => states.push(state));
    selector.showAllDates();
    expect(states.at(-1)).toEqual({ allDates: true, view: null, dateRange: null });
    expect(selector.rangeDate).toBeNull();
    expect(selector.rangeFormGroup.disabled).toBeTrue();
    selector.today();
    expect(selector.rangeFormGroup.enabled).toBeTrue();
    expect(states.at(-1)?.allDates).toBeFalse();
    expect(states.at(-1)?.dateRange).not.toBeNull();
  });

  it('emits a normalized manual range once after both dates are entered', fakeAsync(() => {
    fixture.detectChanges();
    const selector = fixture.componentInstance;
    const ranges: RangeDate[] = [];
    selector.changed.subscribe(range => ranges.push(range));
    selector.rangeFormGroup.setValue({ start: moment([2024, 1, 10, 10]), end: null });
    tick(100);
    expect(ranges).toEqual([]);
    selector.rangeFormGroup.patchValue({ end: moment([2024, 1, 20, 12]) });
    tick(100);
    expect(ranges.length).toBe(1);
    expect(ranges[0].start.getTime()).toBe(new Date(2024, 1, 10).getTime());
    expect(ranges[0].end.getTime()).toBe(new Date(2024, 1, 20, 23, 59, 59, 999).getTime());
  }));

  it('preserves projected business actions and content in toolbar mode', () => {
    const host = TestBed.createComponent(ProjectionHost);
    host.detectChanges();
    const element: HTMLElement = host.nativeElement;
    expect(element.querySelector('.app-period-actions')?.textContent).toContain('Exporter');
    expect(element.querySelector('.app-range-content')?.textContent).toContain('Contenu projeté');
    expect(host.componentInstance.states.length).toBe(1);
  });

  it('updates projected range elements and clears their bounds in all-dates mode', () => {
    const host = TestBed.createComponent(ProjectionHost);
    host.detectChanges();
    const { selector, probe } = host.componentInstance;
    const range = { start: new Date(2024, 1, 1), end: new Date(2024, 1, 29, 23, 59, 59, 999) };
    selector().setRange(range);
    expect(probe().current).toEqual(range);
    expect(probe().trigger).toBe('range-selector');
    selector().showAllDates();
    expect(probe().current).toBeNull();
  });

  it('preserves custom presets and sanitizes their HTML labels', () => {
    fixture.componentRef.setInput('ranges', [
      {
        id: 'custom',
        label: '<strong>Exercice</strong><script>window.unwanted = true</script>',
        range: (): RangeDate => ({ start: new Date(2023, 6, 1), end: new Date(2024, 5, 30, 23, 59, 59, 999) }),
      },
    ]);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('mat-button-toggle strong')?.textContent).toBe('Exercice');
    expect(element.querySelector('script')).toBeNull();
    expect(fixture.componentInstance.rangeDate?.start.getTime()).toBe(new Date(2023, 6, 1).getTime());
    expect(fixture.componentInstance.rangeDate?.end.getTime()).toBe(new Date(2024, 5, 30, 23, 59, 59, 999).getTime());
  });
});

describe('RangeSelectorComponent date format configuration', () => {
  it('uses the host-provided Moment date formats in the visible date inputs', () => {
    TestBed.configureTestingModule({
      imports: [RangeSelectorComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MAT_DATE_LOCALE, useValue: 'fr' },
        {
          provide: RANGE_SELECTOR_DATE_FORMATS,
          useValue: {
            parse: { dateInput: 'YYYY-MM-DD' },
            display: {
              dateInput: 'YYYY-MM-DD',
              monthYearLabel: 'MMMM YYYY',
              dateA11yLabel: 'LL',
              monthYearA11yLabel: 'MMMM YYYY',
            },
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(RangeSelectorComponent);
    fixture.detectChanges();
    fixture.componentInstance.setRange({ start: new Date(2024, 1, 10), end: new Date(2024, 1, 20) });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector<HTMLInputElement>('input[matStartDate]')?.value).toBe('2024-02-10');
    expect(element.querySelector<HTMLInputElement>('input[matEndDate]')?.value).toBe('2024-02-20');
  });
});
