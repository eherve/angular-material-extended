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
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { NgxMatDatatableIntl } from '../../datatable.intl';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { DatatableSearchNumberColumn } from '../../types/datatable-column.type';
import { OperatorSelectComponent } from '../operator-select/operator-select.component';

@Component({
  selector: 'lib-header-number-filter',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    ReactiveFormsModule,
    OperatorSelectComponent,
    SafeHtmlPipe,
  ],
  templateUrl: './header-number-filter.component.html',
  styleUrl: './header-number-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => HeaderNumberFilterComponent),
    },
  ],
})
export class HeaderNumberFilterComponent<Record> implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  column!: DatatableSearchNumberColumn<Record>;

  control!: FormControl<any>;
  selectControl = new FormControl();
  operatorControl = new FormControl('=');

  onChange: (value: any) => void = () => {};

  onTouched: () => void = () => {};

  datatableIntl = inject(NgxMatDatatableIntl);

  private injector = inject(Injector);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private subsink = new Subscription();

  writeValue(value: any): void {
    if (value?.operator && value.operator !== this.operatorControl.value) {
      this.operatorControl.setValue(value.operator, { emitEvent: false });
    }
    if (value?.value !== this.selectControl.value) this.selectControl.setValue(value?.value, { emitEvent: false });
    this.changeDetectorRef.markForCheck();
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.selectControl.disable({ emitEvent: false });
      this.operatorControl.disable({ emitEvent: false });
    } else {
      this.selectControl.enable({ emitEvent: false });
      this.operatorControl.enable({ emitEvent: false });
    }
  }

  registerOnChange(onChange: (value: any) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  async ngAfterViewInit(): Promise<void> {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (!ngControl) throw new Error(`${this.constructor.name} missing control [column:${this.column.columnDef}]`);
    this.control = ngControl.control as UntypedFormControl;
    this.subsink.add(
      this.selectControl.valueChanges.subscribe((value: any) => {
        if (this.control.invalid) return;
        else if (this.isEmptyValue(value)) this.onChange(undefined);
        else this.onChange({ value, regex: false, operator: this.operatorControl.value });
      }),
    );
    this.subsink.add(
      this.operatorControl.valueChanges.subscribe((value: any) => {
        if (this.isEmptyValue(this.selectControl.value)) return;
        this.onChange({ value: this.selectControl.value, regex: false, operator: value });
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
