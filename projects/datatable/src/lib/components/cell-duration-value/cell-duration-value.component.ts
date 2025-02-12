/** @format */

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { duration } from '../../tools/duration.tool';
import { get } from '../../tools/get.tool';
import { DatatableDurationColumn, DatatableValueColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-duration-value',
  imports: [CommonModule, MatIconModule],
  templateUrl: './cell-duration-value.component.html',
  styleUrl: './cell-duration-value.component.scss',
})
export class CellDurationValueComponent<Record> {
  @Input()
  column!: DatatableDurationColumn<Record>;

  @Input('row')
  set setRow(row: any) {
    this.row = row;
    this.value = get(this.row, this.column.property);
    if (typeof (this.column as DatatableValueColumn<Record>).transform === 'function') {
      this.value = (this.column as DatatableValueColumn<Record>).transform!(this.value, this.row);
    }
    this.duration = duration(this.value, this.column);
  }
  row: any;

  value?: any;
  duration?: string | null;
}
