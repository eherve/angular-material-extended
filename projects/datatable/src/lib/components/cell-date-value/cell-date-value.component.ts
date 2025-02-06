/** @format */

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MomentFormatPipe } from '../../pipes/moment-format.pipe';
import { duration } from '../../tools/duration.tool';
import { get } from '../../tools/get.tool';
import { DatatableDateColumn, DatatableValueColumn } from '../../types/datatable-column.type';

@Component({
  selector: 'lib-cell-date-value',
  imports: [CommonModule, MatIconModule, MomentFormatPipe],
  templateUrl: './cell-date-value.component.html',
  styleUrl: './cell-date-value.component.scss',
})
export class CellDateValueComponent<Record> implements OnInit, OnDestroy {
  private changeDetectorRef = inject(ChangeDetectorRef);

  @Input()
  column!: DatatableDateColumn<Record>;

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

  private refreshInterval: any;
  ngOnInit(): void {
    if (this.column.durationRefreshTime) {
      this.refreshInterval = setInterval(() => {
        this.duration = duration(this.value, this.column);
        this.changeDetectorRef.detectChanges();
      }, this.column.durationRefreshTime);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
}
