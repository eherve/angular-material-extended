import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { GetPipe } from '../../pipes/get.pipe';
import { SelectOptionPipe } from '../../pipes/select-option.pipe';
import { MongooseDatatableSearchSelectColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-select-value',
  imports: [CommonModule, SelectOptionPipe, GetPipe, MatIconModule, MatLabel],
  templateUrl: './cell-select-value.component.html',
  styleUrl: './cell-select-value.component.scss',
})
export class CellSelectValueComponent {
  @Input()
  column!: MongooseDatatableSearchSelectColumn;

  @Input()
  row: any;
}
