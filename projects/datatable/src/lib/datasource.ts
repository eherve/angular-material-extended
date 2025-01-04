import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatasourceRequestOptions, DatasourceService } from './types/datasource-service.type';

export class DatagridDataSource<Record> extends DataSource<Record> {
  loading$ = new BehaviorSubject<boolean>(true);
  recordsTotal = 0;
  recordsFiltered = 0;

  private options?: DatasourceRequestOptions;
  private dataStream = new BehaviorSubject<Record[]>([]);

  constructor(private service: DatasourceService<Record>) {
    super();
  }

  connect(): Observable<Record[]> {
    return this.dataStream;
  }

  disconnect() {}

  async loadData(options: DatasourceRequestOptions): Promise<void> {
    this.options = options;
    this.loading$.next(true);
    try {
      const result = await this.service(options);
      if (options.draw !== result.draw) return;
      this.recordsTotal = result.recordsTotal;
      this.recordsFiltered = result.recordsFiltered;
      this.dataStream.next(result.data);
    } finally {
      this.loading$.next(false);
    }
  }

  refresh(): void {
    if (this.options) this.loadData(this.options);
  }
}
