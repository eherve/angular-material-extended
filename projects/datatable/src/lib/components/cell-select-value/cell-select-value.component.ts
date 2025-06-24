/** @format */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { GetPipe } from '../../pipes/get.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { SelectOptionPipe } from '../../pipes/select-option.pipe';
import { TransformPipe } from '../../pipes/transform.pipe';
import { DatatableSelectColumn } from '../../types/datatable-column.type';
import { IsArrayPipe } from '../../pipes/is-array.pipe';

@Component({
  selector: 'lib-cell-select-value',
  imports: [CommonModule, SelectOptionPipe, GetPipe, IsArrayPipe, MatIconModule, MatLabel, TransformPipe, SafeHtmlPipe],
  templateUrl: './cell-select-value.component.html',
  styleUrl: './cell-select-value.component.scss',
})
export class CellSelectValueComponent<Record> {
  @Input()
  column!: DatatableSelectColumn<Record>;

  @Input()
  row: any;
}
