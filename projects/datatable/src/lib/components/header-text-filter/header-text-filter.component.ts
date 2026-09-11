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
import { Subscription } from 'rxjs';
import { NgxMatDatatableIntl } from '../../datatable.intl';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { DatatableSearchTextColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-header-text-filter',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    SafeHtmlPipe,
  ],
  templateUrl: './header-text-filter.component.html',
  styleUrl: './header-text-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => HeaderTextFilterComponent),
    },
  ],
})
export class HeaderTextFilterComponent<Record> implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  column!: DatatableSearchTextColumn<Record>;

  control!: FormControl<any>;
  selectControl = new FormControl();

  onChange: (value: any) => void = () => {};

  onTouched: () => void = () => {};

  datatableIntl = inject(NgxMatDatatableIntl);

  private injector = inject(Injector);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private subsink = new Subscription();

  writeValue(value: any): void {
    const nextValue = value?.value ?? '';
    if (nextValue !== this.selectControl.value) this.selectControl.setValue(nextValue, { emitEvent: false });
    this.changeDetectorRef.markForCheck();
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) this.selectControl.disable({ emitEvent: false });
    else this.selectControl.enable({ emitEvent: false });
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
        if (this.isEmptyValue(value)) this.onChange(undefined);
        else {
          if (this.column.regex) this.onChange({ value, regex: true });
          else this.onChange({ value: this.escapeRegExp(value), regex: true });
        }
      }),
    );
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }

  private escapeRegExp(value: string): string {
    if (!value) return '';
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private isEmptyValue(value: any): boolean {
    return value === null || value === undefined || value === '';
  }
}
