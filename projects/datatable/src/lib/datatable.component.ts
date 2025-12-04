/** @format */

import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
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
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CountUpModule } from 'ngx-countup';
import { IntersectionObserverModule } from 'ngx-intersection-observer';
import * as rxjs from 'rxjs';
import * as XLSX from 'xlsx';
import { FacetOptionsOptions } from '../public-api';
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
import { OrderByPipe } from './pipes/order-by.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SortFacetEntriesPipe } from './pipes/sort-facet-entries.pipe';
import { ValueFunctionPipe } from './pipes/suffix-function.pipe';
import { SumPipe } from './pipes/sum.pipe';
import { TransformPipe } from './pipes/transform.pipe';
import { duration } from './tools/duration.tool';
import { get } from './tools/get.tool';
import { DatatableConfig } from './types/config.type';
import {
  NgxMatDatasourceRequestColumn,
  NgxMatDatasourceRequestOrder,
  NgxMatDatasourceResultFacet,
} from './types/datasource-service.type';
import { DatatableColumn, DatatableDurationColumn, DatatableSelectColumn } from './types/datatable-column.type';
import { NgxMatDatatableOptions } from './types/datatable-options.type';

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
    MatChipsModule,
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
    OrderByPipe,
    SortFacetEntriesPipe,
    ValueFunctionPipe,
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
  options!: NgxMatDatatableOptions<Record>;

  @Input()
  config?: DatatableConfig;

  @Output()
  rowClicked = new EventEmitter<Record>();

  @Output()
  configUpdated = new EventEmitter<DatatableConfig>();

  @Output()
  searchUpdated = new EventEmitter<any>();

  @Output()
  ready = new EventEmitter<NgxMatDatatableComponent>();

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  @ContentChildren(NgxMatDatatableContentDirective)
  contentRefs?: QueryList<NgxMatDatatableContentDirective>;

  displayedColumns: string[] = [];
  dataSource!: DatagridDataSource<Record>;
  loaded = false;

  searchFormGroup!: FormGroup;

  datatableIntl = inject(NgxMatDatatableIntl);

  private subscriptions = new rxjs.Subscription();
  private changeDetectorRef = inject(ChangeDetectorRef);

  get data(): Record[] | undefined {
    return this._data;
  }
  private _data?: Record[];

  @ViewChild('container') container?: ElementRef<HTMLDivElement>;
  @ViewChild('head') head?: ElementRef;
  @ViewChild(MatTable) matTable?: MatTable<any> & { _elementRef: { nativeElement: any } };
  observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
      const containerHeight = this.container?.nativeElement.clientHeight ?? 0;
      const containerWidth = this.container?.nativeElement.clientWidth ?? 0;
      const headerHeight = this.head?.nativeElement.clientHeight ?? 0;
      const headerWidth = this.head?.nativeElement.clientWidth ?? 0;
      const contentHeight = entry.contentRect.height;
      const contentWidth = entry.contentRect.width;

      this.tableContainerOverflowY = containerHeight - headerHeight - contentHeight < 0 ? 'auto' : 'inherit';
      this.tableContainerOverflowX = containerWidth - headerWidth - contentWidth < 0 ? 'auto' : 'inherit';
    });
  });
  @HostBinding('style.--datatable-container-overflow-y') tableContainerOverflowY = 'inherit';
  @HostBinding('style.--datatable-container-overflow-x') tableContainerOverflowX = 'inherit';

  async ngOnInit(): Promise<void> {
    if (!this.options?.service) throw new Error(`missing mongoose datatable component service`);
    if (!this.options?.columns) throw new Error(`missing mongoose datatable component columns`);
    await this.applyConfig();
    this.buildDisplayColumns();
    this.buildSearchFormGroup();
    this.dataSource = new DatagridDataSource<Record>(this.options.service);
    this.ready.emit(this);
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.matTable) this.observer.unobserve(this.matTable._elementRef.nativeElement);
    this.subscriptions.unsubscribe();
  }

  load(intersect: boolean) {
    if (!intersect || this.loaded) return;
    this.loaded = true;
    if (this.matTable) this.observer.observe(this.matTable?._elementRef.nativeElement);
    this.subscriptions.add(
      this.paginator?.page.subscribe(() => {
        this.updateConfig();
        this.loadPage();
      })
    );
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
    this.changeDetectorRef.detectChanges();
  }

  refreshColumns() {
    this.buildDisplayColumns();
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
          if (c.hidden || c.disabled) continue;
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
    if (Array.isArray(column.options)) {
      row[column.header] = column.options.find(option => option.value === value)?.name ?? value;
    } else {
      row[column.header] =
        (await rxjs.lastValueFrom(column.options)).find(option => option.value === value)?.name ?? value;
    }
  }

  private async buildExportDurationColumn(column: DatatableDurationColumn<Record>, row: any, value: any) {
    row[`${column.header} ms`] = value;
    row[column.header] = duration(value, column);
  }

  async loadPage() {
    if (!this.dataSource) return;
    const columns = this.buildRequestColumns();
    const order = this.buildOrder(columns);
    await this.dataSource.loadData({
      draw: Date.now().toString(),
      columns,
      start: this.paginator!.pageIndex,
      length: this.paginator!.pageSize,
      order,
      facets: this.options.facets,
    });
    this._data = this.dataSource.data;
  }

  private buildOrder(columns: NgxMatDatasourceRequestColumn[]): NgxMatDatasourceRequestOrder[] {
    const order: NgxMatDatasourceRequestOrder[] = [];
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
      if (columnIndex !== index) moveItemInArray(this.options.columns, columnIndex, index);
      const column = this.options.columns[index];
      if (updated.sticky !== column.sticky) column.sticky = updated.sticky;
      if (updated.hidden !== column.hidden) {
        column.hidden = updated.hidden;
        reload = reload || !updated.hidden;
      }
    });
    this.buildDisplayColumns();
    this.updateConfig();
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

  facetClick(
    column: DatatableColumn<Record> | undefined,
    result: NgxMatDatasourceResultFacet,
    option: FacetOptionsOptions
  ) {
    if (!column) return;
    const control = this.searchFormGroup?.controls[column.columnDef];
    if (!control) return;
    if (option && option.value !== control.value?.value) control.setValue({ value: option.value, name: option.name });
    else if (result._id !== control.value?.value) control.setValue({ value: result._id });
  }

  private buildRequestColumns(): NgxMatDatasourceRequestColumn[] {
    const columns: NgxMatDatasourceRequestColumn[] = [];
    const additionalColumns: NgxMatDatasourceRequestColumn[] = [];
    if (this.options.additionalProperties) {
      this.options.additionalProperties.forEach(property => this.addAdditionalColumn(additionalColumns, property));
    }
    this.options.columns.forEach(c => {
      if (c.hidden) return;
      const column: NgxMatDatasourceRequestColumn = {
        data: c.property,
        projection: c.projection,
        name: c.columnDef,
        searchable: c.searchable,
      };
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

  private addAdditionalColumn(additionalColumns: NgxMatDatasourceRequestColumn[], data: string, search?: any) {
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
      if (column.hidden || column.disabled) return;
      displayedColumns.push(column.columnDef);
      if (column.type && ['number', 'date', 'duration'].includes(column.type)) {
        if (!(column as any).locale) (column as any).locale = this.datatableIntl.locale;
      }
    });
    this.displayedColumns = displayedColumns;
  }

  private buildSearchFormGroup() {
    this.searchFormGroup = new FormGroup(
      this.options.columns.reduce(
        (controls, column) => {
          if (column.searchable) {
            const control = new FormControl({
              value: column.searchValue !== undefined ? { value: column.searchValue } : undefined,
              disabled: false,
            });
            controls[column.columnDef] = control;
            if (typeof column.searchUpdated === 'function') {
              this.subscriptions.add(
                control.valueChanges.pipe(rxjs.debounceTime(500)).subscribe(value => column.searchUpdated!(value))
              );
            }
          }
          return controls;
        },
        {} as { [columnDef: string]: FormControl }
      )
    );
    this.subscriptions.add(
      this.searchFormGroup.valueChanges.pipe(rxjs.debounceTime(500)).subscribe(value => {
        this.searchUpdated.next(value);
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

  private async applyConfig() {
    if (this.options?.configService?.get) {
      const config = await this.options.configService.get();
      this.config = config ?? this.config;
    }
    if (this.options?.columns && this.config?.columns) {
      this.config.columns.forEach((updated, index) => {
        const columnIndex = this.options.columns.findIndex(c => c.columnDef === updated.columnDef);
        if (columnIndex == -1) return;
        if (columnIndex !== index) moveItemInArray(this.options.columns, columnIndex, index);
        const column = this.options.columns[index];
        if (updated.sticky !== column.sticky) column.sticky = updated.sticky;
        if (updated.hidden !== column.hidden) column.hidden = updated.hidden;
      });
      this.buildDisplayColumns();
    }
    if (this.options && typeof this.config?.pageSizeOptionsIndex === 'number') {
      this.options.pageSizeOptionsIndex = this.config.pageSizeOptionsIndex;
    }
  }

  private updateConfig() {
    const pageSizeOptions = this.options.pageSizeOptions ?? [5, 10, 20, 50, 100];
    const pageSizeOptionsIndex = pageSizeOptions.indexOf(this.paginator?.pageSize ?? 0);
    const columns = this.options.columns.map(c => ({ columnDef: c.columnDef, sticky: c.sticky, hidden: c.hidden }));
    this.config = { columns, pageSizeOptionsIndex };
    this.configUpdated.next(this.config);
    if (this.options?.configService?.set) this.options.configService.set(this.config);
  }
}
