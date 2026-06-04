/** @format */

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import moment from 'moment';
import { debounceTime, Subscription } from 'rxjs';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { DatatableSearchDateColumn } from '../../types/datatable-column.type';
import { OPERATOR, OperatorSelectComponent } from '../operator-select/operator-select.component';

@Component({
  selector: 'lib-header-date-filter',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    OperatorSelectComponent,
    SafeHtmlPipe,
  ],
  templateUrl: './header-date-filter.component.html',
  styleUrl: './header-date-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => HeaderDateFilterComponent),
    },
    provideMomentDateAdapter(),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderDateFilterComponent<Record> implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  column!: DatatableSearchDateColumn<Record>;

  control!: FormControl<any>;
  selectControl = new FormControl<Date | undefined>(undefined);
  rangeGroup = new FormGroup({
    from: new FormControl<Date | undefined>(undefined, Validators.required),
    to: new FormControl<Date | undefined>(undefined, Validators.required),
  });
  operatorControl = new FormControl<OPERATOR>('=');

  onChange: (value: any) => void = () => {};

  onTouched: () => void = () => {};

  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  private injector = inject(Injector);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private subsink = new Subscription();

  writeValue(value: any): void {
    const operator = (value?.operator ?? '=') as OPERATOR;
    this.operatorControl.setValue(operator, { emitEvent: false });
    if (this.isRangeOperator(operator)) {
      this.selectControl.setValue(undefined, { emitEvent: false });
      this.rangeGroup.setValue(
        {
          from: value?.value?.from ?? undefined,
          to: value?.value?.to ?? undefined,
        },
        { emitEvent: false },
      );
    } else {
      this.rangeGroup.reset({ from: undefined, to: undefined }, { emitEvent: false });
      this.selectControl.setValue(value?.value ?? undefined, { emitEvent: false });
    }
    this.changeDetectorRef.markForCheck();
  }

  setDisabledState(isDisabled: boolean): void {
    const controls = [this.selectControl, this.rangeGroup, this.operatorControl];
    controls.forEach(control => {
      if (isDisabled) control.disable({ emitEvent: false });
      else control.enable({ emitEvent: false });
    });
  }

  registerOnChange(onChange: (value: any) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  ngOnInit(): void {
    if (this.column.locale) {
      this._locale.set(this.column.locale);
      this._adapter.setLocale(this._locale());
      this._intl.changes.next();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (!ngControl) throw new Error(`${this.constructor.name} missing control [column:${this.column.columnDef}]`);
    this.control = ngControl.control as UntypedFormControl;
    this.subsink.add(
      this.selectControl.valueChanges.pipe(debounceTime(500)).subscribe(value => {
        if (this.control.invalid) return;
        else if (this.isEmptyValue(value)) this.onChange(undefined);
        else this.onChange(this.buildValue(this.operatorControl.value!, value));
      }),
    );
    this.subsink.add(
      this.rangeGroup.valueChanges.pipe(debounceTime(500)).subscribe(value => {
        if (!this.hasRangeValue(value)) this.onChange(undefined);
        else if (this.rangeGroup.invalid) return;
        else this.onChange(this.buildValue(this.operatorControl.value!, value));
      }),
    );
    this.subsink.add(
      this.operatorControl.valueChanges.subscribe((value: any) => {
        if (this.isRangeOperator(value)) {
          if (!this.hasRangeValue(this.rangeGroup.value)) this.onChange(undefined);
          else if (!this.rangeGroup.invalid) this.onChange(this.buildValue(value, this.rangeGroup.value));
        } else {
          if (this.isEmptyValue(this.selectControl.value)) this.onChange(undefined);
          else this.onChange(this.buildValue(value, this.selectControl.value));
        }
        this.changeDetectorRef.markForCheck();
      }),
    );
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }

  clearRange(): void {
    this.rangeGroup.reset();
    this.onChange(undefined);
    this.onTouched();
    this.changeDetectorRef.markForCheck();
  }

  private buildValue(operator: OPERATOR, value: any): any {
    switch (operator) {
      case '=':
        return {
          operator: '≤≥',
          value: { from: moment(value).startOf('day'), to: moment(value).endOf('day') },
        };
      case '>':
        return { operator, value: moment(value).endOf('day') };
      case '≥':
        return { operator, value: moment(value).startOf('day') };
      case '<':
        return { operator, value: moment(value).startOf('day') };
      case '≤':
        return { operator, value: moment(value).endOf('day') };
      case '<>':
        return { operator, value: { from: moment(value.from).endOf('day'), to: moment(value.to).startOf('day') } };
      case '≤≥':
        return { operator, value: { from: moment(value.from).startOf('day'), to: moment(value.to).endOf('day') } };
    }
  }

  private hasRangeValue(value: Partial<{ from: any; to: any }> | null | undefined): boolean {
    return !this.isEmptyValue(value?.from) || !this.isEmptyValue(value?.to);
  }

  private isEmptyValue(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  private isRangeOperator(operator: OPERATOR | null | undefined): boolean {
    return operator === '<>' || operator === '≤≥';
  }
}
