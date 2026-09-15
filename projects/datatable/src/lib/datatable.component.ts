/** @format */

import { animate, state, style, transition, trigger } from '@angular/animations';
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
import moment from 'moment';
import * as rxjs from 'rxjs';
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
import { NGX_MAT_DATATABLE_DEFAULT_OPTIONS } from './datatable-default-options';
import { NgxMatDatatableIntl } from './datatable.intl';
import { NgxMatDatatableContentDirective } from './directives/datatable-cell.directive';
import {
  DatatableRowViewportDirective,
  DatatableRowViewportObserverService,
} from './directives/datatable-row-viewport.directive';
import { BackgroundColorPipe } from './pipes/background-color.pipe';
import { CellColorPipe } from './pipes/cell-color.pipe';
import { CellOpacityPipe } from './pipes/cell-opacity.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { FindContentPipe } from './pipes/find-cell-content.pipe';
import { FindPipe } from './pipes/find.pipe';
import { GetPipe } from './pipes/get.pipe';
import { IncludedInPipe } from './pipes/included-in.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SelectOptionsCacheService } from './select-options-cache.service';
import { SortFacetEntriesPipe } from './pipes/sort-facet-entries.pipe';
import { ValueFunctionPipe } from './pipes/suffix-function.pipe';
import { SumPipe } from './pipes/sum.pipe';
import { TransformPipe } from './pipes/transform.pipe';
import { buildDatasourceRequestOptions } from './tools/datasource-request.tool';
import { exportDatatable } from './tools/datatable-export.tool';
import { get } from './tools/get.tool';
import { DatatableConfig } from './types/config.type';
import { NgxMatDatasourceResultFacet } from './types/datasource-service.type';
import { DatatableColumn } from './types/datatable-column.type';
import { FacetOptionsOptions } from './types/datatable-facet.type';
import {
  NgxMatDatatableIncrementalOptions,
  NgxMatDatatableIncrementalTrigger,
  NgxMatDatatableLoadMode,
  NgxMatDatatableOptions,
} from './types/datatable-options.type';
import { NgxMatDatatableState } from './types/datatable-state.type';

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
    CellColorPipe,
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
    IncludedInPipe,
    CellOpacityPipe,
    DatatableRowViewportDirective,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: NgxMatDatatablePaginatorIntl },
    SelectOptionsCacheService,
    DatatableRowViewportObserverService,
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
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
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
  visibleColumnsColspan = 1;
  disabledRows: Record[] = [];
  protected renderedRows = new Set<Record>();

  dataSource!: DatagridDataSource<Record>;

  expandedRow: any | null = null;

  loaded = false;

  datatableIntl = inject(NgxMatDatatableIntl);

  loadMode: NgxMatDatatableLoadMode = 'pagination';
  incrementalTrigger: NgxMatDatatableIncrementalTrigger = 'inView';
  incrementalPageSize = 30;
  incrementalPageIndex = 0;
  displayedRecordsCount = 0;
  totalRecordsCount = 0;
  hasMoreRecords = false;
  loadingNextRecords = false;
  showRecordsCount = true;
  incrementalLoadingLabel = this.datatableIntl.incrementalLoadingLabel;
  incrementalLoadMoreLabel = this.datatableIntl.incrementalLoadMoreLabel;
  incrementalRowColumns = ['_incrementalLoad'];
  showIncrementalRow = false;
  showIncrementalInViewTrigger = false;
  showIncrementalButtonTrigger = false;
  paginationPageSizeOptions: number[] = [];
  paginationPageSize = 30;
  paginationPageIndex = 0;

  searchFormGroup!: FormGroup;
  protected searchControlNames: { [columnDef: string]: string } = {};

  private subscriptions = new rxjs.Subscription();
  private changeDetectorRef = inject(ChangeDetectorRef);
  private defaultOptions = inject(NGX_MAT_DATATABLE_DEFAULT_OPTIONS);
  private incrementalLoadToken = 0;
  private restoredState?: NgxMatDatatableState;
  private rowRenderChangeScheduled = false;
  private destroyed = false;

  get data(): Record[] | undefined {
    return this._data;
  }
  private _data?: Record[];

  @ViewChild('container') container?: ElementRef<HTMLDivElement>;
  @ViewChild('head') head?: ElementRef;
  @ViewChild('table', { read: ElementRef }) tableElement?: ElementRef<HTMLTableElement>;
  @ViewChild(MatTable) matTable?: MatTable<Record>;

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
      this.tableContainerWidth = containerWidth;

      this.changeDetectorRef.markForCheck();
    });
  });

  @HostBinding('style.--datatable-container-overflow-y')
  tableContainerOverflowY = 'inherit';

  @HostBinding('style.--datatable-container-overflow-x')
  tableContainerOverflowX = 'inherit';

  @HostBinding('style.--datatable-container-width.px')
  tableContainerWidth = 0;

  async ngOnInit(): Promise<void> {
    if (!this.options?.service) throw new Error(`missing mongoose datatable component service`);
    if (!this.options?.columns) throw new Error(`missing mongoose datatable component columns`);
    this.options = this.resolveOptions(this.options);
    await this.applyConfig();
    await this.applyState();
    this.prepareLoadModeOptions();
    this.buildDisplayColumns();
    this.buildSearchFormGroup();
    this.dataSource = new DatagridDataSource<Record>(this.options.service);
    this.ready.emit(this);
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.tableElement) this.observer.unobserve(this.tableElement.nativeElement);
    this.subscriptions.unsubscribe();
  }

  load(intersect: boolean): void {
    if (!intersect || this.loaded) return;
    this.loaded = true;
    if (this.tableElement) this.observer.observe(this.tableElement.nativeElement);
    if (this.loadMode === 'pagination') {
      this.subscriptions.add(
        this.paginator?.page.subscribe(() => {
          this.updateConfig();
          void this.updateState();
          void this.loadPage();
        }),
      );
    }
    void this.loadPage();
  }

  sortColumn(column: DatatableColumn<Record>): void {
    if (column.sortable === false) return;
    if (!column.order)
      column.order = {
        index: this.options.columns.filter(c => !!c.order).length,
        dir: 'asc',
      };
    else if (column.order.dir === 'asc') column.order.dir = 'desc';
    else {
      delete column.order;
      this.consolidateOrderIndex();
    }
    this.loadFirstPage();
  }

  redraw(match?: (record: Record) => boolean): void {
    this.dataSource.redraw(match);
    this._data = this.dataSource.data;
    this.pruneRenderedRows();
    this.buildDisabledRows();
    this.changeDetectorRef.detectChanges();
  }

  refreshColumns(): void {
    this.buildDisplayColumns();
  }

  exporting = false;
  async export(): Promise<void> {
    this.exporting = true;
    try {
      await exportDatatable({
        options: this.options,
        searchValues: this.getSearchValues(),
        recordsFiltered: this.dataSource.recordsFiltered,
        rowSize: this.dataSource.rowSize,
      });
    } finally {
      this.exporting = false;
    }
  }

  async loadPage(): Promise<void> {
    if (!this.dataSource) return;
    if (this.loadMode === 'incremental') {
      await this.loadInitialPage();
      return;
    }
    await this.loadPaginationPage();
  }

  async loadNextIncrementalPage(): Promise<void> {
    if (this.loadMode !== 'incremental') return;
    if (!this.dataSource || this.dataSource.loading$.value || this.loadingNextRecords || !this.hasMoreRecords) return;

    this.loadingNextRecords = true;
    this.updateIncrementalRowState();
    const loadToken = this.incrementalLoadToken;
    try {
      const nextPageIndex = this.incrementalPageIndex + 1;
      await this.dataSource.loadData(
        buildDatasourceRequestOptions(
          this.options,
          this.getSearchValues(),
          nextPageIndex,
          this.incrementalPageSize,
        ),
        true,
      );
      if (loadToken !== this.incrementalLoadToken) return;
      this.incrementalPageIndex = nextPageIndex;
      this.updateLoadedDataState();
    } finally {
      if (loadToken === this.incrementalLoadToken) {
        this.loadingNextRecords = false;
        this.updateIncrementalRowState();
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  onIncrementalIntersection(intersect: boolean): void {
    if (!intersect) return;
    void this.loadNextIncrementalPage();
  }

  private async loadPaginationPage(): Promise<void> {
    await this.dataSource.loadData(
      buildDatasourceRequestOptions(
        this.options,
        this.getSearchValues(),
        this.paginator!.pageIndex,
        this.paginator!.pageSize,
      ),
    );
    this.updateLoadedDataState();
  }

  private async loadInitialPage(): Promise<void> {
    this.resetIncrementalLoading();
    await this.dataSource.loadData(
      buildDatasourceRequestOptions(this.options, this.getSearchValues(), 0, this.incrementalPageSize),
    );
    this.updateLoadedDataState();
  }

  private loadFirstPage(): void {
    if (this.loadMode === 'pagination') {
      this.paginationPageIndex = 0;
      if (this.paginator) this.paginator.pageIndex = 0;
    }
    void this.updateState();
    void this.loadPage();
  }

  private updateLoadedDataState(): void {
    this._data = this.dataSource.data;
    this.pruneRenderedRows();
    this.buildDisabledRows();
    this.updateRecordsCountState();
    this.updateHasMoreRecordsState();
  }

  private pruneRenderedRows(): void {
    this.renderedRows = new Set(this.dataSource.data.filter(row => this.renderedRows.has(row)));
  }

  private buildDisabledRows(): void {
    this.disabledRows = [];
    if (this.options.rowDisabled) {
      this.dataSource.data?.forEach(d => {
        if (typeof this.options.rowDisabled === 'string') {
          if (get(d, this.options.rowDisabled) === true) this.disabledRows.push(d);
        } else if (typeof this.options.rowDisabled === 'function') {
          if (this.options.rowDisabled(d)) this.disabledRows.push(d);
        }
      });
    }
  }

  updateColumns: UpdateColumn<Record>[] = [];
  openUpdateColumnDisplay(): void {
    this.updateColumns = this.options.columns.map(column => ({
      columnDef: column.columnDef,
      header: column.header,
      sticky: column.sticky,
      hidden: column.hidden,
    }));
  }

  reorderColumns(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.updateColumns, event.previousIndex, event.currentIndex);
  }

  closeUpdateColumnDisplay(): void {
    let reload = false;
    this.updateColumns.forEach((updated, index) => {
      const columnIndex = this.options.columns.findIndex(c => c.columnDef === updated.columnDef);
      if (columnIndex == -1) return;
      if (columnIndex !== index) moveItemInArray(this.options.columns, columnIndex, index);
      const column = this.options.columns[index];
      if (updated.sticky !== column.sticky) column.sticky = updated.sticky;
      if (updated.hidden !== column.hidden) {
        column.hidden = updated.hidden;
        reload = true;
      }
    });
    this.buildDisplayColumns();
    this.updateConfig();
    if (reload) this.loadFirstPage();
  }

  rowClick(row: Record): void {
    if (this.disabledRows.includes(row)) return;
    if (this.options.expandedDetailContentId) this.expandedRow = this.expandedRow === row ? null : row;
    if (this.options.actions?.rowClick === true) {
      this.rowClicked.emit(row);
    } else if (typeof this.options.actions?.rowClick === 'function') {
      this.options.actions.rowClick(row);
      this.rowClicked.emit(row);
    }
  }

  rowKeydown(event: KeyboardEvent, row: Record): void {
    if (!this.options.actions?.rowClick && !this.options.expandedDetailContentId) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.rowClick(row);
  }

  protected renderRow(row: Record): void {
    if (this.renderedRows.has(row)) return;
    this.renderedRows.add(row);
    if (this.rowRenderChangeScheduled) return;
    this.rowRenderChangeScheduled = true;
    queueMicrotask(() => {
      this.rowRenderChangeScheduled = false;
      if (!this.destroyed) this.changeDetectorRef.detectChanges();
    });
  }

  facetClick(
    column: DatatableColumn<Record> | undefined,
    result: NgxMatDatasourceResultFacet,
    option: FacetOptionsOptions,
  ): void {
    if (!column) return;
    const controlName = this.searchControlNames[column.columnDef];
    const control = controlName ? this.searchFormGroup?.controls[controlName] : undefined;
    if (!control) return;
    if (option && option.value !== control.value?.value) control.setValue({ value: option.value, name: option.name });
    else if (result._id !== control.value?.value) control.setValue({ value: result._id });
  }

  private buildDisplayColumns(): void {
    const displayedColumns: string[] = [];
    this.options.columns.forEach(column => {
      if (column.hidden || column.disabled) return;
      displayedColumns.push(column.columnDef);
      if (column.type && ['number', 'date', 'duration'].includes(column.type)) {
        if (!(column as any).locale) (column as any).locale = this.datatableIntl.locale;
      }
    });
    this.displayedColumns = displayedColumns;
    this.visibleColumnsColspan = Math.max(displayedColumns.length, 1);
  }

  private prepareLoadModeOptions(): void {
    this.loadMode = this.options.loadMode ?? 'pagination';
    this.incrementalTrigger = this.options.incremental?.trigger ?? 'inView';
    this.preparePaginationOptions();
    this.incrementalPageSize = this.getDefaultIncrementalPageSize();
    this.showRecordsCount = this.options.showRecordsCount ?? true;
    this.incrementalLoadingLabel = this.datatableIntl.incrementalLoadingLabel;
    this.incrementalLoadMoreLabel = this.datatableIntl.incrementalLoadMoreLabel;
    this.updateRecordsCountState();
    this.updateHasMoreRecordsState();
  }

  private preparePaginationOptions(): void {
    this.paginationPageSizeOptions = this.options.pageSizeOptions || [20, 50, 100];
    this.paginationPageSize =
      this.options.pageSize || this.paginationPageSizeOptions[this.options.pageSizeOptionsIndex ?? 1] || 30;
    this.paginationPageIndex = this.restoredState?.page?.index ?? 0;
  }

  private getDefaultIncrementalPageSize(): number {
    return this.options.incremental?.pageSize || this.options.pageSize || this.paginationPageSize || 30;
  }

  private resolveOptions(options: NgxMatDatatableOptions<Record>): NgxMatDatatableOptions<Record> {
    const actions = this.resolveActions(options);
    const incremental = this.resolveIncrementalOptions(options);
    return {
      ...this.defaultOptions,
      ...options,
      service: options.service,
      columns: options.columns,
      ...(actions ? { actions } : {}),
      ...(incremental ? { incremental } : {}),
    };
  }

  private resolveActions(options: NgxMatDatatableOptions<Record>): NgxMatDatatableOptions<Record>['actions'] {
    if (!this.defaultOptions.actions && !options.actions) return undefined;
    const columns = this.resolveActionColumns(options);
    return {
      ...this.defaultOptions.actions,
      ...options.actions,
      ...(columns ? { columns } : {}),
    };
  }

  private resolveActionColumns(
    options: NgxMatDatatableOptions<Record>,
  ): NonNullable<NgxMatDatatableOptions<Record>['actions']>['columns'] {
    if (!this.defaultOptions.actions?.columns && !options.actions?.columns) return undefined;
    return {
      ...this.defaultOptions.actions?.columns,
      ...options.actions?.columns,
    };
  }

  private resolveIncrementalOptions(
    options: NgxMatDatatableOptions<Record>,
  ): NgxMatDatatableIncrementalOptions | undefined {
    if (!this.defaultOptions.incremental && !options.incremental) return undefined;
    return {
      ...this.defaultOptions.incremental,
      ...options.incremental,
    };
  }

  private resetIncrementalLoading(): void {
    this.incrementalLoadToken++;
    this.incrementalPageIndex = 0;
    this.loadingNextRecords = false;
    this.updateIncrementalRowState();
  }

  private updateRecordsCountState(): void {
    this.displayedRecordsCount = this.dataSource?.data.length ?? 0;
    this.totalRecordsCount = this.dataSource?.recordsFiltered ?? 0;
  }

  private updateHasMoreRecordsState(): void {
    this.hasMoreRecords = this.loadMode === 'incremental' && this.displayedRecordsCount < this.totalRecordsCount;
    this.updateIncrementalRowState();
  }

  private updateIncrementalRowState(): void {
    this.showIncrementalRow = this.loadMode === 'incremental' && (this.hasMoreRecords || this.loadingNextRecords);
    this.showIncrementalInViewTrigger = this.showIncrementalRow && this.incrementalTrigger === 'inView';
    this.showIncrementalButtonTrigger = this.showIncrementalRow && this.incrementalTrigger === 'button';

    this.changeDetectorRef.markForCheck();
    queueMicrotask(() => this.matTable?.renderRows());
  }

  private buildSearchFormGroup(): void {
    this.searchControlNames = {};
    this.searchFormGroup = new FormGroup(
      this.options.columns.reduce(
        (controls, column) => {
          if (column.searchable) {
            const restoredValue = this.restoredState?.filters[column.columnDef];
            const initialValue =
              restoredValue !== undefined
                ? this.restoreFilterValue(column, restoredValue)
                : column.searchValue !== undefined
                  ? { value: column.searchValue }
                  : undefined;
            const control = new FormControl({
              value: initialValue,
              disabled: false,
            });
            const controlName = this.getSearchControlName(column.columnDef);
            this.searchControlNames[column.columnDef] = controlName;
            controls[controlName] = control;
            if (typeof column.searchUpdated === 'function') {
              this.subscriptions.add(
                control.valueChanges.pipe(rxjs.debounceTime(500)).subscribe(value => column.searchUpdated!(value)),
              );
            }
          }
          return controls;
        },
        {} as { [controlName: string]: FormControl },
      ),
    );
    this.subscriptions.add(
      this.searchFormGroup.valueChanges.pipe(rxjs.debounceTime(500)).subscribe(() => {
        this.searchUpdated.next(this.getSearchValues());
        this.loadFirstPage();
      }),
    );
  }

  private getSearchValues(): { [columnDef: string]: any } {
    return this.options.columns.reduce(
      (values, column) => {
        if (!column.searchable) return values;
        const controlName = this.searchControlNames[column.columnDef];
        if (controlName) values[column.columnDef] = this.searchFormGroup?.controls[controlName]?.value;
        return values;
      },
      {} as { [columnDef: string]: any },
    );
  }

  private getSearchControlName(columnDef: string): string {
    return columnDef.replace(/%/g, '%25').replace(/\./g, '%2E');
  }

  private consolidateOrderIndex(): void {
    let index = 0;
    this.options.columns
      .filter(c => !!c.order)
      .sort((c1, c2) => c1.order!.index - c2.order!.index)
      .forEach(c => (c.order!.index = index++));
  }

  private async applyConfig(): Promise<void> {
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
        if (column && updated.sticky !== column.sticky) column.sticky = updated.sticky;
        if (column && updated.hidden !== column.hidden) column.hidden = updated.hidden;
      });
      this.buildDisplayColumns();
    }
    if (this.options && typeof this.config?.pageSizeOptionsIndex === 'number') {
      this.options.pageSizeOptionsIndex = this.config.pageSizeOptionsIndex;
    }
  }

  private async applyState(): Promise<void> {
    if (!this.options.stateService?.get) return;
    const state = await this.options.stateService.get();
    if (!state || state.version !== 1) return;
    this.restoredState = {
      version: 1,
      filters: state.filters ?? {},
      order: Array.isArray(state.order) ? state.order : [],
      ...(state.page ? { page: state.page } : {}),
    };
    this.applyStateOrder(this.restoredState);
    if (this.restoredState.page?.size) this.options.pageSize = this.restoredState.page.size;
  }

  private applyStateOrder(state: NgxMatDatatableState): void {
    this.options.columns.forEach(column => delete column.order);
    state.order
      .slice()
      .sort((a, b) => a.index - b.index)
      .forEach(order => {
        const column = this.options.columns.find(item => item.columnDef === order.columnDef);
        if (!column || column.sortable === false) return;
        column.order = { index: order.index, dir: order.dir };
      });
    this.consolidateOrderIndex();
  }

  private restoreFilterValue(column: DatatableColumn<Record>, value: any): any {
    if (column.type !== 'date' || !value?.value) return value;
    if (typeof value.value === 'object' && ('from' in value.value || 'to' in value.value)) {
      return {
        ...value,
        value: {
          from: value.value.from ? moment(value.value.from) : undefined,
          to: value.value.to ? moment(value.value.to) : undefined,
        },
      };
    }
    return { ...value, value: moment(value.value) };
  }

  private async updateState(): Promise<void> {
    if (!this.options.stateService?.set || !this.searchFormGroup) return;
    await this.options.stateService.set(this.buildState());
  }

  private buildState(): NgxMatDatatableState {
    const order = this.options.columns
      .filter(column => !!column.order)
      .map(column => ({
        columnDef: column.columnDef,
        index: column.order!.index,
        dir: column.order!.dir,
      }));
    const page =
      this.loadMode === 'pagination'
        ? {
            index: this.paginator?.pageIndex ?? this.paginationPageIndex,
            size: this.paginator?.pageSize ?? this.paginationPageSize,
          }
        : undefined;
    return {
      version: 1,
      filters: this.getSearchValues(),
      order,
      ...(page ? { page } : {}),
    };
  }

  private updateConfig(): void {
    const pageSizeOptions = this.paginationPageSizeOptions;
    const fallbackPageSize = this.paginationPageSize;
    const pageSizeOptionsIndex = pageSizeOptions.indexOf(this.paginator?.pageSize ?? fallbackPageSize);
    const columns = this.options.columns.map(c => ({
      columnDef: c.columnDef,
      sticky: c.sticky,
      hidden: c.hidden,
    }));
    this.config = { columns, pageSizeOptionsIndex };
    this.configUpdated.next(this.config);
    if (this.options?.configService?.set) this.options.configService.set(this.config);
  }
}
