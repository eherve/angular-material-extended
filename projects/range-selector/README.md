# Angular Material Range Selector

```sh
npm install @eherve/angular-material-range-selector moment @angular/material-moment-adapter
```

Angular/Material/CDK 22.2+, Moment 2.30 and RxJS 7.8 are peer dependencies.
Import the standalone `RangeSelectorComponent` or `RangeSelectorModule` from
`@eherve/angular-material-range-selector`. Configure the application's Material
theme and icons as usual. No sésiO services, layout directives, chart library or
FullCalendar dependency is required.

```html
<app-range-selector display="toolbar" (stateChanged)="setPeriod($event)">
  <button rangeActions mat-button (click)="refresh()">Actualiser</button>
  <app-report [period]="period()" />
</app-range-selector>
```

## Public contract

- `display`: `card` (default) or `toolbar`.
- `kind`: `past` (default) or `future`, for rolling amount/unit presets.
- `ranges`: optional `RangeSelectorOption[]`; defaults to year/month/week/day.
  Options have `id`, `label` and either `view`, `amount`/`unit`, or a `range`
  callback returning `{ start: Date, end: Date }`. HTML labels are sanitized by Angular.
- `selected`: optional initial/current preset, matched by stable identity.
- `defaultView`: `month` by default; `allowAllDates` and `showToday` default to true.
- `navigation`: optional `RangeSelectorNavigation`, whose `selectedId`, `title`,
  `disableToday`, `select`, `previous`, `next` and `today` belong to the host calendar.
  This mode delegates navigation without initializing or emitting calculated dates.
- `datepickerPanelClass`: optional class(es) applied to the datepicker overlay.
- `changed`: emits `RangeDate` only when finite date bounds change.
- `stateChanged`: emits `{ allDates, view, dateRange }`; all-dates has a null range.
- `setRange`, `changeView`, `prev`, `next`, `today`, `showAllDates` remain public.

Calendar periods use local inclusive start/end-of-period boundaries. Manual ranges
are normalized to inclusive whole days. Rolling ranges retain their existing
past/future semantics. Week boundaries follow the configured Moment locale.

Project business actions with `[rangeActions]` and associated charts, tables,
calendars, loading indicators and errors into the default content slot. Elements
marked `#rangeElement` may implement `RangeSelectorElement`: optional
`setExtremes(range, redraw, trigger)` and `clearExtremes(redraw, trigger)` methods
are called with trigger `range-selector`. Charts remain owned by the application.

## Inherited theme

The component includes its styles. Set public tokens on the component or any
ancestor; existing instances respond to changes without input updates.

| Token | Default / role |
| --- | --- |
| `--ngx-mat-range-selector-header-background` | Material primary |
| `--ngx-mat-range-selector-header-text` | Material on-primary |
| `--ngx-mat-range-selector-selected-background` | Shared accent, then Material primary-container |
| `--ngx-mat-range-selector-selected-text` | Shared on-accent, then Material on-primary-container |
| `--ngx-mat-range-selector-control-border` | Translucent header text |
| `--ngx-mat-range-selector-control-height` | Shared control-height, then 32px |
| `--ngx-mat-extended-space-1` … `space-3` | 4 / 8 / 16px |
| `--ngx-mat-extended-radius` | 8px |
| `--ngx-mat-extended-surface` | Material surface |
| `--ngx-mat-extended-text` | Material on-surface |
| `--range-selector-content-gap` | Shared space-2 |
| `--ngx-mat-range-selector-toolbar-margin` | 0px; toolbar margin when `--card-margin` is unset |
| `--card-margin` | Shared space-2 in card mode |

```scss
.brand-panel {
  --ngx-mat-range-selector-header-background: var(--brand-primary);
  --ngx-mat-range-selector-header-text: var(--brand-on-primary);
  --ngx-mat-range-selector-selected-background: var(--brand-accent);
  --ngx-mat-range-selector-selected-text: var(--brand-on-accent);
}
```

All styles are scoped under `app-range-selector`, including projected toolbar
controls. Material components use public Sass override APIs. The datepicker popup
inherits the application's Material theme through the CDK overlay container.
For a subtree-specific theme, apply its public Material theme/datepicker overrides
to a global class passed as `datepickerPanelClass`; ancestor CSS variables do not
automatically cross into an overlay attached to the document body.

## Labels and date formats

Provide `RangeSelectorIntl` (or update its typed `messages` dictionary and call
`changes.next()`) to translate default presets, buttons, accessible navigation
labels and date placeholders. Defaults are French. Refreshing labels preserves
selected dates and custom presets. The package does not require `$localize`.

The component provides a Moment date adapter, inherits `MAT_DATE_LOCALE` and uses
French numeric date formats by default. Configure Moment locales in the host.
Override `RANGE_SELECTOR_DATE_FORMATS` with a `MatDateFormats` value to change
parsing/display formats without replacing the application's date adapter.
This package intentionally uses Moment; a native/Day.js adapter is not supported.

## Validation and demo

```sh
npm run test:range-selector
npm run build:range-selector
```

The demo application's `/range-selector` route demonstrates card/toolbar displays,
custom periods, projected actions and independently themed instances.
