# Angular Material forms

Reusable configured fields, cards and editing sessions. Hosts supply business callbacks; shared forms have no dependency on edit-dialog, entity-wizard or application models.

- `@eherve/angular-material-forms/core`: canonical configuration/runtime types, form classes/building, conditional rendering, submission, internationalization, feedback/logger contracts.
- `@eherve/angular-material-forms/fields`: standalone configured `FormFieldComponent` (`ame-field`) and individual controls.
- `@eherve/angular-material-forms/layout`: `FormCardComponent` (`ame-field-card`), recursive `FormContentComponent` (`ame-form-content`) and `FormRenderContext`.
- `@eherve/angular-material-forms/editor`: one `EntityFormSession` per host, neutral `EntitySavePolicy`, feedback integration and `EntityDialogLauncher`.

Include `@eherve/angular-material-forms/styles.css` once for the shared modal surface styling.

```ts
import { EditEntityFormControl, EditEntityFormGroup, EditEntityCard } from '@eherve/angular-material-forms/core';
import { FormFieldComponent } from '@eherve/angular-material-forms/fields';
import { FormCardComponent } from '@eherve/angular-material-forms/layout';

readonly form = new EditEntityFormGroup({
  name: new EditEntityFormControl('Ada'),
  city: new EditEntityFormControl('Paris'),
  email: new EditEntityFormControl('ada@example.com'),
});
readonly identity: EditEntityCard = { id: 'identity', label: 'Identity', fields: [{ kind: 'text', name: 'name', label: 'Name' }] };
readonly address: EditEntityCard = { id: 'address', label: 'Address', fields: [{ kind: 'text', name: 'city', label: 'City' }] };
readonly email = { kind: 'text' as const, name: 'email', label: 'Email' };
```

```html
<ame-field-card [card]="identity" [formGroup]="form" [record]="record" />
<ame-field-card [card]="address" [formGroup]="form" [record]="record" />
<ame-field [field]="email" [formGroup]="form" [record]="record" />
```

The caller owns the controls and destroys the form. Cards do not build controls, create a form element, save records or close a host. All rendered fields retain the caller's form identity. Conditional visibility, validation summaries, folding and configured component inputs reuse the shared renderer. Replacing `card`, `formGroup` or `record` refreshes a standalone card and disconnects the previous form subscriptions.

Standalone cards emit `actionRequested` with the configured business action context; the caller decides how to execute it. Component-managed changes call the supplied `markUpdated` callback, which emits `updated`. An optional `context: FormRenderContext` delegates card actions/folding to an editor session instead. `runtimeCard` is the already prepared runtime representation used by `ame-form-content`; ordinary direct consumers only need `card`, `formGroup` and optional `record`.

`EntityFormSession` owns initialization, options connection, cancellation, form lifecycle, stale-operation guards, close confirmation and accumulated results. Provide it and the core form services at the editor component, never at root. Standard edit uses the default full-form persistence; entity-wizard supplies a scoped policy to the same mutation executor. Shared content/card rendering consumes the session through `FormRenderContext`, without importing the editor layer.

Direct `ame-field` and configured cards honor boolean, callback and Observable visibility without changing controls. The caller must create controls and install validators: use `EditEntityFormBuilderService.buildFormGroup` for configured required/disabled/unique/date rules and value hooks, or supply equivalent reactive-form controls/validators explicitly. Rendering a field or card does not build or validate its parent form.
