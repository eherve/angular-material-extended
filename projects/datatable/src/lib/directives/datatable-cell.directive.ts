/** @format */

import {
  Directive,
  Input,
  TemplateRef
} from '@angular/core';
@Directive({
  selector: '[ngxMatDatatableCell]',
})
export class NgxMatDatatableCellDirective {
  @Input('ngxMatDatatableCell')
  columnDef!: string;

  constructor(public templateRef: TemplateRef<any>) {}
}
