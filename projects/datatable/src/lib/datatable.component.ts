/** @format */

import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IntersectionObserverModule } from 'ngx-intersection-observer';
import { debounceTime, Subscription } from 'rxjs';
import { CellCheckboxValueComponent } from './components/cell-checkbox-value/cell-checkbox-value.component';
import { CellDateValueComponent } from './components/cell-date-value/cell-date-value.component';
import { CellSelectValueComponent } from './components/cell-select-value/cell-select-value.component';
import { HeaderAutocompleteFilterComponent } from './components/header-autocomplete-filter/header-autocomplete-filter.component';
import { HeaderCheckboxFilterComponent } from './components/header-checkbox-filter/header-checkbox-filter.component';
import { HeaderDateFilterComponent } from './components/header-date-filter/header-date-filter.component';
import { HeaderNumberFilterComponent } from './components/header-number-filter/header-number-filter.component';
import { HeaderSelectFilterComponent } from './components/header-select-filter/header-select-filter.component';
import { HeaderTextFilterComponent } from './components/header-text-filter/header-text-filter.component';
import { DatagridDataSource } from './datasource';
import { DatatableCellDirective } from './directives/datatable-cell.directive';
import { FindCellContentPipe } from './pipes/find-cell-content.pipe';
import { DatasourceRequestColumn, DatasourceRequestOrder } from './types/datasource-service.type';
import { DatatableColumn } from './types/datatable-column.type';
import { DatatableOptions } from './types/datatable-options.type';

type UpdateColumn = Pick<DatatableColumn, 'columnDef' | 'header' | 'sticky' | 'hidden'>;

@Component({
  imports: [
    CellCheckboxValueComponent,
    CellDateValueComponent,
    CellSelectValueComponent,
    CommonModule,
    DragDropModule,
    FindCellContentPipe,
    FormsModule,
    HeaderAutocompleteFilterComponent,
    HeaderCheckboxFilterComponent,
    HeaderDateFilterComponent,
    HeaderNumberFilterComponent,
    HeaderSelectFilterComponent,
    HeaderTextFilterComponent,
    IntersectionObserverModule,
    MatBadgeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  selector: 'ngx-mat-datatable',
  templateUrl: 'datatable.component.html',
  styleUrl: 'datatable.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }), // initial
        animate('0.2s', style({ opacity: 1 })), // final
      ]),
      transition(':leave', [
        style({ opacity: 1 }), // initial
        animate('0.2s', style({ opacity: 0 })), // final
      ]),
    ]),
  ],
})
export class MongooseDatatableComponent<Record = any> implements OnInit, OnDestroy {
  @Input('options')
  options!: DatatableOptions<Record>;

  @Output()
  onDisplayChanged = new EventEmitter<DatatableColumn[]>();

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  @ContentChildren(DatatableCellDirective)
  cellRefs?: QueryList<DatatableCellDirective>;

  displayedColumns: string[] = [];
  dataSource!: DatagridDataSource<Record>;
  loaded = false;

  searchFormGroup!: FormGroup;

  private subscriptions = new Subscription();
  private changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (!this.options?.service) throw new Error(`missing mongoose datatable component service`);
    if (!this.options?.columns) throw new Error(`missing mongoose datatable component columns`);
    this.buildDisplayColumns();
    this.buildSearchFormGroup();
    this.dataSource = new DatagridDataSource<Record>(this.options.service);
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  load(intersect: boolean) {
    if (!intersect || this.loaded) return;
    this.loaded = true;
    this.subscriptions.add(this.paginator?.page.subscribe(() => this.loadPage()));
    this.loadPage();
  }

  sortColumn(column: DatatableColumn) {
    if (column.sortable === false) return;
    if (!column.order) column.order = { index: this.options.columns.filter(c => !!c.order).length, dir: 'asc' };
    else if (column.order.dir === 'asc') column.order.dir = 'desc';
    else {
      delete column.order;
      this.consolidateOrderIndex();
    }
    this.paginator!.pageIndex = 0;
    this.loadPage();
  }

