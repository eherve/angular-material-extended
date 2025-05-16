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
  Injectable,
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
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CountUpModule } from 'ngx-countup';
import { IntersectionObserverModule } from 'ngx-intersection-observer';
import { debounceTime, lastValueFrom, Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { CellCheckboxValueComponent } from './components/cell-checkbox-value/cell-checkbox-value.component';
import { CellDateValueComponent } from './components/cell-date-value/cell-date-value.component';
import { CellDurationValueComponent } from './components/cell-duration-value/cell-duration-value.component';
import { CellNumberValueComponent } from './components/cell-number-value/cell-number-value.component';
import { CellSelectValueComponent } from './components/cell-select-value/cell-select-value.component';
import { HeaderAutocompleteFilterComponent } from './components/header-autocomplete-filter/header-autocomplete-filter.component';
import { HeaderCheckboxFilterComponent } from './components/header-checkbox-filter/header-checkbox-filter.component';
import { HeaderDateFilterComponent } from './components/header-date-filter/header-date-filter.component';
import { HeaderDurationFilterComponent } from './components/header-duration-filter/header-duration-filter.component';
import { HeaderNumberFilterComponent } from './components/header-number-filter/header-number-filter.component';
import { HeaderSelectFilterComponent } from './components/header-select-filter/header-select-filter.component';
import { HeaderTextFilterComponent } from './components/header-text-filter/header-text-filter.component';
import { ProgressSpinnerComponent } from './components/progress-spinner/progress-spinner.component';
import { DatagridDataSource } from './datasource';
import { NgxMatDatatableIntl } from './datatable.intl';
import { NgxMatDatatableContentDirective } from './directives/datatable-cell.directive';
import { BackgroundColorPipe } from './pipes/background-color.pipe';
import { ColorPipe } from './pipes/color.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { FindContentPipe } from './pipes/find-cell-content.pipe';
import { FindPipe } from './pipes/find.pipe';
import { GetPipe } from './pipes/get.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SortFacetEntriesPipe } from './pipes/sort-facet-entries.pipe';
import { SumPipe } from './pipes/sum.pipe';
import { TransformPipe } from './pipes/transform.pipe';
import { duration } from './tools/duration.tool';
import { get } from './tools/get.tool';
import {
  DatasourceRequestColumn,
  DatasourceRequestOrder,
  DatasourceResultFacet,
} from './types/datasource-service.type';
import { DatatableColumn, DatatableDurationColumn, DatatableSelectColumn } from './types/datatable-column.type';
import { DatatableOptions } from './types/datatable-options.type';

@Injectable()
class NgxMatDatatablePaginatorIntl extends MatPaginatorIntl {
  private datatableIntl = inject(NgxMatDatatableIntl);

  override itemsPerPageLabel = this.datatableIntl.itemsPerPageLabel;
  override nextPageLabel = this.datatableIntl.nextPageLabel;
  override lastPageLabel = this.datatableIntl.lastPageLabel;
  override previousPageLabel = this.datatableIntl.previousPageLabel;
  override firstPageLabel = this.datatableIntl.firstPageLabel;
  onLabel = this.datatableIntl.onLabel;

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    return this.datatableIntl.getRangeLabel(page, pageSize, length);
  };
}

type UpdateColumn<Record> = Pick<DatatableColumn<Record>, 'columnDef' | 'header' | 'sticky' | 'hidden'>;

