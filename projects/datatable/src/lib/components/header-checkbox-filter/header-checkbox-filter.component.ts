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
    let previousValue = this.control.value;
    this.subsink.add(
      this.selectControl.valueChanges
        .pipe(
          filter(value => {
            if (value === true && previousValue === false) {
              this.selectControl.setValue(undefined);
              return false;
            }
            return true;
          }),
          tap(value => (previousValue = value))
        )
        .subscribe((value: any) => {
          if (value === undefined) this.control.setValue(undefined);
          else this.control.setValue({ value, regex: false });
        })
    );
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
