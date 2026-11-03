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

Native color and free tags fields use structural values without application models:

```ts
import { ColorFormField, TagsFormField } from '@eherve/angular-material-forms/core';

const colorField: ColorFormField<{ _id?: string }> = {
  kind: 'color', name: 'color', label: 'Color', required: true,
  defaultValue: { hex: '#2196f3', contrast: '#ffffff' },
};
const tagsField: TagsFormField<{ _id?: string }> = {
  kind: 'tags', name: 'tags', label: 'Tags', defaultValue: [],
  options: [{ name: 'Summer', value: 'Summer' }],
};
```

Both work through `ame-field`, cards, editor sessions and wizard hosts. Color stores `ColorValue | null` (`{ hex: string; contrast: string }`), uses the bundled palette by default, and accepts `colors?: string[][]`. `inline: true` displays an icon menu trigger with palette and contrast choices. Normal mode displays a form field with a clear action. Tags store `string[]`, trim new entries, and prevent case/accent-insensitive duplicates. Configured tags `options` accepts the existing option array, Observable, or `(record, formGroup) => options` contract; functions refresh when the form changes.

Import `FormControlColorComponent` and `FormControlTagsComponent` from `@eherve/angular-material-forms/fields` for standalone usage:

```html
<ame-color-picker [formControl]="colorControl" label="Color" />
<ame-color-picker [control]="colorControl" [inline]="true" label="Color" />
<ame-tags-input [formControl]="tagsControl" [options]="tagOptions$" label="Tags" />
```

Use either `[control]` or the standard Angular forms binding (`formControl`, `formControlName`, `ngModel`). Both controls accept `label`, `required`, `disabled` and `appearance` (`outline` by default). Standalone tags `options` accepts an option array or any Observable of `IFormControlSelectOption<string>[]`. Replacing controls/options disconnects old subscriptions; external resets update the rendered value. Edits copy objects and arrays rather than mutating caller values. Tags allow free input even when there are no suggestions; Enter selects the active suggestion and otherwise adds the typed tag.

`ButtonSelectComponent` (`ame-button-select`, from `@eherve/angular-material-forms/fields`) is a standalone CVA for compact button choices. It displays the selected item's HTML label on a stroked button and opens a connected overlay of raised buttons for the other items. Selection updates Angular Forms and marks the parent touched/dirty; disabled controls cannot open or select. Escape/outside click closes the overlay. Focus moves into the choices and returns to the trigger when the overlay closes.

```ts
import { ButtonSelectComponent, ButtonSelectItem } from '@eherve/angular-material-forms/fields';

readonly widths: ButtonSelectItem<string>[] = [
  { value: '50%', label: '50%' },
  { value: '100%', label: '100%' },
];
```

```html
<ame-button-select [(ngModel)]="width" [items]="widths" ariaLabel="Chart width" />
```

It also supports `formControl`/`formControlName`, `disabled`, and the existing trigger `color` attribute. `ButtonSelectItem<TValue>` keeps option values typed; external writes and resets update the selected label. Labels use Angular's sanitized HTML binding. This standalone button control has no configured field kind.

`FormControlAutocompleteComponent<TValue>` (`app-form-control-autocomplete`) also works directly with Angular Forms (`formControl`, `formControlName`, `ngModel`) or an explicit `[control]`. Use the exported `FormControlAutocompleteService<TValue>` contract: `display(value)` returns `{name, prefix?, color?, prefixColor?}`, `search(limit, skip, normalizedSearch, selected?)` returns a Promise of `{data, matchCount}`; optional `group` is a property path or callback and `open(value)` opens the selected item. `FormControlAutocompleteFieldValueType<TValue>` is the nullable/optional value union used by domain wrappers. Business filtering, selected-item loading and persistence stay in the host.

```html
<app-form-control-autocomplete
  [formControl]="customerControl"
  [service]="customerService"
  label="Customer"
  required
/>
```

Inputs include `label`, `hint`, `placeholder`, `multiple`, `limit` (10), `appearance` (`outline`), boolean `required`/`disabled`/`no-subscript`, `value` for externally synchronized writes, `panelWidth` (`375px`) and `panelMinHeight` (0). Names and prefixes use Angular-sanitized HTML; display colors apply to both options and selections. Multiple standalone autocomplete uses wrapping draggable chips; `selectionLayout="rows"` chooses rows. Existing configured autocomplete adapters explicitly retain their row presentation and fill appearance for multiple selection; sortable lists retain rows. Search normalization, grouping, incremental paging, entity-ID deduplication, stale-response cancellation and retry reuse the same shared search engine. External control replacement disconnects the old control without replacing the caller's form identity. Required inputs compose with existing validators, and direct wrapper writes using `emitEvent:false` can refresh through the existing `value`/`disabled` inputs.

Single autocomplete selections retain their displayed prefix and open suffix action; grouped results render sanitized HTML headings.
