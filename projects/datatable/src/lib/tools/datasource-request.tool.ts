/** @format */

import {
  NgxMatDatasourceRequestColumn,
  NgxMatDatasourceRequestColumnType,
  NgxMatDatasourceRequestOptions,
  NgxMatDatasourceRequestOrder,
} from '../types/datasource-service.type';
import { DatatableColumn } from '../types/datatable-column.type';
import { NgxMatDatatableOptions } from '../types/datatable-options.type';

export type DatatableSearchValues = { [columnDef: string]: any };

export function buildDatasourceRequestColumns<Record>(
  options: NgxMatDatatableOptions<Record>,
  searchValues: DatatableSearchValues,
): NgxMatDatasourceRequestColumn[] {
  const columns: NgxMatDatasourceRequestColumn[] = [];
  const additionalColumns: NgxMatDatasourceRequestColumn[] = [];

  options.additionalProperties?.forEach(property => addAdditionalColumn(additionalColumns, property));

  options.columns.forEach(columnOptions => {
    if (columnOptions.hidden) return;

    const inferredType = columnOptions.searchable ? inferDatasourceRequestColumnType(columnOptions) : undefined;
    const searchType = columnOptions.searchType ?? inferredType;
    const column: NgxMatDatasourceRequestColumn = {
      data: columnOptions.property,
      projection: columnOptions.projection,
      name: columnOptions.columnDef,
      searchable: columnOptions.searchable,
      orderable: columnOptions.sortable,
      type: columnOptions.searchProperty ? inferredType : searchType,
    };

    if (columnOptions.sortProperty && columnOptions.order) {
      addAdditionalColumn(additionalColumns, columnOptions.sortProperty);
    }

    if (columnOptions.searchable) {
      const search = searchValues[columnOptions.columnDef];
      if (search) {
        if (columnOptions.searchProperty) {
          addAdditionalColumn(additionalColumns, columnOptions.searchProperty, search, searchType);
        } else column.search = search;
      }
    }

    columnOptions.additionalProperties?.forEach(property => addAdditionalColumn(additionalColumns, property));
    columns.push(column);
  });

  additionalColumns.forEach(additionalColumn => {
    const column = columns.find(item => item.data === additionalColumn.data);
    if (!column) columns.push(additionalColumn);
    else {
      if (additionalColumn.search && !column.search) column.search = additionalColumn.search;
      if (additionalColumn.type && !column.type) column.type = additionalColumn.type;
    }
  });

  return columns;
}

export function buildDatasourceRequestOrder<Record>(
  options: NgxMatDatatableOptions<Record>,
  columns: NgxMatDatasourceRequestColumn[],
): NgxMatDatasourceRequestOrder[] {
  const order: NgxMatDatasourceRequestOrder[] = [];

  options.columns
    .filter(column => !!column.order && column.sortable !== false)
    .sort((first, second) => first.order!.index - second.order!.index)
    .forEach(columnOptions => {
      const property = columnOptions.sortProperty || columnOptions.property;
      const index = columns.findIndex(column => column.data === property);
      if (index !== -1) order.push({ column: index, dir: columnOptions.order!.dir });
    });

  return order;
}

export function buildDatasourceRequestOptions<Record>(
  options: NgxMatDatatableOptions<Record>,
  searchValues: DatatableSearchValues,
  start: number,
  length: number,
  draw = Date.now().toString(),
): NgxMatDatasourceRequestOptions {
  const columns = buildDatasourceRequestColumns(options, searchValues);
  return {
    draw,
    columns,
    start,
    length,
    order: buildDatasourceRequestOrder(options, columns),
    facets: options.facets,
  };
}

function inferDatasourceRequestColumnType<Record>(
  column: DatatableColumn<Record>,
): NgxMatDatasourceRequestColumnType | undefined {
  switch (column.type) {
    case 'text':
      return 'string';
    case 'number':
    case 'duration':
      return 'number';
    case 'checkbox':
      return 'boolean';
    case 'date':
      return 'date';
    default:
      return;
  }
}

function addAdditionalColumn(
  additionalColumns: NgxMatDatasourceRequestColumn[],
  data: string,
  search?: any,
  type?: NgxMatDatasourceRequestColumnType,
): NgxMatDatasourceRequestColumn {
  let column = additionalColumns.find(item => item.data === data);
  if (!column) {
    column = { data };
    additionalColumns.push(column);
  }
  if (search) {
    column.search = search;
    column.searchable = true;
  }
  if (type && !column.type) column.type = type;
  return column;
}
