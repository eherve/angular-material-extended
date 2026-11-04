# Angular Material Notifications

Standalone Angular 22 notifications with a dedicated CDK overlay. Import the CDK overlay structural styles in your application (`@angular/cdk/overlay-prebuilt.css`) and provide a Material theme and Material icon font, as with other Material components.

```ts
import { inject } from '@angular/core';
import { NgxMatNotificationService, NGX_MAT_NOTIFICATION_CONFIG } from '@eherve/angular-material-notifications';

// Optional application provider:
{ provide: NGX_MAT_NOTIFICATION_CONFIG, useValue: {
  top: '8px', right: '8px', closeLabel: 'Dismiss notification', progressLabel: 'Task progress'
} }

const notifications = inject(NgxMatNotificationService);
notifications.success('Saved');
const upload = notifications.task({ message: 'Uploading', status: 'queued' });
upload.update({ status: 'wip', progress: 0.5 }); // progress is a 0..1 fraction
upload.update({ status: 'done' });
```

`open`, `info`, `success`, `warn`, `error` return a synchronous `NgxMatNotificationRef` with `id`, `update(changes)` and `dismiss()`. `task(options)` returns the same handle. The service also exposes `update(id, changes)`, `dismiss(id)`, `dismissAll()` and a readonly `notifications` signal. An unknown/dismissed handle update is a no-op. IDs supplied again replace that notification in its existing stack position and restart its duration; new IDs prepend. Task updates merge fields and restart the duration. IDs cannot be changed by updates.

Info/success/open default to 2000ms; warn/error remain visible. Tasks default to 1000ms after `done`; queued, wip and error never expire. Explicit null/nonpositive durations remain visible. Hover and keyboard focus pause expiration, including when a hovered running task completes. Dismissal and service destruction clear timers and dispose only this service's overlay. Server-side calls update state without creating overlays or timers.

Text is interpolated by default. `html: true` enables Angular's normal HTML sanitization for message, info and error. No trust bypass is used. Applications remain responsible for selecting appropriate content. Localized `closeLabel` and `progressLabel` can also be set per notification.

The exported `NgxMatNotificationsComponent` can be used independently with `notifications` and optional `countdowns` signal inputs and `dismiss`, `pause`, `resume` outputs; it does not own timers.

## Styling

Public CSS custom properties inherit into the overlay from the document root:

- `--ngx-mat-notification-width` (360px), `--ngx-mat-notification-gap` (16px), `--ngx-mat-notification-radius` (5px), `--ngx-mat-notification-padding` (8px), `--ngx-mat-notification-font`, `--ngx-mat-notification-shadow`.
- `--ngx-mat-notification-background`, `--ngx-mat-notification-info`, `--ngx-mat-notification-success`, `--ngx-mat-notification-warn`, `--ngx-mat-notification-error`.
- Shared fallbacks: `--ngx-mat-extended-gap`, `--ngx-mat-extended-radius`, `--ngx-mat-extended-padding`, `--ngx-mat-extended-surface`, `--ngx-mat-extended-primary`, `--ngx-mat-extended-success`, `--ngx-mat-extended-warning`, `--ngx-mat-extended-error`, then Material system tokens.

Per-notification `color` sets `--ngx-mat-notification-accent`. Width/height are constrained to the viewport and the stack scrolls. Position is configured using `NGX_MAT_NOTIFICATION_CONFIG`. No MatSnackBar instance or application HTTP/session policy is involved.
