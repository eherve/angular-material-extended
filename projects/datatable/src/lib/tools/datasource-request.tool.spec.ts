/** @format */

import { NgxMatDatasourceService } from '../types/datasource-service.type';
import { NgxMatDatatableOptions } from '../types/datatable-options.type';
import {
  buildDatasourceRequestColumns,
  buildDatasourceRequestOptions,
  buildDatasourceRequestOrder,
} from './datasource-request.tool';

type TestRecord = { name: string; amount: number };

describe('Datasource request tools', () => {
  const service = jasmine.createSpy<NgxMatDatasourceService<TestRecord>>('service');

  it('should preserve projection expressions and page-index pagination', () => {
    const projection = { $size: { $ifNull: ['$items', []] } };
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [
        {
          type: 'number',
          columnDef: 'itemCount',
          header: 'Items',
          property: 'itemCount',
          projection,
        },
      ],
    };

    const request = buildDatasourceRequestOptions(options, {}, 3, 25, 'draw-1');

    expect(request.draw).toBe('draw-1');
    expect(request.start).toBe(3);
    expect(request.length).toBe(25);
    expect(request.columns[0].projection).toEqual(projection);
  });

  it('should merge additional, search and sort properties without duplicates', () => {
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      additionalProperties: ['metadata', 'normalizedName'],
      columns: [
        {
          type: 'text',
          columnDef: 'name',
          header: 'Name',
          property: 'name',
          searchable: true,
          searchProperty: 'normalizedName',
          sortProperty: 'normalizedName',
          order: { index: 0, dir: 'asc' },
          additionalProperties: ['metadata'],
        },
      ],
    };
    const search = { value: 'Eric', regex: true };

    const columns = buildDatasourceRequestColumns(options, { name: search });
    const order = buildDatasourceRequestOrder(options, columns);

    expect(columns.filter(column => column.data === 'normalizedName').length).toBe(1);
    expect(columns.find(column => column.data === 'normalizedName')?.search).toEqual(search);
    expect(columns.filter(column => column.data === 'metadata').length).toBe(1);
    expect(order).toEqual([{ column: columns.findIndex(column => column.data === 'normalizedName'), dir: 'asc' }]);
  });

  it('should exclude hidden columns while keeping disabled columns in the datasource request', () => {
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [
        { type: 'text', columnDef: 'hidden', header: 'Hidden', property: 'hidden', hidden: true },
        { type: 'text', columnDef: 'disabled', header: 'Disabled', property: 'disabled', disabled: true },
      ],
    };

    const columns = buildDatasourceRequestColumns(options, {});

    expect(columns.map(column => column.data)).toEqual(['disabled']);
  });
});
