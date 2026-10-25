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

Searchable columns may expose a backend search type through `columns[].type`. The library infers it for unambiguous column types: `text` -> `string`, `number` / `duration` -> `number`, `checkbox` -> `boolean`, and `date` -> `date`. Use the public `searchType` column option for ambiguous searchable types such as `select` or `autocomplete`, or when a `searchProperty` needs an explicit backend type such as `objectid`. When `searchProperty` differs from the displayed `property`, the displayed column keeps its own inferred type and `searchType` is applied only to the effective search column.

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

## Theme tokens

Set inherited CSS custom properties on the datatable or an application ancestor. The library uses Angular Material's public Sass override APIs and does not depend on application-specific colors.

| Token | Default | Purpose |
| --- | --- | --- |
| `--ngx-mat-extended-control-height` | `32px` | Shared toolbar icon button and records counter height. Material touch targets retain the application theme size. |
| `--ngx-mat-extended-radius` | `8px` | Toolbar icon button corner radius. |
| `--ngx-mat-extended-space-1` | `4px` | Records count separation. |
| `--ngx-mat-extended-space-2` | `8px` | Records counter horizontal padding. |
| `--ngx-mat-extended-accent` | Material primary | Selected header checkbox and focused header search control color. |
| `--ngx-mat-extended-on-accent` | Material on-primary | Selected header checkbox checkmark color. |

The counter sizes to its content and shares the toolbar button height; long counts remain fully visible. Header checkbox overrides include selected, focused, hovered, pressed and indeterminate states; disabled colors retain the Material theme defaults. Existing `--ngx-mat-datatable-*` color and sticky positioning properties remain supported.

## Restored autocomplete filters

Searchable autocomplete columns can supply `resolveOption(value: unknown): Promise<DatatableSearchListOption | null>`
to recover the display option for a restored filter containing only its stored value. The application owns the lookup
(API, cache or in-memory list); the table does not assume an endpoint. Return an option whose `value` matches the
requested value, including its label and optional color/group, or `null` when unavailable.

```ts
resolveOption: async (value) => {
  if (typeof value !== 'string') return null;
  const item = await service.get(value);
  return item ? { value: item._id, name: item.name } : null;
},
```

Resolution runs after initialization or a programmatic value update, when the selected option is unknown. It does not
run for each search keystroke or for empty values. Known option labels are retained across suggestion searches. Late
responses after editing, clearing, replacing the filter or destroying the control are ignored. Lookup failures leave
the stored filter unchanged; successful resolution refreshes the input without emitting a filter change.
For columns with a resolver, an unresolved value is never displayed as raw text: the input stays blank until its label
is known, including when lookup fails or returns no option. Columns without a resolver keep their existing display.
