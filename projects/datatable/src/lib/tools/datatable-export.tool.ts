/** @format */

import { firstValueFrom } from 'rxjs';
import {
  buildDatasourceRequestColumns,
  buildDatasourceRequestOrder,
  DatatableSearchValues,
} from './datasource-request.tool';
import { duration } from './duration.tool';
import { get } from './get.tool';
import { stripHtml } from './strip-html.tool';
import {
  DatatableColumn,
  DatatableDurationColumn,
  DatatableSearchListOption,
  DatatableSelectColumn,
} from '../types/datatable-column.type';
import { NgxMatDatatableOptions } from '../types/datatable-options.type';

export interface DatatableExportContext<T> {
  options: NgxMatDatatableOptions<T>;
  searchValues: DatatableSearchValues;
  recordsFiltered: number;
  rowSize: number;
}

export interface DatatableExportChunk {
  start: number;
  length: number;
}

type ExportColumnKeys = {
  value: string;
  raw?: string;
};

const DUPLICATE_HEADER_SEPARATOR = '\u2063ngx-mat-datatable:';

export async function exportDatatable<T>(context: DatatableExportContext<T>): Promise<void> {
  const xlsx = await import('xlsx');
  const data = await loadExportData(context);
  const rows = await buildExportRows(context.options, data);
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(rows);
  sanitizeExportHeaders(worksheet, xlsx);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'export');
  const filename = typeof context.options.actions?.export === 'string' ? context.options.actions.export : 'export';
  await xlsx.writeFile(workbook, `${filename}-${Date.now()}.xlsx`);
}

export async function loadExportData<T>(context: DatatableExportContext<T>): Promise<T[]> {
  const columns = buildDatasourceRequestColumns(context.options, context.searchValues);
  const order = buildDatasourceRequestOrder(context.options, columns);
  const chunkLength = getExportChunkLength(context.recordsFiltered, context.rowSize);
  const chunks = buildExportChunks(context.recordsFiltered, chunkLength);
  const data: T[] = [];

  for (const chunk of chunks) {
    const result = await context.options.service({
      draw: Date.now().toString(),
      columns,
      order,
      start: chunk.start,
      length: chunk.length,
    });
    data.push(...result.data);
  }

  return data;
}

export async function buildExportRows<T>(
  options: NgxMatDatatableOptions<T>,
  data: T[],
): Promise<{ [key: string]: unknown }[]> {
  const selectOptionsCache = new Map<DatatableSelectColumn<T>, DatatableSearchListOption[]>();
  const exportKeys = buildExportColumnKeys(options.columns);
  const rows: { [key: string]: unknown }[] = [];

  for (const record of data) {
    const row: { [key: string]: unknown } = {};
    for (const column of options.columns) {
      if (column.hidden || column.disabled) continue;
      let value = get(record, column.property);
      if (column.export) {
        column.export(row, value, record);
        continue;
      }
      value = transformExportValue(column, value, record);
      const keys = exportKeys.get(column)!;
      if (column.type === 'select') {
        await buildSelectExportValue(column as DatatableSelectColumn<T>, row, keys.value, value, selectOptionsCache);
      } else if (column.type === 'duration') {
        buildDurationExportValue(column as DatatableDurationColumn<T>, row, keys, value);
      } else {
        row[keys.value] = value;
      }
    }
    rows.push(row);
  }

  return rows;
}

export function getExportChunkLength(recordsFiltered: number, rowSize: number): number {
  if (recordsFiltered <= 0) return 0;
  if (!Number.isFinite(rowSize) || rowSize <= 0) return recordsFiltered;
  return Math.max(1, Math.min(Math.floor(5 / rowSize), recordsFiltered));
}

export function buildExportChunks(recordsFiltered: number, chunkLength: number): DatatableExportChunk[] {
  if (recordsFiltered <= 0 || chunkLength <= 0) return [];
  const chunks: DatatableExportChunk[] = [];
  for (let index = 0; index < Math.ceil(recordsFiltered / chunkLength); index++) {
    chunks.push({ start: index, length: chunkLength });
  }
  return chunks;
}

export function sanitizeExportHeaders(worksheet: import('xlsx').WorkSheet, xlsx: typeof import('xlsx')): void {
  const ref = worksheet['!ref'];
  if (!ref) return;
  const range = xlsx.utils.decode_range(ref);
  for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex++) {
    const address = xlsx.utils.encode_cell({ r: range.s.r, c: columnIndex });
    const cell = worksheet[address];
    if (!cell || typeof cell.v !== 'string') continue;
    cell.v = stripHtml(removeDuplicateHeaderSuffix(cell.v), '');
    delete cell.w;
  }
}

function transformExportValue<T>(column: DatatableColumn<T>, value: any, record: T): any {
  if (!('transform' in column) || typeof column.transform !== 'function') return value;
  return column.transform(value, record);
}

async function buildSelectExportValue<T>(
  column: DatatableSelectColumn<T>,
  row: { [key: string]: unknown },
  exportKey: string,
  value: any,
  cache: Map<DatatableSelectColumn<T>, DatatableSearchListOption[]>,
): Promise<void> {
  const options = await resolveSelectOptions(column, cache);
  const getLabel = (optionValue: any): any => options.find(option => option.value === optionValue)?.name ?? optionValue;
  row[exportKey] = column.isArrayValue && Array.isArray(value) ? value.map(getLabel).join(', ') : getLabel(value);
}

async function resolveSelectOptions<T>(
  column: DatatableSelectColumn<T>,
  cache: Map<DatatableSelectColumn<T>, DatatableSearchListOption[]>,
): Promise<DatatableSearchListOption[]> {
  if (Array.isArray(column.options)) return column.options;
  const cached = cache.get(column);
  if (cached) return cached;
  const options = await firstValueFrom(column.options);
  cache.set(column, options);
  return options;
}

function buildDurationExportValue<T>(
  column: DatatableDurationColumn<T>,
  row: { [key: string]: unknown },
  keys: ExportColumnKeys,
  value: any,
): void {
  row[keys.raw!] = value;
  row[keys.value] = duration(value, column);
}

function buildExportColumnKeys<T>(columns: DatatableColumn<T>[]): Map<DatatableColumn<T>, ExportColumnKeys> {
  const usedKeys = new Map<string, number>();
  const result = new Map<DatatableColumn<T>, ExportColumnKeys>();

  for (const column of columns) {
    if (column.hidden || column.disabled || column.export) continue;
    if (column.type === 'duration') {
      result.set(column, {
        raw: createUniqueExportKey(`${column.header} ms`, usedKeys),
        value: createUniqueExportKey(column.header, usedKeys),
      });
    } else {
      result.set(column, { value: createUniqueExportKey(column.header, usedKeys) });
    }
  }

  return result;
}

function createUniqueExportKey(header: string, usedKeys: Map<string, number>): string {
  const occurrence = usedKeys.get(header) ?? 0;
  usedKeys.set(header, occurrence + 1);
  return occurrence === 0 ? header : `${header}${DUPLICATE_HEADER_SEPARATOR}${occurrence}`;
}

function removeDuplicateHeaderSuffix(value: string): string {
  const separatorIndex = value.lastIndexOf(DUPLICATE_HEADER_SEPARATOR);
  return separatorIndex === -1 ? value : value.slice(0, separatorIndex);
}
