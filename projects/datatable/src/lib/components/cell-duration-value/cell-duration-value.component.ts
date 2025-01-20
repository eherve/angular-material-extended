/** @format */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DurationPipe } from '../../pipes/duration.pipe';
import { GetPipe } from '../../pipes/get.pipe';
import { DatatableDurationColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-duration-value',
  imports: [CommonModule, GetPipe, MatIconModule, DurationPipe],
  templateUrl: './cell-duration-value.component.html',
  styleUrl: './cell-duration-value.component.scss',
})
export class CellDurationValueComponent {
  @Input()
  column!: DatatableDurationColumn;

  @Input()
  row: any;
}
