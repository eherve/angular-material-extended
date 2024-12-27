import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GetPipe } from '../../pipes/get.pipe';
import { IMongooseDatatableSearchCheckboxColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-checkbox-value',
  imports: [CommonModule, GetPipe, MatIconModule],
  templateUrl: './cell-checkbox-value.component.html',
  styleUrl: './cell-checkbox-value.component.scss',
})
export class CellCheckboxValueComponent {
  @Input()
  column!: IMongooseDatatableSearchCheckboxColumn;

  @Input()
  row: any;
}
