/** @format */

import { animate, style, transition, trigger } from '@angular/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, forwardRef, inject, Injector, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type OPERATOR = '=' | '>' | '≥' | '<' | '≤' | '<>' | '≤≥';
const OPERATORS: OPERATOR[] = ['=', '>', '≥', '<', '≤', '<>', '≤≥'];

@Component({
  selector: 'lib-operator-select',
  imports: [CommonModule, OverlayModule, MatIconModule, MatButtonModule],
  templateUrl: './operator-select.component.html',
  styleUrl: './operator-select.component.scss',
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
      useExisting: forwardRef(() => OperatorSelectComponent),
    },
  ],
})
export class OperatorSelectComponent implements AfterViewInit, ControlValueAccessor {
  @Input('disableRange')
  set setDisableRange(disableRange: any) {
    this.disableRange = disableRange !== false;
    if (this.disableRange) this.operators = OPERATORS.slice(0, 5);
    else this.operators = OPERATORS;
  }
  disableRange = false;

  operators = OPERATORS;
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

  async ngAfterViewInit(): Promise<void> {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (!ngControl) throw new Error(`${this.constructor.name} missing control`);
    this.control = ngControl.control as UntypedFormControl;
    this.changeDetectorRef.detectChanges();
  }
}
