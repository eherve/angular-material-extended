/** @format */

import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { GetPipe } from '../../pipes/get.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { SelectOptionPipe } from '../../pipes/select-option.pipe';
import { TransformPipe } from '../../pipes/transform.pipe';
import { DatatableSearchListOption, DatatableSelectColumn } from '../../types/datatable-column.type';
import { IsArrayPipe } from '../../pipes/is-array.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-cell-select-value',
  imports: [CommonModule, SelectOptionPipe, GetPipe, IsArrayPipe, MatIconModule, MatLabel, TransformPipe, SafeHtmlPipe],
  templateUrl: './cell-select-value.component.html',
  styleUrl: './cell-select-value.component.scss',
})
export class CellSelectValueComponent<Record> implements OnInit, OnDestroy {
  @Input()
  column!: DatatableSelectColumn<Record>;

  @Input()
  row: any;

  options: DatatableSearchListOption[] = [];

  private subsink = new Subscription();

  ngOnInit(): void {
    if (Array.isArray(this.column.options)) this.options = this.column.options;
    else {
      this.subsink.add(this.column.options.subscribe(options => (this.options = options)));
    }
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
