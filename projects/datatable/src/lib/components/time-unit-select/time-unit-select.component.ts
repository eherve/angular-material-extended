/** @format */

import { animate, style, transition, trigger } from '@angular/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  forwardRef,
  HostBinding,
  inject,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import moment, { RelativeTimeKey } from 'moment';

export type TIME_UNIT = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
const TIME_UNITS: TIME_UNIT[] = ['second', 'minute', 'hour', 'day', 'month', 'year'];
const MOMENT_RELATIVE_TIME_KEY: RelativeTimeKey[] = ['ss', 'mm', 'hh', 'dd', 'MM', 'yy'];

@Component({
  selector: 'lib-time-unit-select',
  imports: [CommonModule, OverlayModule, MatIconModule, MatButtonModule],
  templateUrl: './time-unit-select.component.html',
  styleUrl: './time-unit-select.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }), // initial
        animate('0.2s', style({ opacity: 1 })), // final
      ]),
      transition(':leave', [
        style({ opacity: 1 }), // initial
        animate('0.2s', style({ opacity: 0 })), // final
      ]),
    ]),
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TimeUnitSelectComponent),
    },
  ],
})
export class TimeUnitSelectComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  static toMilliseconds(value: number, unit: TIME_UNIT): number {
    return moment.duration(value, unit).as('milliseconds') as number;
  }
  static convert(value: number, from: TIME_UNIT, to?: TIME_UNIT): number {
    if (to === undefined) (to = from), (from = 'millisecond' as any);
    return moment.duration(value, from).as(to) as number;
  }

  @Input('locale')
  set setLocale(locale: string | undefined) {
    this.locale = locale || moment.locale();
    this.loadUnitNames();
  }
  locale?: string = moment.locale();

  units = TIME_UNITS;
  unitNames: { [key: string]: string } = {};

  isOpen: boolean = false;

  control?: FormControl<any>;

  onChange = () => {};

  onTouched = () => {};

  private injector = inject(Injector);
  private changeDetectorRef = inject(ChangeDetectorRef);

  writeValue = () => {};

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  ngOnInit(): void {
    this.loadUnitNames();
  }

  async ngAfterViewInit(): Promise<void> {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (!ngControl) throw new Error(`${this.constructor.name} missing control`);
    this.control = ngControl.control as UntypedFormControl;
    this.changeDetectorRef.detectChanges();
  }

  private loadUnitNames() {
    this.unitNames = this.units.reduce(
      (pv, cv, i) => (
        (pv[cv] = moment
          .localeData(this.locale)
          .relativeTime('' as any, true, MOMENT_RELATIVE_TIME_KEY[i], false)
          .trim()),
        pv
      ),
      {} as any
    );
  }
}
