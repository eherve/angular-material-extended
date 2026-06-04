/** @format */

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
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
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, Subscription } from 'rxjs';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { DatatableSearchDurationColumn } from '../../types/datatable-column.type';
import { OPERATOR, OperatorSelectComponent } from '../operator-select/operator-select.component';
import { TIME_UNIT, TimeUnitSelectComponent } from '../time-unit-select/time-unit-select.component';

@Component({
  selector: 'lib-header-duration-filter',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    OperatorSelectComponent,
    TimeUnitSelectComponent,
    SafeHtmlPipe,
  ],
  templateUrl: './header-duration-filter.component.html',
  styleUrl: './header-duration-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => HeaderDurationFilterComponent),
    },
  ],
})
export class HeaderDurationFilterComponent<Record> implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  column!: DatatableSearchDurationColumn<Record>;

  control!: FormControl<any>;
  selectControl = new FormControl<number | undefined>(undefined);
  rangeGroup = new FormGroup({
    start: new FormControl<number | undefined>(undefined, Validators.required),
    end: new FormControl<number | undefined>(undefined, Validators.required),
  });
  operatorControl = new FormControl<OPERATOR>('=');
  timeUnitControl = new FormControl<TIME_UNIT>('second');

  onChange: (value: any) => void = () => {};

  onTouched: () => void = () => {};

  private injector = inject(Injector);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private subsink = new Subscription();

  writeValue(value: any): void {
    if (value?.unitOfTime) this.timeUnitControl.setValue(value.unitOfTime, { emitEvent: false });
    if (value?.operator) this.operatorControl.setValue(value.operator, { emitEvent: false });
    if (value?.value !== null && value?.value !== undefined) {
      let selectValue = TimeUnitSelectComponent.convert(value.value, this.timeUnitControl.value!);
      if (this.selectControl.value !== selectValue) this.selectControl.setValue(selectValue, { emitEvent: false });
    } else this.selectControl.setValue(null, { emitEvent: false });
    this.changeDetectorRef.markForCheck();
  }

  setDisabledState(isDisabled: boolean): void {
    const controls = [this.selectControl, this.operatorControl, this.timeUnitControl];
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

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (!ngControl) throw new Error(`${this.constructor.name} missing control [column:${this.column.columnDef}]`);
    this.control = ngControl.control as UntypedFormControl;
    this.subsink.add(
      this.selectControl.valueChanges.pipe(debounceTime(500)).subscribe(value => {
        if (this.control.invalid) return;
        else if (this.isEmptyValue(value)) this.onChange(undefined);
        else {
          const unitOfTimeValue = value as number;
          this.onChange({
            unitOfTimeValue,
            value: TimeUnitSelectComponent.toMilliseconds(unitOfTimeValue, this.timeUnitControl.value!),
            regex: false,
            operator: this.operatorControl.value,
            unitOfTime: this.timeUnitControl.value,
          });
        }
      }),
    );
    this.subsink.add(
      this.operatorControl.valueChanges.subscribe((value: any) => {
        if (this.isEmptyValue(this.selectControl.value)) return;
        const unitOfTimeValue = this.selectControl.value as number;
        this.onChange({
          unitOfTimeValue,
          value: TimeUnitSelectComponent.toMilliseconds(unitOfTimeValue, this.timeUnitControl.value!),
          regex: false,
          operator: value,
          unitOfTime: this.timeUnitControl.value,
        });
      }),
    );
    this.subsink.add(
      this.timeUnitControl.valueChanges.subscribe((value: any) => {
        if (this.isEmptyValue(this.selectControl.value) || !this.control.value?.unitOfTime) return;
        const unitOfTimeValue = TimeUnitSelectComponent.convert(
          this.selectControl.value as number,
          this.control.value.unitOfTime,
          value,
        );
        this.selectControl.setValue(unitOfTimeValue, { emitEvent: false });
        this.onChange({
          unitOfTimeValue,
          value: TimeUnitSelectComponent.toMilliseconds(unitOfTimeValue, value),
          regex: false,
          operator: this.operatorControl.value,
          unitOfTime: value,
        });
      }),
    );
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }

  private isEmptyValue(value: any): boolean {
    return value === null || value === undefined || value === '';
  }
}