@Component({
  imports: [
    CellCheckboxValueComponent,
    CellDateValueComponent,
    CellDurationValueComponent,
    CellNumberValueComponent,
    CellSelectValueComponent,
    ColorPipe,
    CommonModule,
    TransformPipe,
    DragDropModule,
    FindContentPipe,
    FormsModule,
    GetPipe,
    HeaderAutocompleteFilterComponent,
    HeaderCheckboxFilterComponent,
    HeaderDateFilterComponent,
    HeaderDurationFilterComponent,
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
    ReactiveFormsModule,
    SafeHtmlPipe,
    MatTooltipModule,
    BackgroundColorPipe,
    FilterPipe,
    SumPipe,
    MatCardModule,
    CountUpModule,
    ProgressSpinnerComponent,
    FindPipe,
    SortFacetEntriesPipe,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: NgxMatDatatablePaginatorIntl }],
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
export class NgxMatDatatableComponent<Record = any> implements OnInit, OnDestroy {
  @Input('options')
  options!: DatatableOptions<Record>;

  @Output()
  onDisplayChanged = new EventEmitter<DatatableColumn<Record>[]>();

  @Output()
  rowClicked = new EventEmitter<Record>();

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  @ContentChildren(NgxMatDatatableContentDirective)
  contentRefs?: QueryList<NgxMatDatatableContentDirective>;

  displayedColumns: string[] = [];
  dataSource!: DatagridDataSource<Record>;
  loaded = false;

  searchFormGroup!: FormGroup;

  datatableIntl = inject(NgxMatDatatableIntl);

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

  sortColumn(column: DatatableColumn<Record>) {
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

  redraw(match?: (record: Record) => boolean) {
    this.dataSource.redraw(match);
  }

  exporting = false;
  async export() {
    this.exporting = true;
    try {
      const columns = this.buildRequestColumns();
      const order = this.buildOrder(columns);
      const max = Math.min(Math.floor(5 / this.dataSource.rowSize), this.dataSource.recordsFiltered);
      const chunks = [];
      for (let i = 0; i < Math.ceil(this.dataSource.recordsFiltered / max); ++i) {
        chunks.push({ start: i, length: max });
      }

      const data = (
        await Promise.all(
          chunks.map(c =>
            this.options.service({ draw: Date.now().toString(), columns, order, start: c.start, length: c.length })
          )
        )
      ).reduce((pv, cv) => (pv.push(...cv.data), pv), [] as any[]);
      const rows: any[] = [];
      for (let d of data) {
        const row: any = {};
        for (let c of this.options.columns) {
          if (c.hidden) continue;
          let value = get(d, c.property);
          if (c.export) c.export(row, value, d);
          else {
            if ((c as any).transform) value = (c as any).transform(value, d);
            switch (c.type) {
              case 'select':
                this.buildExportSelectColumn(c as any, row, value);
                break;
              case 'duration':
                this.buildExportDurationColumn(c as any, row, value);
                break;
              default:
                row[c.header] = value;
            }
          }
        }
        rows.push(row);
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'export');
      const filename = typeof this.options.actions?.export === 'string' ? this.options.actions.export : 'export';
      await XLSX.writeFile(workbook, `${filename}-${Date.now()}.xlsx`);
    } finally {
      this.exporting = false;
    }
  }

  private async buildExportSelectColumn(column: DatatableSelectColumn<Record>, row: any, value: any) {
    row[column.header] = (await lastValueFrom(column.options)).find(option => option.value === value)?.name ?? value;
  }

  private async buildExportDurationColumn(column: DatatableDurationColumn<Record>, row: any, value: any) {
    row[`${column.header} ms`] = value;
    row[column.header] = duration(value, column);
  }

  loadPage() {
    const columns = this.buildRequestColumns();
    const order = this.buildOrder(columns);
    this.dataSource.loadData({
      draw: Date.now().toString(),
      columns,
      start: this.paginator!.pageIndex,
      length: this.paginator!.pageSize,
      order,
      facets: this.options.facets,
    });
  }

  private buildOrder(columns: DatasourceRequestColumn[]): DatasourceRequestOrder[] {
    const order: DatasourceRequestOrder[] = [];
    this.options.columns
      .filter(c => !!c.order)
      .sort((c1, c2) => c1.order!.index - c2.order!.index)
      .forEach(c => {
        const index = columns.findIndex(column => column.data === (c.sortProperty || c.property));
        if (index !== -1) order.push({ column: index, dir: c.order!.dir });
      });
    return order;
  }

  updateColumns: UpdateColumn<Record>[] = [];
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

  rowClick(row: Record) {
    if (typeof this.options.actions?.rowClick === 'boolean') {
      this.rowClicked.emit(row);
    } else if (typeof this.options.actions?.rowClick === 'function') {
      this.options.actions.rowClick(row);
      this.rowClicked.emit(row);
    }
  }

  facetClick(column: DatatableColumn<Record> | undefined, result: DatasourceResultFacet) {
    if (!column) return;
    const control = this.searchFormGroup?.controls[column.columnDef];
    if (!control) return;
    if (result._id !== control.value?.value) control.setValue({ value: result._id });
  }

  private buildRequestColumns(): DatasourceRequestColumn[] {
    const columns: DatasourceRequestColumn[] = [];
    const additionalColumns: DatasourceRequestColumn[] = [];
    this.options.columns.forEach(c => {
      if (c.hidden) return;
      const column: DatasourceRequestColumn = { data: c.property, name: c.columnDef, searchable: c.searchable };
      if (c.sortProperty && c.order) this.addAdditionalColumn(additionalColumns, c.sortProperty);
      if (c.searchable) {
        const control = this.searchFormGroup.controls[c.columnDef];
        if (control.value) {
          if (c.searchProperty) this.addAdditionalColumn(additionalColumns, c.searchProperty, control.value);
          else column.search = control.value;
        }
      }
      if (c.additionalProperties) {
        c.additionalProperties.forEach(property => this.addAdditionalColumn(additionalColumns, property));
      }
      columns.push(column);
    });
    for (let additionalColumn of additionalColumns) {
      const c = columns.find(c => c.data === additionalColumn.data);
      if (!c) columns.push(additionalColumn);
      else if (additionalColumn.search && !c.search) c.search = additionalColumn.search;
    }
    return columns;
  }

  private addAdditionalColumn(additionalColumns: DatasourceRequestColumn[], data: string, search?: any) {
    let column = additionalColumns.find(c => c.data === data);
    if (!column) additionalColumns.push((column = { data }));
    if (search) {
      column.search = search;
      column.searchable = true;
    }
    return column;
  }

  private buildDisplayColumns() {
    const displayedColumns: string[] = [];
    this.options.columns.forEach(column => {
      if (column.hidden) return;
      displayedColumns.push(column.columnDef);
      if (column.type && ['number', 'date', 'duration'].includes(column.type)) {
        if (!(column as any).locale) (column as any).locale = this.datatableIntl.locale;
      }
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
