import { CellOpacityPipe } from './cell-opacity.pipe';
import { DatatableTextColumn } from '../types/datatable-column.type';
import { NgxMatDatatableOptions } from '../types/datatable-options.type';

type TestRecord = { name: string };

const column: DatatableTextColumn<TestRecord> = {
  type: 'text',
  columnDef: 'name',
  header: 'Name',
  property: 'name',
};

const service = async () => ({
  draw: '1',
  recordsFiltered: 0,
  recordsTotal: 0,
  data: [],
});

describe('CellOpacityPipe', () => {
  const pipe = new CellOpacityPipe<TestRecord>();
  const row: TestRecord = { name: 'Test' };

  it('should return a fixed numeric row opacity', () => {
    const options: NgxMatDatatableOptions<TestRecord> = { service, columns: [column], rowOpacity: 0.5 };

    expect(pipe.transform(row, column, options)).toBe(0.5);
  });

  it('should compute row opacity with a function', () => {
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [column],
      rowOpacity: (_column, record) => (record.name === 'Test' ? 0.25 : 1),
    };

    expect(pipe.transform(row, column, options)).toBe(0.25);
  });
});
