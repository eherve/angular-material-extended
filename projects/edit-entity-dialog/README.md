# Angular Material edit entity dialog

Standard page/modal editing using `@eherve/angular-material-forms`.

Import `EditEntityDialogService`, `EditEntityComponent`, `EditEntityDialog` or `EditEntityDialogModule` from `@eherve/angular-material-edit-entity-dialog`. Configuration types, form classes, shared internationalization, logger and feedback contracts now live in `@eherve/angular-material-forms/core`; individual/configured controls live in `forms/fields`, reusable cards/content in `forms/layout`.

```ts
import { EditEntityDialogService } from '@eherve/angular-material-edit-entity-dialog';
import { EditEntityComponentOptions } from '@eherve/angular-material-forms/core';
```

Existing options, callbacks, connection lifecycle, navigation, save/close results and modal sizing configuration are preserved. `EditEntityComponent` exposes `formGroup`, `create`, `update`, `remove`, `archive`, `markComponentUpdated`, `refreshPresentation`, `submitFromKeyboard` and `requestClose`; these delegate to its single per-instance `session`.

Creation wizard entry points now live exclusively in `@eherve/angular-material-entity-wizard`. Neither host imports the other. Include the shared `@eherve/angular-material-forms/styles.css` stylesheet once. See [forms composition](../forms/README.md) for direct field/card templates.

Version `22.7.0` extracts shared contracts and renderers to `@eherve/angular-material-forms` and creation flows to `@eherve/angular-material-entity-wizard`. Configuration objects keep their shape; consumers must migrate imports to their canonical package.
