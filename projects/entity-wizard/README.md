# Angular Material entity wizard

Independent creation wizard using the shared forms session and renderers. This package has no dependency on edit-entity-dialog.

```ts
import { CreateEntityWizardService, createEntityWizardOptions, CreateEntityWizardComponentOptions } from '@eherve/angular-material-entity-wizard';

const options = createEntityWizardOptions({
  title: 'Create',
  steps: [{ id: 'main', label: 'Main', displayOptions: { section: { id: 'main', label: '', cards: [] } } }],
  service: { create: async value => ({ _id: 'created', ...value }) },
});
wizard.open(options);
```

`CreateEntityWizardComponentOptions<TRecord>` extends the canonical `EditEntityComponentOptions<TRecord>` from `@eherve/angular-material-forms/core` with `wizard`. The normalization helper retains the established wizard configuration shape and options identity when opened. Standard edit options contain no wizard property.

Each wizard owns one shared `EntityFormSession`; changing a step does not replace the form. Its scoped save policy projects only current-step and always-in-upsert fields, preserves other-step drafts during server hydration, blocks navigation during saves or pending validation and accumulates created/updated results. Component-managed steps use the supplied `markUpdated` callback. The independent modal wrapper retains top-dialog keyboard and focused-input key ownership behavior.

Include `@eherve/angular-material-forms/styles.css` once. Public `EntityWizardComponent` supports page or modal display, and `CreateEntityWizardService` opens its own `EntityWizardDialog`. Version `22.0.0` requires `@eherve/angular-material-forms@^22.0.0` and has no dependency on edit-dialog.
