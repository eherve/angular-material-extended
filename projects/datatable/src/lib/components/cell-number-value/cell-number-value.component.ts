/** @format */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GetPipe } from '../../pipes/get.pipe';
import { TransformPipe } from '../../pipes/transform.pipe';
import { DatatableNumberColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-number-value',
  imports: [CommonModule, GetPipe, MatIconModule, TransformPipe],
  templateUrl: './cell-number-value.component.html',
  styleUrl: './cell-number-value.component.scss',
})
export class CellNumberValueComponent<Record> {
  @Input()
  column!: DatatableNumberColumn<Record>;

  @Input()
  row: any;
}
