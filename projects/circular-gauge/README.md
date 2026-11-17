# Circular gauge

Standalone `CircularGaugeComponent` from `@eherve/angular-material-circular-gauge`.

```typescript
import { CircularGaugeComponent } from '@eherve/angular-material-circular-gauge';
```

```html
<app-circular-gauge [progress]="42" text="42" label="Completion" suffix="%" />
```

Required inputs: `text: string`, `label: string`. Optional inputs: `progress: number | string | null` (null), `suffix` (empty), `color` (theme color), `compact` (false), `unavailableLabel` (`Non calculable`). Strings use `parseFloat`; progress is clamped to 0–100, nonfinite values render zero progress. Null progress renders an em dash, hides the suffix and announces the unavailable label. Localize that label in the consuming application.

Public CSS tokens: `--ngx-mat-circular-gauge-color`, `--ngx-mat-circular-gauge-track-color`, `--ngx-mat-circular-gauge-surface-color`, `--ngx-mat-circular-gauge-value-font-size`. Colors fall back to Material system tokens. An explicit `color` input overrides the color token. Default outer/inner dimensions are 148/116px, compact dimensions 85/70px. Value typography defaults to 2.2rem, or 1.2rem in compact mode.

Install the published package with `npm install --save-exact @eherve/angular-material-circular-gauge@22.0.0`.
