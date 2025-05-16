/** @format */

import { CommonModule } from '@angular/common';
import { Component, HostBinding, inject, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CountUpModule } from 'ngx-countup';
import { IntersectionObserverModule } from 'ngx-intersection-observer';
import { NgxMatDatatableIntl } from '../../datatable.intl';
import { MergePipe } from '../../pipes/merge.pipe';

@Component({
  selector: 'lib-progress-spinner',
  imports: [CommonModule, MatProgressSpinnerModule, IntersectionObserverModule, CountUpModule, MergePipe],
  templateUrl: './progress-spinner.component.html',
  styleUrl: './progress-spinner.component.scss',
})
export class ProgressSpinnerComponent {
  datatableIntl = inject(NgxMatDatatableIntl);

  @Input()
  diameter: number = 100;

  @Input('value')
  set setValue(value: number | string) {
    if (typeof value === 'string') this._value = parseFloat(value);
    else this._value = value;
    if (this.animateInView) this.load(this.isInView);
  }
  private _value: number = 0;
  value: number = 0;

  @Input()
  color?: string;

  @Input('displayValue')
  set setDisplayValue(displayValue: any) {
    this.displayValue = displayValue !== false;
  }
  displayValue = true;

  @HostBinding('style.--progress-spinner-color') get getColor() {
    return this.color;
  }

  @Input()
  fontSize: string = `${this.diameter / 5}px`;

  @Input('animateInView')
  set setAnimateInView(animateInView: any) {
    this.animateInView = animateInView !== false;
  }
  animateInView = true;

  @Input('delay')
  set setDelay(delay: number | string) {
    if (typeof delay === 'string') this.delay = parseInt(delay);
    else this.delay = delay;
  }
  delay?: number;

  private isInView: boolean = false;
  protected load(intersect: boolean) {
    this.isInView = intersect;
    if (this.isInView) {
      if (this.delay) setTimeout(() => (this.value = this._value), this.delay);
      else this.value = this._value;
    }
  }
}