  loadPage() {
    const columns = this.buildRequestColumns();
    const order: DatasourceRequestOrder[] = [];
    this.options.columns
      .filter(c => !!c.order)
      .sort((c1, c2) => c1.order!.index - c2.order!.index)
      .forEach(c => {
        const index = columns.findIndex(column => column.data === (c.sortProperty || c.property));
        if (index !== -1) order.push({ column: index, dir: c.order!.dir });
      });
    this.dataSource.loadData({
      draw: Date.now().toString(),
      columns,
      start: this.paginator!.pageIndex,
      length: this.paginator!.pageSize,
      order,
    });
  }

  updateColumns: UpdateColumn[] = [];
  openUpdateColumnDisplay() {
    this.updateColumns = this.options.columns.map(column => ({
      columnDef: column.columnDef,
      header: column.header,
      sticky: column.sticky,
      hidden: column.hidden,
    }));
  }

  reorderColumns(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.updateColumns, event.previousIndex, event.currentIndex);
  }

  closeUpdateColumnDisplay() {
    let reload = false;
    this.updateColumns.forEach((updated, index) => {
      const columnIndex = this.options.columns.findIndex(c => c.columnDef === updated.columnDef);
      if (columnIndex == -1) return;
      if (columnIndex !== index) moveItemInArray(this.options.columns, index, columnIndex);
      const column = this.options.columns[columnIndex];
      if (updated.sticky !== column.sticky) column.sticky = updated.sticky;
      if (updated.hidden !== column.hidden) {
        column.hidden = updated.hidden;
        reload = reload || !updated.hidden;
      }
    });
    this.buildDisplayColumns();
    this.onDisplayChanged.emit(this.options.columns);
    if (reload) this.loadPage();
  }

  private buildRequestColumns(): DatasourceRequestColumn[] {
    const columns: DatasourceRequestColumn[] = [];
    const additionalColumns: DatasourceRequestColumn[] = [];
    this.options.columns.forEach(c => {
      if (c.hidden) return;
      const column: DatasourceRequestColumn = { data: c.property, name: c.columnDef };
      if (c.sortProperty && c.order) this.addAdditionalColumn(additionalColumns, c.sortProperty);
      if (c.searchable) {
        const control = this.searchFormGroup.controls[c.columnDef];
        if (control.value) {
          if (c.searchProperty) this.addAdditionalColumn(additionalColumns, c.searchProperty, control.value);
          else column.search = control.value;
        }
      }
      columns.push(column);
    });
    columns.push(...additionalColumns);
    return columns;
  }

  private addAdditionalColumn(additionalColumns: DatasourceRequestColumn[], data: string, search?: any) {
    let column = additionalColumns.find(c => c.data === data);
    if (!column) additionalColumns.push((column = { data }));
    if (search) column.search = search;
    return column;
  }

  private buildDisplayColumns() {
    const displayedColumns: string[] = [];
    this.options.columns.forEach(column => {
      if (column.hidden) return;
      displayedColumns.push(column.columnDef);
    });
    this.displayedColumns = displayedColumns;
  }

  private buildSearchFormGroup() {
    this.searchFormGroup = new FormGroup(
      this.options.columns.reduce((controls, column) => {
        if (column.searchable) {
          controls[column.columnDef] = new FormControl({ value: undefined, disabled: false });
        }
        return controls;
      }, {} as any)
    );
    this.subscriptions.add(
      this.searchFormGroup.valueChanges.pipe(debounceTime(500)).subscribe(value => {
        this.paginator!.pageIndex = 0;
        this.loadPage();
      })
    );
  }

  private consolidateOrderIndex() {
    let index = 0;
    this.options.columns
      .filter(c => !!c.order)
      .sort((c1, c2) => c1.order!.index - c2.order!.index)
      .forEach(c => (c.order!.index = index++));
  }
}
