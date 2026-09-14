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


  it('should infer backend search types from unambiguous column types', () => {
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [
        { type: 'text', columnDef: 'name', header: 'Name', property: 'name', searchable: true },
        { type: 'number', columnDef: 'amount', header: 'Amount', property: 'amount', searchable: true },
        { type: 'checkbox', columnDef: 'active', header: 'Active', property: 'active', searchable: true },
        { type: 'date', columnDef: 'createdAt', header: 'Created', property: 'createdAt', searchable: true },
        { type: 'duration', columnDef: 'duration', header: 'Duration', property: 'duration', searchable: true },
      ],
    };

    const columns = buildDatasourceRequestColumns(options, {});

    expect(columns.map(column => column.type)).toEqual(['string', 'number', 'boolean', 'date', 'number']);
  });

  it('should apply an explicit search type to the effective search property', () => {
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [
        {
          type: 'text',
          columnDef: 'owner',
          header: 'Owner',
          property: 'owner.name',
          searchable: true,
          searchProperty: 'owner._id',
          searchType: 'objectid',
        },
      ],
    };
    const search = { value: '507f1f77bcf86cd799439011' };

    const columns = buildDatasourceRequestColumns(options, { owner: search });
    const displayColumn = columns.find(column => column.data === 'owner.name');
    const searchColumn = columns.find(column => column.data === 'owner._id');

    expect(displayColumn?.type).toBe('string');
    expect(searchColumn?.type).toBe('objectid');
    expect(searchColumn?.search).toEqual(search);
  });

  it('should merge a search property type into an existing requested column', () => {
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [
        {
          type: 'select',
          columnDef: 'ownerId',
          header: 'Owner id',
          property: 'owner._id',
          options: [],
        },
        {
          type: 'text',
          columnDef: 'ownerName',
          header: 'Owner',
          property: 'owner.name',
          searchable: true,
          searchProperty: 'owner._id',
          searchType: 'objectid',
        },
      ],
    };
    const search = { value: '507f1f77bcf86cd799439011' };

    const columns = buildDatasourceRequestColumns(options, { ownerName: search });
    const searchColumn = columns.find(column => column.data === 'owner._id');

    expect(columns.filter(column => column.data === 'owner._id').length).toBe(1);
    expect(searchColumn?.type).toBe('objectid');
    expect(searchColumn?.search).toEqual(search);
  });

  it('should allow explicit search types for ambiguous column types', () => {
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [
        {
          type: 'select',
          columnDef: 'amount',
          header: 'Amount',
          property: 'amount',
          searchable: true,
          searchType: 'number',
          options: [],
        },
      ],
    };

    const columns = buildDatasourceRequestColumns(options, {});

    expect(columns[0].type).toBe('number');
  });

  it('should propagate non-sortable columns and ignore their configured order', () => {
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [
        {
          type: 'text',
          columnDef: 'name',
          header: 'Name',
          property: 'name',
          sortable: false,
          order: { index: 0, dir: 'asc' },
        },
      ],
    };

    const columns = buildDatasourceRequestColumns(options, {});
    const order = buildDatasourceRequestOrder(options, columns);

    expect(columns[0].orderable).toBeFalse();
    expect(order).toEqual([]);
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
