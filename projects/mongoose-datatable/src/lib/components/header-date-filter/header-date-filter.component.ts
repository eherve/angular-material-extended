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
import { MatMenuModule } from '@angular/material/menu';
import { debounceTime, Subscription } from 'rxjs';
import { MongooseDatatableSearchDateColumn } from '../../types/datatable-column.type';
import { OperatorSelectComponent } from '../operator-select/operator-select.component';

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
    MatMenuModule,
    ReactiveFormsModule,
    OperatorSelectComponent,
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
export class HeaderDateFilterComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  column!: MongooseDatatableSearchDateColumn;

  control!: FormControl<any>;
  selectControl = new FormControl<Date | undefined>(undefined);
  rangeGroup = new FormGroup({
    start: new FormControl<Date | undefined>(undefined, Validators.required),
    end: new FormControl<Date | undefined>(undefined, Validators.required),
  });
  operatorControl = new FormControl('=');

  onChange = () => {};

  onTouched = () => {};

  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  private injector = inject(Injector);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private subsink = new Subscription();

  writeValue = (value: any) => {
    if (value?.value !== this.selectControl.value) this.selectControl.setValue(value?.value);
  };

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
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
        else if (!value) this.control.setValue(undefined);
        else this.control.setValue({ value, regex: false, operator: this.operatorControl.value });
      })
    );
    this.subsink.add(
      this.rangeGroup.valueChanges.pipe(debounceTime(500)).subscribe(value => {
        if (this.rangeGroup.invalid) return;
        else if (!value) this.control.setValue(undefined);
        else
          this.control.setValue({
            start: value.start,
            end: value.end,
            regex: false,
            operator: this.operatorControl.value,
          });
      })
    );
    this.subsink.add(
      this.operatorControl.valueChanges.subscribe((value: any) => {
        if (['<>', '≤≥'].includes(this.operatorControl.value!)) {
          if (!this.rangeGroup.value || this.rangeGroup.invalid) return;
          this.control.setValue({
            start: this.rangeGroup.value.start,
            end: this.rangeGroup.value.end,
            regex: false,
            operator: value,
          });
        } else {
          if (!this.selectControl.value) return;
          this.control.setValue({ value: this.selectControl.value, regex: false, operator: value });
        }
      })
    );
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
