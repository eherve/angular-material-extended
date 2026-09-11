import { DatagridDataSource } from './datasource';
import { NgxMatDatasourceRequestOptions, NgxMatDatasourceResult } from './types/datasource-service.type';

type TestRecord = { id: number };

function request(draw: string): NgxMatDatasourceRequestOptions {
  return {
    draw,
    columns: [],
    order: [],
    start: 0,
    length: 10,
  };
}

describe('DatagridDataSource', () => {
  it('should load data and response metadata', async () => {
    const service = async (options: NgxMatDatasourceRequestOptions): Promise<NgxMatDatasourceResult<TestRecord>> => ({
      draw: options.draw,
      recordsFiltered: 1,
      recordsTotal: 2,
      data: [{ id: 1 }],
      facets: { status: [{ _id: 'active', value: 1 }] },
    });
    const datasource = new DatagridDataSource(service);

    await datasource.loadData(request('1'));

    expect(datasource.data).toEqual([{ id: 1 }]);
    expect(datasource.recordsFiltered).toBe(1);
    expect(datasource.recordsTotal).toBe(2);
    expect(datasource.facets?.['status']).toEqual([{ _id: 'active', value: 1 }]);
    expect(datasource.loading$.value).toBeFalse();
  });

  it('should ignore a stale response when a newer request completes first', async () => {
    let resolveFirst!: (result: NgxMatDatasourceResult<TestRecord>) => void;
    const first = new Promise<NgxMatDatasourceResult<TestRecord>>(resolve => (resolveFirst = resolve));
    const service = jasmine.createSpy('service').and.callFake((options: NgxMatDatasourceRequestOptions) => {
      if (options.draw === '1') return first;
      return Promise.resolve({
        draw: options.draw,
        recordsFiltered: 1,
        recordsTotal: 1,
        data: [{ id: 2 }],
      });
    });
    const datasource = new DatagridDataSource<TestRecord>(service);

    const firstLoad = datasource.loadData(request('1'));
    await datasource.loadData(request('2'));
    resolveFirst({ draw: '1', recordsFiltered: 1, recordsTotal: 1, data: [{ id: 1 }] });
    await firstLoad;

    expect(datasource.data).toEqual([{ id: 2 }]);
    expect(datasource.loading$.value).toBeFalse();
  });

  it('should append data for incremental loading', async () => {
    const service = async (options: NgxMatDatasourceRequestOptions): Promise<NgxMatDatasourceResult<TestRecord>> => ({
      draw: options.draw,
      recordsFiltered: 2,
      recordsTotal: 2,
      data: [{ id: options.draw === '1' ? 1 : 2 }],
    });
    const datasource = new DatagridDataSource(service);

    await datasource.loadData(request('1'));
    await datasource.loadData(request('2'), true);

    expect(datasource.data).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should update row size from appended rows without reserializing existing rows', async () => {
    let firstRowSerializations = 0;
    const firstRow = {
      id: 1,
      toJSON: () => {
        firstRowSerializations++;
        return { id: 1 };
      },
    };
    const service = async (options: NgxMatDatasourceRequestOptions): Promise<NgxMatDatasourceResult<TestRecord>> => ({
      draw: options.draw,
      recordsFiltered: 2,
      recordsTotal: 2,
      data: options.draw === '1' ? [firstRow] : [{ id: 2 }],
    });
    const datasource = new DatagridDataSource(service);

    await datasource.loadData(request('1'));
    const initialRowSize = datasource.rowSize;
    await datasource.loadData(request('2'), true);

    expect(firstRowSerializations).toBe(1);
    expect(initialRowSize).toBeGreaterThan(0);
    expect(datasource.rowSize).toBeGreaterThan(0);
  });

  it('should not fail data loading when row size estimation cannot serialize a row', async () => {
    const circular: any = { id: 1 };
    circular.self = circular;
    const service = async (options: NgxMatDatasourceRequestOptions): Promise<NgxMatDatasourceResult<TestRecord>> => ({
      draw: options.draw,
      recordsFiltered: 1,
      recordsTotal: 1,
      data: [circular],
    });
    const datasource = new DatagridDataSource(service);

    await expectAsync(datasource.loadData(request('1'))).toBeResolved();

    expect(datasource.data).toEqual([circular]);
    expect(datasource.rowSize).toBe(0);
  });
});
