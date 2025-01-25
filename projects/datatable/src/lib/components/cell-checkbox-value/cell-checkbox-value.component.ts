/** @format */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GetPipe } from '../../pipes/get.pipe';
import { TransformPipe } from '../../pipes/transform.pipe';
import { DatatableCheckboxColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-checkbox-value',
  imports: [CommonModule, GetPipe, MatIconModule, TransformPipe],
  templateUrl: './cell-checkbox-value.component.html',
  styleUrl: './cell-checkbox-value.component.scss',
})
export class CellCheckboxValueComponent<Record> {
  @Input()
  column!: DatatableCheckboxColumn<Record>;

  @Input()
  row: any;
}
