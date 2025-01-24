/** @format */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GetPipe } from '../../pipes/get.pipe';
import { DatatableNumberColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-number-value',
  imports: [CommonModule, GetPipe, MatIconModule],
  templateUrl: './cell-number-value.component.html',
  styleUrl: './cell-number-value.component.scss',
})
export class CellNumberValueComponent {
  @Input()
  column!: DatatableNumberColumn;

  @Input()
  row: any;
}
