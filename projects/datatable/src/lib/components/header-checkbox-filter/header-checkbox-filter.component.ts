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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { filter, Subscription, tap } from 'rxjs';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { DatatableSearchCheckboxColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-header-checkbox-filter',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    SafeHtmlPipe,
  ],
  templateUrl: './header-checkbox-filter.component.html',
  styleUrl: './header-checkbox-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => HeaderCheckboxFilterComponent),
    },
  ],
})
export class HeaderCheckboxFilterComponent<Record> implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  column!: DatatableSearchCheckboxColumn<Record>;

  control!: FormControl<any>;
  selectControl = new FormControl();

  onChange: (value: any) => void = () => {};

  onTouched: () => void = () => {};

  private injector = inject(Injector);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private previousValue: boolean | undefined;
  private subsink = new Subscription();

  writeValue(value: any): void {
    const nextValue = value?.value;
    this.previousValue = nextValue;
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
    this.previousValue = this.control.value?.value;
    this.subsink.add(
      this.selectControl.valueChanges
        .pipe(
          filter(value => {
            if (value === true && this.previousValue === false) {
              this.selectControl.setValue(undefined, { emitEvent: false });
              this.previousValue = undefined;
              this.onChange(undefined);
              return false;
            }
            return true;
          }),
          tap(value => (this.previousValue = value)),
        )
        .subscribe((value: any) => {
          if (value === undefined) this.onChange(undefined);
          else this.onChange({ value, regex: false });
        }),
    );
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
