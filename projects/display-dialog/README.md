# Angular Material Display Dialog

Generic record consultation with Angular Material, using `@eherve/angular-material-section-tabs` for declarative content. Requires Angular/Material/CDK 22 and RxJS 7.8.

```sh
npm install @eherve/angular-material-display-dialog @eherve/angular-material-section-tabs
```

Import `DisplayDialogModule` in your Angular module (also supported in standalone imports), provide Angular Material animations, and include the distributed overlay stylesheet in global styles:

```css
@import '@eherve/angular-material-display-dialog/styles.css';
```

```ts
import { DisplayDialogService, DisplayDialogData } from '@eherve/angular-material-display-dialog';

const data: DisplayDialogData<{name: string}> = {
  record: {name: 'Example'},
  title: record => record.name,
  displayOptions: {
    section: {
      id: 'main', label: 'Details', cards: [{
        id: 'identity', label: 'Identity',
        fields: [{kind: 'text', label: 'Name', path: 'name'}],
      }],
    },
  },
  actions: [{
    label: 'Refresh', position: 'top',
    handle: async context => context.setRecord(await fetchRecord()),
  }],
};
const ref = displayDialogService.open(data);
ref.afterClosed().subscribe(result => console.log(result));
```

Supply exactly one of `record` or `loadRecord: () => Promise<T> | Observable<T>`. Only the first Observable value is consumed. Empty loaders use `emptyLabel`; rejected loaders use `errorLabel`. `loadingLabel`, `closeLabel`, `showCloseButton` and `showJsonDataButton` customize the surrounding UI. JSON is opt-in; application permissions belong to the caller. `DisplayDialogIntl` is injectable and supplies default labels.

Four root modes are supported: `{section}` (one page), `{sections}` (section navigation), `{tabs: [{label, displayOptions}]}` (root tabs) and `{component, input?, overflow?}`. Keep the hierarchy **section → cards → fields**. `showEmptyFields`, `showEmptyFieldsToggle` and `showEmptyFieldsLabel` work in section modes. Card and field components follow the section-tabs contract. Content components receive declared `record`, `data`, `displayOptions` inputs and any declared custom inputs; inputs may be calculated from the current record. HTML labels use Angular sanitization.

Global button actions use `handle(context)`; card actions retain `handler(context)` and `menuHandler(optionId, context)`. Positions are `top`, `bottom` (default), `bottom-end`. Visibility and disabled predicates use the current record. `confirm` accepts a message or `{title?, message, ok?, cancel?}`. Cancellation performs no action. Rejections preserve the record, keep the dialog open, restore interaction and report through Angular `ErrorHandler` plus a generic error message. Handlers own business writes. `setRecord(record)` updates titles, content, actions and connection callbacks; `close(result)` and `closeOnHandle` preserve the exact result object.

Component actions use `{component, position?, input?}`. Inputs are filtered to declared Angular inputs and recalculated after record changes. They receive automatic `record` and `data` when declared.

Each opening can create application integration state using `connect`:

```ts
connect: () => {
  const binding = createApplicationBinding();
  return {
    actions: [{component: ApplicationAction, position: 'top', input: ({record}) => ({record, binding})}],
    recordChanged: record => binding.update(record),
    destroy: () => binding.destroy(),
  };
}
```

The factory runs once per initialization before loading. Configuration actions precede connection actions, with no mutation of the configuration. Every replaced/destroyed connection is cleaned once, including loader failures. Stale results and callbacks after destruction are ignored. Connection callback failures are reported without interrupting cleanup. URL, permissions and application context integrations belong here; no Router or application service is required by this package.

`DISPLAY_DIALOG_HOST` has a working default backed by MatDialog for confirmations and escaped JSON text. Override it only to integrate application UI:

```ts
{provide: DISPLAY_DIALOG_HOST, useExisting: ApplicationDisplayDialogHost}
// confirm(options: DisplayDialogConfirmOptions): Promise<boolean>
// showJson(title: string, sources: readonly DisplayDialogJsonSource[]): void
// Each source has {label, value}.
```

The second `open` argument accepts Material configuration and `nested`. Standard dimensions are `90vw` × `90vh` with matching maxima, `autoFocus:false`, `restoreFocus:false` and panel class `display-dialog-panel`. Nested dialogs use parent dimensions minus 64px, minimum 640×480px, constrained by viewport minus 16px on each side. Override these via `{nested:{inset,minWidth,minHeight,viewportMargin}}`, disable with `{nested:null}`, or supply explicit width/height/maxWidth/maxHeight (individually higher priority).

