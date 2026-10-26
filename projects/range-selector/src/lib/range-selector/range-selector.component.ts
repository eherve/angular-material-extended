/** @format */

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import moment, { Moment } from 'moment';
import { debounceTime, Subscription } from 'rxjs';

import {
  RangeDate,
  RangeSelectorDisplay,
  RangeSelectorElement,
  RangeSelectorKind,
  RangeSelectorNavigation,
  RangeSelectorOption,
  RangeSelectorState,
  RangeSelectorView,
} from '../range-selector.types';
import { RangeSelectorIntl } from '../range-selector-intl';
import { RANGE_SELECTOR_DATE_FORMATS } from '../range-selector-date-formats';

type RangeSelectorOptionViewModel = RangeSelectorOption & {
  key: string;
};

type RangeSelectorPeriod = {
  amount: number;
  unit: moment.unitOfTime.DurationConstructor;
};

@Component({
  selector: 'app-range-selector',
  templateUrl: './range-selector.component.html',
  styleUrl: './range-selector.component.scss',
  providers: [
    { provide: MAT_DATE_FORMATS, useFactory: (): MatDateFormats => inject(RANGE_SELECTOR_DATE_FORMATS) },
    { provide: DateAdapter, useClass: MomentDateAdapter },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
  ],
})
export class RangeSelectorComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() kind: RangeSelectorKind = 'past';
  @Input() display: RangeSelectorDisplay = 'card';
  @Input() ranges: RangeSelectorOption[] = [];
  @Input() selected: RangeSelectorOption | null = null;
  @Input() defaultView: RangeSelectorView = 'month';
  @Input() allowAllDates = true;
  @Input() showToday = true;

  readonly intl = inject(RangeSelectorIntl);
  readonly datepickerPanelClass = input<string | string[]>('');
  readonly navigation = input<RangeSelectorNavigation | null>(null);

  @Output() changed = new EventEmitter<RangeDate>();
  @Output() stateChanged = new EventEmitter<RangeSelectorState>();

  rangeOptions: RangeSelectorOptionViewModel[] = [];
  rangeDate: RangeDate | null = null;
  allDates = false;
  disableToday = false;
  view: RangeSelectorView | null = null;
  period: RangeSelectorPeriod = { amount: 1, unit: 'month' };
  selectedKey: string | null = null;

  rangeFormGroup = new FormGroup({
    start: new FormControl<Moment | null>(null),
    end: new FormControl<Moment | null>(null),
  });

  @ContentChildren('rangeElement', { descendants: true })
  private elements?: QueryList<RangeSelectorElement>;

  private changeDetectorRef = inject(ChangeDetectorRef);
  private initialized = false;
  private lastStateKey: string | null = null;
  private lastRangeKey: string | null = null;
  private programmaticRangeKey: string | null = null;
  private selectedOption: RangeSelectorOptionViewModel | null = null;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.rangeOptions = this.buildRangeOptions(this.ranges);
    if (!this.navigation()) this.initializeSelection();

    this.subscriptions.add(
      this.rangeFormGroup.valueChanges.pipe(debounceTime(100)).subscribe(() => this.onRangeFormChanged()),
    );

    this.subscriptions.add(
      this.intl.changes.subscribe(() => {
        this.rangeOptions = this.buildRangeOptions(this.ranges);
        this.changeDetectorRef.markForCheck();
      }),
    );

    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized) return;

    if (changes['ranges']) {
      this.rangeOptions = this.buildRangeOptions(this.ranges);
      if (!this.navigation()) this.initializeSelection();
      return;
    }

    if (changes['selected'] && !this.navigation()) {
      this.selectedOption = null;
      this.initializeSelection();
    }
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(this.elements?.changes.subscribe(() => this.syncElements()));
    this.syncElements();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  today(): void {
    const navigation = this.navigation();
    if (navigation) return navigation.today();

    const nextView = this.view ?? this.defaultView;
    const option = this.findOptionByView(nextView);

    if (option) {
      this.selectOption(option);
      return;
    }

    this.clearSelectedOption();
    this.view = nextView;
    this.setAllDates(false, false);
    this.setCurrentViewRange(moment());
  }

  showAllDates(): void {
    if (!this.allowAllDates) return;

    this.programmaticRangeKey = null;
    this.clearSelectedOption();
    this.view = null;
    this.setAllDates(true);
  }

  prev(): void {
    const navigation = this.navigation();
    if (navigation) return navigation.previous();

    const dateRange = this.getCurrentMomentRange();
    if (!dateRange) return;

    this.setAllDates(false, false);

    if (this.view) {
      this.setCurrentViewRange(dateRange.start.clone().subtract(1, this.view));
      return;
    }

    this.clearSelectedOption();
    this.shiftCurrentRange(-1, dateRange);
  }

  next(): void {
    const navigation = this.navigation();
    if (navigation) return navigation.next();

    const dateRange = this.getCurrentMomentRange();
    if (!dateRange) return;

    this.setAllDates(false, false);

    if (this.view) {
      this.setCurrentViewRange(dateRange.start.clone().add(1, this.view));
      return;
    }

    this.clearSelectedOption();
    this.shiftCurrentRange(1, dateRange);
  }

  onSelectedChanged(event: MatButtonToggleChange): void {
    const navigation = this.navigation();
    if (navigation) return navigation.select(event.value);

    const option = this.rangeOptions.find(range => range.key === event.value) ?? null;
    this.selectOption(option);
  }

  changeView(view: RangeSelectorView): void {
    const option = this.findOptionByView(view);

    if (option) {
      this.selectOption(option);
      return;
    }

    this.clearSelectedOption();
    this.view = view;
    this.setAllDates(false, false);
    this.setCurrentViewRange(moment());
  }

  setRange(dateRange: RangeDate): void {
    this.clearSelectedOption();
    this.view = null;
    this.setAllDates(false, false);
    this.setDateRange(moment(dateRange.start), moment(dateRange.end));
  }

  private initializeSelection(): void {
    const option = this.findSelectedOption() ?? this.findDefaultOption();

    if (option) {
      this.selectOption(option);
      return;
    }

    this.clearSelectedOption();
    this.view = null;
    this.setAllDates(false, false);
    this.setDateRange(moment().startOf('day'), moment().endOf('day'));
  }

  private selectOption(option: RangeSelectorOptionViewModel | null): void {
    if (!option) {
      this.clearSelectedOption();
      return;
    }

    this.selectedOption = option;
    this.selectedKey = option.key;
    this.period = this.getOptionPeriod(option);
    this.setAllDates(false, false);

    if (option.view) {
      this.view = option.view;
      this.setCurrentViewRange(moment());
      return;
    }

    this.view = null;
    const dateRange = this.buildOptionRange(option);
    this.setDateRange(dateRange.start, dateRange.end);
  }

  private clearSelectedOption(): void {
    this.selectedOption = null;
    this.selectedKey = null;
  }

  private buildRangeOptions(ranges: RangeSelectorOption[] | null | undefined): RangeSelectorOptionViewModel[] {
    const messages = this.intl.messages;
    const options: RangeSelectorOption[] =
      ranges?.length ? ranges : (
        [
          { id: 'year', label: messages.year, view: 'year' },
          { id: 'month', label: messages.month, view: 'month' },
          { id: 'week', label: messages.week, view: 'week' },
          { id: 'day', label: messages.day, view: 'day' },
        ]
      );

    return options.map((option, index) => ({
      ...option,
      key: this.buildOptionKey(option, index),
    }));
  }

  private buildOptionKey(option: RangeSelectorOption, index: number): string {
    const keyedOption = option as RangeSelectorOption & { key?: string };

    if (keyedOption.key) return keyedOption.key;
    if (option.id) return option.id;
    if (option.view) return option.view;
    if (option.amount && option.unit) return `${option.amount}-${option.unit}-${option.label}`;
    return option.label || `range-${index}`;
  }

  private findSelectedOption(): RangeSelectorOptionViewModel | null {
    const selected = this.selectedOption ?? this.selected;
    if (!selected) return null;

    const selectedKey = this.buildOptionKey(selected, -1);
    return this.rangeOptions.find(option => option.key === selectedKey) ?? null;
  }

  private findDefaultOption(): RangeSelectorOptionViewModel | null {
    const defaultViewOption = this.findOptionByView(this.defaultView);
    if (defaultViewOption) return defaultViewOption;
    if (this.rangeOptions.some(option => !!option.view)) return this.rangeOptions[0] ?? null;
    return this.rangeOptions[this.rangeOptions.length - 1] ?? null;
  }

  private findOptionByView(view: RangeSelectorView): RangeSelectorOptionViewModel | null {
    return this.rangeOptions.find(option => option.view === view) ?? null;
  }

  private buildOptionRange(option: RangeSelectorOptionViewModel): { start: Moment; end: Moment } {
    if (option.range) {
      const dateRange = option.range();
      return { start: moment(dateRange.start), end: moment(dateRange.end) };
    }

    if (this.kind === 'future') {
      return {
        start: moment().startOf('day'),
        end: moment().add(this.period.amount, this.period.unit).endOf('day'),
      };
    }

    return {
      start: moment().subtract(this.period.amount, this.period.unit).startOf('day'),
      end: moment().endOf('day'),
    };
  }

  private getOptionPeriod(option: RangeSelectorOptionViewModel): RangeSelectorPeriod {
    if (option.amount && option.unit) {
      return { amount: option.amount, unit: option.unit };
    }

    if (option.view) {
      return { amount: 1, unit: option.view };
    }

    return this.period;
  }

  private setCurrentViewRange(reference: Moment): void {
    const view = this.view ?? this.defaultView;
    this.setDateRange(reference.clone().startOf(view), reference.clone().endOf(view));
  }

  private setDateRange(start: Moment, end: Moment): void {
    const rangeStart = start.clone();
    const rangeEnd = end.clone();

    this.programmaticRangeKey = this.buildMomentRangeKey(rangeStart, rangeEnd);
    this.rangeFormGroup.setValue({ start: rangeStart, end: rangeEnd }, { emitEvent: false });
    this.disableToday = !this.allDates && this.isCurrentRangeToday();
    this.emitCurrentState();
    this.changeDetectorRef.markForCheck();
  }

  private setAllDates(allDates: boolean, emitState = true): void {
    this.allDates = allDates;

    if (allDates) {
      this.rangeFormGroup.disable({ emitEvent: false });
    } else {
      this.rangeFormGroup.enable({ emitEvent: false });
    }

    this.disableToday = !allDates && this.isCurrentRangeToday();

    if (emitState) {
      this.emitCurrentState();
      this.changeDetectorRef.markForCheck();
    }
  }

  private shiftCurrentRange(direction: -1 | 1, dateRange: { start: Moment; end: Moment }): void {
    const shiftDays = this.getSelectedRangeLengthInDays(dateRange.start, dateRange.end) * direction;
    this.setDateRange(dateRange.start.clone().add(shiftDays, 'days'), dateRange.end.clone().add(shiftDays, 'days'));
  }

  private onRangeFormChanged(): void {
    if (this.allDates) return;

    const currentRange = this.getCurrentMomentRange();
    if (!currentRange) return;

    const dateRange = {
      start: currentRange.start.clone().startOf('day'),
      end: currentRange.end.clone().endOf('day'),
    };
    const rangeKey = this.buildMomentRangeKey(dateRange.start, dateRange.end);

    this.rangeFormGroup.setValue(dateRange, { emitEvent: false });
    if (rangeKey === this.programmaticRangeKey) return;

    this.programmaticRangeKey = null;
    this.clearSelectedOption();
    this.view = null;
    this.disableToday = this.isCurrentRangeToday();
    this.emitCurrentState();
    this.changeDetectorRef.markForCheck();
  }

  private emitCurrentState(): void {
    const state = this.buildCurrentState();
    const stateKey = this.buildStateKey(state);

    if (stateKey === this.lastStateKey) return;

    this.lastStateKey = stateKey;
    this.stateChanged.emit(state);

    if (state.dateRange) {
      this.emitRangeIfNeeded(state.dateRange);
      return;
    }

    this.lastRangeKey = null;
    this.rangeDate = null;
    this.syncElements(state);
  }

  private emitRangeIfNeeded(dateRange: RangeDate): void {
    const rangeKey = this.buildRangeKey(dateRange);

    if (rangeKey === this.lastRangeKey) return;

    this.lastRangeKey = rangeKey;
    this.rangeDate = dateRange;
    this.changed.emit(dateRange);
    this.syncElements(this.buildCurrentState());
  }

  private buildCurrentState(): RangeSelectorState {
    return {
      allDates: this.allDates,
      view: this.allDates ? null : this.view,
      dateRange: this.allDates ? null : this.getCurrentDateRange(),
    };
  }

  private buildStateKey(state: RangeSelectorState): string {
    return [state.allDates, state.view ?? 'none', state.dateRange ? this.buildRangeKey(state.dateRange) : 'all'].join(
      '|',
    );
  }

  private buildRangeKey(dateRange: RangeDate): string {
    return `${dateRange.start.getTime()}-${dateRange.end.getTime()}`;
  }

  private buildMomentRangeKey(start: Moment, end: Moment): string {
    return `${start.valueOf()}-${end.valueOf()}`;
  }

  private syncElements(state: RangeSelectorState = this.buildCurrentState()): void {
    const trigger = 'range-selector';

    this.elements?.forEach(element => {
      if (state.allDates || !state.dateRange) {
        if (typeof element.clearExtremes === 'function') {
          element.clearExtremes(true, trigger);
        }
        return;
      }

      if (typeof element.setExtremes === 'function') {
        element.setExtremes(state.dateRange, true, trigger);
      }
    });
  }

  private getCurrentMomentRange(): { start: Moment; end: Moment } | null {
    const { start, end } = this.rangeFormGroup.getRawValue();
    if (!moment.isMoment(start) || !moment.isMoment(end)) return null;
    return { start, end };
  }

  private getCurrentDateRange(): RangeDate | null {
    const dateRange = this.getCurrentMomentRange();
    if (!dateRange) return null;

    return {
      start: dateRange.start.toDate(),
      end: dateRange.end.toDate(),
    };
  }

  private getSelectedRangeLengthInDays(start: Moment, end: Moment): number {
    return Math.max(end.clone().startOf('day').diff(start.clone().startOf('day'), 'days') + 1, 1);
  }

  private isCurrentRangeToday(): boolean {
    const dateRange = this.getCurrentMomentRange();
    if (!dateRange) return false;

    const today = moment();
    return today.isSameOrAfter(dateRange.start, 'day') && today.isSameOrBefore(dateRange.end, 'day');
  }
}
