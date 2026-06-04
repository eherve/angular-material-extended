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
  rowSize: number = 0; // row size in kb

  private options?: NgxMatDatasourceRequestOptions;
  private latestRequestId = 0;
  private disconnected = false;
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
      this.setData(result.data, append);
      this.calculateRowSize(this.data);
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

  private calculateRowSize(data: Record[]): void {
    let total = 0;
    for (let row of data) {
      const size = new TextEncoder().encode(JSON.stringify(row)).length;
      const kiloBytes = size / 1024;
      total += kiloBytes / 1024;
    }
    this.rowSize = total && data.length ? total / data.length : 0;
  }
}
