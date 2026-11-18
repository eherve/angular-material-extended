# Angular Material Thermometer

Standalone SVG `ThermometerComponent` (`app-thermometer`), Angular/Material 22+.
Import directly from `@eherve/angular-material-thermometer` and add the component
to the consuming component or NgModule imports.

```html
<app-thermometer [min]="0" [max]="100" [value]="42" [setpoint]="60"
  [colors]="[[55, 'royalblue'], [70, 'seagreen'], ['crimson']]"
  unit="°C" icon="flame" style="height:240px" />
```

| Input | Default | Contract |
| --- | --- | --- |
| `min`, `max` | `0`, `100` | Numbers/numeric attributes; finite increasing range required for graduations/fill/setpoint geometry. |
| `value` | `null` | Optional nullable finite number. Missing/non-finite values leave the value blank and omit fill. |
| `setpoint` | `null` | Optional nullable finite number. Geometry is relative to min/max and clamped to the range; the label retains the actual value. |
| `colors`, `graduationColors` | unset | Ordered arrays of `[upperExclusiveBound, color]` or a terminal `[color]`. |
| `color` | theme token | Explicit value color, used when no threshold matches. |
| `unit` | `°C` | Display text; no localize runtime is required for the default. |
| `round` | `0.0-0` | Angular DecimalPipe digits information, using the application's locale. |
| `icon` | unset | `flame`, `water-drop`, `fire`, `light`, `humidity`, `cloud`, `air-quality`. |
| `setpointLabel` | `Consigne` | Localizable setpoint caption. |

Normal ranges always render exactly 21 graduations. Equal, reversed and non-finite
ranges omit graduations, numeric fill and setpoint geometry without looping or
inventing replacement bounds. Out-of-range finite values keep their real label
and clamp only the fill geometry. All derived values update reactively.
The host exposes `role="img"` with value and unit, or an em dash when unavailable.

Public CSS properties: `--ngx-mat-thermometer-color`,
`--ngx-mat-thermometer-graduation-color`,
`--ngx-mat-thermometer-setpoint-color`, `--ngx-mat-thermometer-icon-color`,
`--ngx-mat-thermometer-surface-color`. Explicit colors/thresholds override defaults.
The original vector artwork is retained; no raster assets or business dependencies.

Build: `npm run build:thermometer`. Tests: `npm run test:thermometer`.