For embedded rendering, use `<app-display-dialog [data]="data" />` after importing `DisplayDialogModule`; no MatDialogRef is required.

## Theme variables

Set these properties on a common ancestor such as `:root`, on a dialog overlay ancestor, or directly on an embedded `app-display-dialog`. The package uses independent defaults and does not require application CSS variables.

| Public property | Default | Purpose |
| --- | --- | --- |
| `--ngx-mat-display-dialog-primary` | `#0f334d` | Primary text, icons and default action background |
| `--ngx-mat-display-dialog-background` | `#f4f6f8` | Content background |
| `--ngx-mat-display-dialog-text` | `#102f49` | Main text |
| `--ngx-mat-display-dialog-muted` | `#61718a` | Empty-state and secondary text |
| `--ngx-mat-display-dialog-border` | `rgba(14, 43, 67, 0.12)` | Header and footer borders |
| `--ngx-mat-display-dialog-header-background` | `#e9eef2` | Header background |
| `--ngx-mat-display-dialog-header-text` | `#102f49` | Header text and icons |

## Runtime translations

`DisplayDialogIntl` exposes `messages: DisplayDialogMessages` and `readonly changes: Subject<void>`. The dictionary is fully typed without an open index signature. Replace or update messages, then emit `changes.next()` to refresh existing dialogs, including loading, empty, load-error, action-error and close labels. Explicit configuration labels remain unchanged. The default confirmation host also updates its default title/buttons while open, and the JSON view updates its close button. Explicit confirmation labels and caller-provided JSON titles/source labels remain owned by their caller. Subscriptions are released on component destruction.

```ts
const intl = inject(DisplayDialogIntl);
intl.messages = {...intl.messages, loadingLabel: 'Loading data', closeLabel: 'Close'};
intl.changes.next();
```

All message keys and French defaults:

| Key | Default |
| --- | --- |
| `loadingLabel` | `Chargement des données` |
| `closeLabel` | `Fermer` |
| `emptyLabel` | `Aucune donnée à afficher.` |
| `errorLabel` | `Impossible de charger les données.` |
| `actionErrorLabel` | `Impossible d’exécuter cette action.` |
| `jsonTitle` | `Données JSON` |
| `jsonButtonLabel` | `Afficher les données JSON` |
| `recordLabel` | `Record` |
| `confirmTitle` | `Confirmation` |
| `confirmOk` | `Oui` |
| `confirmCancel` | `Non` |
| `emptyContentLabel` | `Aucun contenu à afficher.` |

The host receives the caller's confirmation options with optional labels intact. Its default Material implementation applies the Intl defaults; an application host may supply its own translated defaults.

## Inherited theme contract

Declare these optional CSS custom properties on an ancestor (including an overlay container when needed). The components do not declare common tokens on their hosts, so changing an ancestor updates existing instances without changing their inputs.

| Token | Standalone default / role |
| --- | --- |
| `--ngx-mat-extended-space-1` | `4px`, small spacing |
| `--ngx-mat-extended-space-2` | `8px`, compact surface padding and control spacing |
| `--ngx-mat-extended-space-3` | `16px`, group and default grid gaps |
| `--ngx-mat-extended-space-4` | `24px`, larger separation |
| `--ngx-mat-extended-space-5` | `32px`, reserved larger separation |
| `--ngx-mat-extended-radius` | `8px`, surface corners |
| `--ngx-mat-extended-surface` | Surface background, with the component's existing standalone color fallback |
| `--ngx-mat-extended-surface-hover` | Hover background |
| `--ngx-mat-extended-surface-selected` | Selected / highlighted background |
| `--ngx-mat-extended-border` | Surface separators and outlines |
| `--ngx-mat-extended-border-selected` | Selected outline |
| `--ngx-mat-extended-text` | Main text |
| `--ngx-mat-extended-muted` | Secondary text and icons |

Existing package-specific public color variables take precedence over the corresponding common role, which takes precedence over the standalone fallback. Action-specific colors keep their priority. Tokens only affect spacing and appearance: functional dimensions, circular controls and pill shapes remain unchanged. Material components inherit their theme; renderer headings use public Material typography roles with standalone fallbacks.

Omitting a section/card grid `gap` uses `var(--ngx-mat-extended-space-3, 16px)`. An explicit value such as `12px` is retained. Responsive grids read the computed column gap when calculating available tracks and item widths.
