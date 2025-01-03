/** @format */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GetPipe } from '../../pipes/get.pipe';
import { MongooseDatatableDateColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-date-value',
  imports: [CommonModule, GetPipe, MatIconModule],
  templateUrl: './cell-date-value.component.html',
  styleUrl: './cell-date-value.component.scss',
})
export class CellDateValueComponent {
  @Input()
  column!: MongooseDatatableDateColumn;

  @Input()
  row: any;
}
