/** @format */

import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';
import { NgxMatDatasourceService } from '../types/datasource-service.type';
import { DatatableSelectColumn } from '../types/datatable-column.type';
import { NgxMatDatatableOptions } from '../types/datatable-options.type';
import {
  buildExportChunks,
  buildExportRows,
  getExportChunkLength,
  loadExportData,
  sanitizeExportHeaders,
} from './datatable-export.tool';

type TestRecord = {
  name?: string;
  secondaryName?: string;
  status?: string | string[];
  duration?: number;
};

describe('datatable export tool', () => {
  it('should split exports into page-index chunks', () => {
    expect(getExportChunkLength(5, 2)).toBe(2);
    expect(buildExportChunks(5, 2)).toEqual([
      { start: 0, length: 2 },
      { start: 1, length: 2 },
      { start: 2, length: 2 },
    ]);
  });

  it('should load export data with the current filters and page-index contract', async () => {
    const service = jasmine.createSpy<NgxMatDatasourceService<TestRecord>>('service');
    service.and.callFake(async request => ({
      draw: request.draw,
      recordsFiltered: 3,
      recordsTotal: 3,
      data: [{ name: `page-${request.start}` }],
    }));
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [{ type: 'text', columnDef: 'name', header: 'Name', property: 'name', searchable: true }],
    };

    const data = await loadExportData({
      options,
      searchValues: { name: { value: 'test' } },
      recordsFiltered: 3,
      rowSize: 3,
    });

    expect(data).toEqual([{ name: 'page-0' }, { name: 'page-1' }, { name: 'page-2' }]);
    expect(service.calls.allArgs().map(args => args[0].start)).toEqual([0, 1, 2]);
    expect(service.calls.first().args[0].columns[0].search).toEqual({ value: 'test' });
  });

  it('should cache observable select options and export array labels', async () => {
    let subscriptionCount = 0;
    const optionSource = new Observable<{ value: string; name: string }[]>(subscriber => {
      subscriptionCount++;
      subscriber.next([
        { value: 'active', name: 'Active' },
        { value: 'inactive', name: 'Inactive' },
      ]);
    });
    const column: DatatableSelectColumn<TestRecord> = {
      type: 'select',
      columnDef: 'status',
      header: 'Status',
      property: 'status',
      isArrayValue: true,
      options: optionSource,
    };
    const service = jasmine.createSpy<NgxMatDatasourceService<TestRecord>>('service');
    const options: NgxMatDatatableOptions<TestRecord> = { service, columns: [column] };

    const rows = await buildExportRows(options, [
      { status: ['active', 'inactive'] },
      { status: ['inactive', 'unknown'] },
    ]);

    expect(rows).toEqual([{ Status: 'Active, Inactive' }, { Status: 'Inactive, unknown' }]);
    expect(subscriptionCount).toBe(1);
  });

  it('should preserve transforms, custom exports and duration raw values', async () => {
    const service = jasmine.createSpy<NgxMatDatasourceService<TestRecord>>('service');
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [
        {
          type: 'text',
          columnDef: 'name',
          header: 'Name',
          property: 'name',
          transform: value => String(value).toUpperCase(),
        },
        {
          type: 'text',
          columnDef: 'custom',
          header: 'Custom',
          property: 'name',
          export: (row, value) => (row['Custom export'] = `custom:${value}`),
        },
        {
          type: 'duration',
          columnDef: 'duration',
          header: 'Duration',
          property: 'duration',
        },
      ],
    };

    const rows = await buildExportRows(options, [{ name: 'test', duration: 60000 }]);

    expect(rows[0]['Name']).toBe('TEST');
    expect(rows[0]['Custom export']).toBe('custom:test');
    expect(rows[0]['Duration ms']).toBe(60000);
    expect(rows[0]['Duration']).toBeTruthy();
  });

  it('should preserve columns with duplicate headers in the worksheet', async () => {
    const service = jasmine.createSpy<NgxMatDatasourceService<TestRecord>>('service');
    const options: NgxMatDatatableOptions<TestRecord> = {
      service,
      columns: [
        { type: 'text', columnDef: 'name', header: 'Name', property: 'name' },
        { type: 'text', columnDef: 'secondaryName', header: 'Name', property: 'secondaryName' },
      ],
    };

    const rows = await buildExportRows(options, [{ name: 'Primary', secondaryName: 'Secondary' }]);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    sanitizeExportHeaders(worksheet, XLSX);

    expect(worksheet['A1'].v).toBe('Name');
    expect(worksheet['B1'].v).toBe('Name');
    expect(worksheet['A2'].v).toBe('Primary');
    expect(worksheet['B2'].v).toBe('Secondary');
  });

  it('should decode HTML entities in worksheet headers', () => {
    const worksheet = XLSX.utils.json_to_sheet([{ 'R&amp;D': 'value' }]);

    sanitizeExportHeaders(worksheet, XLSX);

    expect(worksheet['A1'].v).toBe('R&D');
  });

  it('should remove HTML tags from worksheet headers without adding spaces', () => {
    const worksheet = XLSX.utils.json_to_sheet([{ 'Compte sési<span color="warn">O</span>': 'value' }]);

    sanitizeExportHeaders(worksheet, XLSX);

    expect(worksheet['A1'].v).toBe('Compte sésiO');
  });
});
