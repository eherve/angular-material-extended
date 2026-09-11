/** @format */

import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgxMatDatasourceRequestOptions, NgxMatDatasourceResultFacet, NgxMatDatasourceService } from './types/datasource-service.type';

export class DatagridDataSource<Record> extends DataSource<Record> {
  loading$ = new BehaviorSubject<boolean>(true);
  data: Record[] = [];
  recordsFiltered = 0;
  recordsTotal?: number;
  facets?: { [id: string]: NgxMatDatasourceResultFacet[] };
  rowSize: number = 0; // average row size in MB

  private options?: NgxMatDatasourceRequestOptions;
  private latestRequestId = 0;
  private disconnected = false;
  private measuredRowSize = 0;
  private measuredRowCount = 0;
  private readonly textEncoder = new TextEncoder();
  protected dataStream = new BehaviorSubject<Record[]>([]);

  constructor(private service: NgxMatDatasourceService<Record>) {
    super();
  }

  connect(): Observable<Record[]> {
    return this.dataStream;
  }

  disconnect(): void {
    this.disconnected = true;
    this.latestRequestId++;
    this.loading$.complete();
    this.dataStream.complete();
  }

  async loadData(options: NgxMatDatasourceRequestOptions, append = false): Promise<void> {
    if (this.disconnected) return;
    const requestId = ++this.latestRequestId;
    this.options = options;
    if (!append) this.loading$.next(true);
    try {
      const result = await this.service(options);
      if (this.disconnected || requestId !== this.latestRequestId || options.draw !== result.draw) return;
      this.recordsTotal = result.recordsTotal;
      this.recordsFiltered = result.recordsFiltered;
      this.facets = result.facets;
      this.updateRowSize(result.data, append);
      this.setData(result.data, append);
    } finally {
      if (!append && !this.disconnected && requestId === this.latestRequestId) this.loading$.next(false);
    }
  }

  refresh(): void {
    if (this.options) void this.loadData(this.options);
  }

  redraw(match?: (record: Record) => boolean): void {
    const data: Record[] = [];
    this.data.forEach((d) => {
      if (match) {
        if (match(d)) data.push({ ...d });
        else data.push(d);
      } else data.push({ ...d });
    });
    this.setData(data, false);
  }

  private setData(data: Record[], append: boolean): void {
    this.data = append ? [...this.data, ...data] : data;
    this.dataStream.next(this.data);
  }

  private updateRowSize(data: Record[], append: boolean): void {
    if (!append) {
      this.measuredRowSize = 0;
      this.measuredRowCount = 0;
    }

    for (const row of data) {
      try {
        const serialized = JSON.stringify(row);
        if (serialized === undefined) continue;
        this.measuredRowSize += this.textEncoder.encode(serialized).length / 1024 / 1024;
        this.measuredRowCount++;
      } catch {
        // Row size is only an export chunking hint; unserializable rows must not fail data loading.
      }
    }

    this.rowSize = this.measuredRowCount ? this.measuredRowSize / this.measuredRowCount : 0;
  }
}
