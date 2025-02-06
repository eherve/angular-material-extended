/** @format */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DatatableDurationColumn } from '../../types/datatable-column.type';
import { TransformPipe } from '../../pipes/transform.pipe';
import { DurationPipe } from '../../pipes/duration.pipe';
import { GetPipe } from '../../pipes/get.pipe';

@Component({
  selector: 'lib-cell-duration-value',
  imports: [CommonModule, MatIconModule, TransformPipe, DurationPipe, GetPipe],
  templateUrl: './cell-duration-value.component.html',
  styleUrl: './cell-duration-value.component.scss',
})
export class CellDurationValueComponent<Record> {
  @Input()
  column!: DatatableDurationColumn<Record>;

  @Input()
  row: any;
}
