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
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { IsArrayPipe } from '../../pipes/is-array.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { SelectOptionPipe } from '../../pipes/select-option.pipe';
import { DatatableSearchListOption, DatatableSearchSelectColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-header-select-filter',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
    SelectOptionPipe,
    SafeHtmlPipe,
    IsArrayPipe,
  ],
  templateUrl: './header-select-filter.component.html',
  styleUrl: './header-select-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => HeaderSelectFilterComponent),
    },
  ],
})
export class HeaderSelectFilterComponent<Record> implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  column!: DatatableSearchSelectColumn<Record>;

  options: DatatableSearchListOption[] = [];
  groups: { name: string; options: DatatableSearchListOption[] }[] = [];

  control!: FormControl<any>;
  selectControl = new FormControl();

  onChange = () => {};

  onTouched = () => {};

  private injector = inject(Injector);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private subsink = new Subscription();

  writeValue = (controlValue: any) => {
    if (controlValue?.value !== this.selectControl.value) {
      const value = controlValue?.value;
      if (value && !Array.isArray(value) && this.column.multiple) {
        this.selectControl.setValue([value]);
      } else this.selectControl.setValue(value);
    }
    this.changeDetectorRef.detectChanges();
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
        if (value === undefined) this.control.setValue(undefined);
        else this.control.setValue({ value, operator: this.column.multiple ? '$in' : undefined, regex: false });
      })
    );
    if (Array.isArray(this.column.options)) this.buildOptions(this.column.options);
    else this.subsink.add(this.column.options.subscribe(data => this.buildOptions(data)));
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }

  private buildOptions(data: DatatableSearchListOption[]) {
    data.forEach(d => {
      this.options.push(d);
      const name = d.group ?? '';
      const group = this.groups.find(g => g.name === name);
      if (!group) this.groups.push({ name, options: [d] });
      else group.options.push(d);
    });
  }
}
