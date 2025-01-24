/** @format */

import { Directive, Input, TemplateRef } from '@angular/core';
@Directive({
  selector: '[ngxMatDatatableContent]',
})
export class NgxMatDatatableContentDirective {
  @Input('ngxMatDatatableContent')
  id!: string;

  constructor(public templateRef: TemplateRef<any>) {}
}
