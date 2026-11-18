# Angular Material Star Rating

Standalone read-only `StarRateComponent` (`app-star-rate`), Angular 22+.
Import directly from `@eherve/angular-material-star-rating`; add the component to
the consuming component or NgModule imports. No compatibility NgModule is needed.

```html
<app-star-rate [value]="3.5" [max]="5" [step]="0.5" style="height:30px" />
<app-star-rate [value]="3.5" [shrink]="true" style="height:30px" />
```

| Input | Default | Contract |
| --- | --- | --- |
| `value` | `0` | Number or numeric string; finite values clamped to 0–max, invalid values display 0. |
| `max` | `5` | Positive finite number (numeric attributes accepted), floored to an integer; invalid/nonpositive max renders no full stars. |
| `step` | `null` | Optional positive finite rounding increment for fill; invalid increments use continuous fill. |
| `shrink` | `false` | Boolean attribute; compact single star with numeric value. |

All inputs update the displayed fill reactively. The displayed number retains the
bounded input value; step rounds the fill. The full SVG viewBox adapts to max.
The host exposes `role="img"` and a language-neutral numeric `value / max` label.
Number formatting in compact mode uses Angular's configured locale.

Public CSS properties: `--ngx-mat-star-rating-stroke-color` (default `#bbb`),
`--ngx-mat-star-rating-fill-color` (`#f8c31d`),
`--ngx-mat-star-rating-text-color` (`#666`). Size the host through CSS.
No application business models or layout directives are required.

Build: `npm run build:star-rating`. Tests: `npm run test:star-rating`.
