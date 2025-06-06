/** @format */

import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgxMatDatasourceRequestOptions, NgxMatDatasourceResultFacet, NgxMatDatasourceService } from './types/datasource-service.type';

export class DatagridDataSource<Record> extends DataSource<Record> {
  loading$ = new BehaviorSubject<boolean>(true);
  recordsFiltered = 0;
  recordsTotal?: number;
  facets?: { [id: string]: NgxMatDatasourceResultFacet[] };
  rowSize: number = 0; // row size in kb

  private options?: NgxMatDatasourceRequestOptions;
  private dataStream = new BehaviorSubject<Record[]>([]);

  constructor(private service: NgxMatDatasourceService<Record>) {
    super();
  }

  connect(): Observable<Record[]> {
    return this.dataStream;
  }

  disconnect() {}

  async loadData(options: NgxMatDatasourceRequestOptions): Promise<void> {
    this.options = options;
    this.loading$.next(true);
    try {
      const result = await this.service(options);
      if (options.draw !== result.draw) return;
      this.recordsTotal = result.recordsTotal;
      this.recordsFiltered = result.recordsFiltered;
      this.facets = result.facets;
      this.dataStream.next(result.data);
      this.calculateRowSize(result.data);
    } finally {
      this.loading$.next(false);
    }
  }

  refresh(): void {
    if (this.options) this.loadData(this.options);
  }

  redraw(match?: (record: Record) => boolean) {
    const data: Record[] = [];
    this.dataStream.value.forEach(d => {
      if (match) {
        if (match(d)) data.push({ ...d });
        else data.push(d);
      } else data.push({ ...d });
    });
    this.dataStream.next(data);
  }

  private calculateRowSize(data: Record[]) {
    let total = 0;
    for (let row of data) {
      const size = new TextEncoder().encode(JSON.stringify(row)).length;
      const kiloBytes = size / 1024;
      total += kiloBytes / 1024;
    }
    this.rowSize = total && data.length ? total / data.length : 0;
  }
}
