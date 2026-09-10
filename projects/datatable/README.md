# @eherve/angular-material-datatable

Angular Material datatable library with server-side filtering, sorting, pagination, facets, configurable columns and XLSX export.

## Workspace

The library lives in `projects/datatable` inside the `angular-material-extended` workspace. Build and test it from the workspace root.

```bash
npm run test:datatable
npm run build:datatable
```

Publishing is intentionally separate and should only be run when a new package version is ready:

```bash
npm run publish:datatable
```

## Datasource contract

A datatable receives a `NgxMatDatasourceService<Record>` and sends `NgxMatDatasourceRequestOptions` containing the visible/requested columns, ordering, pagination, search and optional facets.

The main request fields are:

- `draw`: request identifier echoed by the datasource response;
- `columns`: requested properties and optional projection/search metadata;
- `order`: indexes into `columns` with `asc` / `desc` direction;
- `start`: page index, not a row offset;
- `length`: page size;
- `search`: optional global search;
- `facets`: optional indicator aggregations.

The companion `mongoose-datatable` backend converts pagination to a MongoDB offset using `start * length`.

A datasource response contains `draw`, `recordsFiltered`, `data`, optional `facets`, and may also provide unfiltered total information when supported by the datasource.

## Projection expressions

`projection` accepts datasource-specific projection values. With `mongoose-datatable`, MongoDB aggregation expressions are supported, for example:

```ts
{
  data: 'itemCount',
  projection: { $size: { $ifNull: ['$items', []] } },
}
```

## Runtime dependencies

Angular framework packages and the external libraries used directly by this package are declared as peer dependencies so the consuming Angular application keeps a single compatible runtime instance.
