/** @format */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DurationPipe } from '../../pipes/duration.pipe';
import { GetPipe } from '../../pipes/get.pipe';
import { MomentFormatPipe } from '../../pipes/moment-format.pipe';
import { TransformPipe } from '../../pipes/transform.pipe';
import { DatatableDateColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-date-value',
  imports: [CommonModule, GetPipe, MatIconModule, MomentFormatPipe, DurationPipe, TransformPipe],
  templateUrl: './cell-date-value.component.html',
  styleUrl: './cell-date-value.component.scss',
})
export class CellDateValueComponent<Record> {
  @Input()
  column!: DatatableDateColumn<Record>;

  @Input()
  row: any;
}
