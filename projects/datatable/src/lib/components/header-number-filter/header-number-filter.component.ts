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
  OnDestroy
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
export class HeaderNumberFilterComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  column!: DatatableSearchNumberColumn;

  control!: FormControl<any>;
  selectControl = new FormControl();
  operatorControl = new FormControl('=');

  onChange = () => {};

  onTouched = () => {};

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

  async ngAfterViewInit(): Promise<void> {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (!ngControl) throw new Error(`${this.constructor.name} missing control [column:${this.column.columnDef}]`);
    this.control = ngControl.control as UntypedFormControl;
    this.subsink.add(
      this.selectControl.valueChanges.subscribe((value: any) => {
        if (!value) this.control.setValue(undefined);
        else this.control.setValue({ value, regex: false, operator: this.operatorControl.value });
      })
    );
    this.subsink.add(
      this.operatorControl.valueChanges.subscribe((value: any) => {
        if (this.control.value === null || this.control.value === undefined) return;
        this.control.setValue({ value: this.selectControl.value, regex: false, operator: value });
      })
    );
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
