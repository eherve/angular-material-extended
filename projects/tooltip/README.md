# @eherve/angular-material-tooltip

Angular 22 rich tooltips built with CDK connected overlays. Supports sanitized HTML strings,
Angular templates with context, mouse hover, keyboard focus, click and touch activation.

## Installation

```sh
npm install @eherve/angular-material-tooltip
```

Import `NgxMatTooltipModule` in the consuming NgModule or standalone component's `imports`.
Enable Angular animations with `provideAnimationsAsync()` at bootstrap, or use
`provideNoopAnimations()` when animations should be disabled. Include an Angular Material
prebuilt theme or `@angular/cdk/overlay-prebuilt.css` globally for the overlay container styles.

```ts
import { NgxMatTooltipModule } from "@eherve/angular-material-tooltip";

@Component({
  imports: [NgxMatTooltipModule],
  template: `
    <button ngxMatTooltip="Details">Hover or focus</button>
    <button
      [ngxMatTooltip]="details"
      [ngxMatTooltipContext]="{ name: 'Alice' }"
      [ngxMatTooltipOpenDelay]="0"
      ngxMatTooltipPosition="top"
    >
      Show details
    </button>
    <ng-template #details let-name="name"
      ><strong>{{ name }}</strong></ng-template
    >
  `,
})
export class ExampleComponent {}
```

## Inputs

| Input                         | Default   | Behavior                                                                                                                                                                              |
| ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ngxMatTooltip`               | —         | String or `TemplateRef`; empty, null and undefined close the tooltip and cancel pending opening. HTML strings use Angular sanitization.                                               |
| `ngxMatTooltipContext`        | —         | Context passed to the template; replacement updates an open tooltip.                                                                                                                  |
| `ngxMatTooltipDisabled`       | `false`   | Boolean attribute; disabling closes immediately. The string `"false"` is false.                                                                                                       |
| `ngxMatTooltipTrigger`        | `hover`   | `hover` opens on mouse enter or focus within the trigger; a touch tap toggles it. `click` toggles on click, including native button keyboard activation.                              |
| `ngxMatTooltipOpenDelay`      | `100`     | Opening delay in milliseconds for hover/focus. Zero opens immediately. Click/tap is immediate.                                                                                        |
| `ngxMatTooltipOnOverflowOnly` | `false`   | Open only when the trigger's horizontal scroll width exceeds its offset width.                                                                                                        |
| `ngxMatTooltipPosition`       | automatic | `bottom`, `bottom start`, `bottom end`, `right`, `top` or `left`. Automatic mode tries these positions in this order. Explicit positions are pushed into the viewport when necessary. |

Leaving the trigger schedules closing after 100 ms, allowing the pointer or focus to reach
rich content. Escape and an outside click dismiss the tooltip. No backdrop consumes outside
clicks. Destruction cancels timers and disposes of the overlay.

The rendered content has `role="tooltip"` and a unique ID associated with the trigger through
`aria-describedby`; existing description IDs are preserved. Use a native focusable trigger
such as a button. A custom element needs an appropriate keyboard/focus contract in its app.
Use a dialog or menu for content requiring dialog/menu semantics.

Content and position changes update OnPush views. The public `Position` type is exported.
The old sésiO-only `visible` input is not part of this library's directive API.

## Styling

The default appearance includes a white background, padding, rounded corners, a directional
arrow and a drop shadow. Width is constrained by the viewport rather than the trigger, so
small icon and graph-node triggers can show rich content.

Customize globally (overlays render outside the trigger's ancestor tree):

```css
.ngx-mat-tooltip {
  --ngx-mat-tooltip-background-color: white;
  --ngx-mat-tooltip-border: none;
  --ngx-mat-tooltip-border-radius: 4px;
  --ngx-mat-tooltip-padding: 8px;
  --ngx-mat-tooltip-margin: 4px;
  --ngx-mat-tooltip-max-width: 640px;
  --ngx-mat-tooltip-filter: drop-shadow(0 3px 4px rgb(0 0 0 / 50%));
}
```

## Validation and packaging

From the repository root:

```sh
npm run check:tooltip
npm run test:tooltip -- --code-coverage
npm pack ./dist/tooltip --dry-run
```

The focused ChromeHeadless suite covers host integration, delays and cancellation, live
content/context/position changes, disabled and empty states, keyboard/ARIA, touch, outside
clicks, sanitization, rich-content sizing, positions and destruction.
Build output is `dist/tooltip`; publish that directory only after release approval.
