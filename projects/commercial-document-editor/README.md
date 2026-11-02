# Commercial document editor

`@eherve/angular-material-commercial-document-editor` provides one standalone
`CommercialDocumentEditorComponent` (`ngx-mat-commercial-document-editor`) and
`CommercialDocumentEditorModule`. Import either in Angular 22 applications.

The component owns the outlined card, root/child panel shell, ordering/removal
actions and document totals. Applications own forms, validation, calculations,
source locks and mutations. Prices are displayed exactly as supplied. IDs must
be unique among siblings and stable through recalculation; panels are tracked by
ID to preserve expansion and projected form DOM.

## Inputs and events

`nodes` accepts `CommercialDocumentEditorNode<T>[]`: `id`, `title`, `data`, optional
`amounts`, `quantity`, `children`, `readOnly`, `canRemove`, `canMove`.
`moveNode` emits `{node,parent,direction: -1 | 1}`; `removeNode` emits
`{node,parent}`. Root parent is `null`. Document, parent and node read-only guards
block actions. Consumers remain responsible for mutation authorization.

Optional inputs: `title`, `emptyLabel`, `readOnly`, `embedded` (remove outer
padding), `pricing`, `discountControl`, `showDiscounts`, `discountHistory`,
`warning`, `locale` (default `fr`), `currency` (default `EUR`),
`amountScopeLabel` (default `document`). Register Angular locale data in the host
for the selected locale. `pricing` uses the exported
`CommercialDocumentPricing` contract: already calculated gross, line/global/total
discounts, subtotal, final HT/VAT/TTC and VAT breakdown. No calculator is included.
The optional reactive `discountControl` stays owned by the application; the
component never changes its disabled state. Read-only/disabled controls show a
value instead of an input. `showDiscounts=false` displays only HT/VAT/TTC.
`discountHistory` is an ordered array of `{author?:string,date:Date|string|number}`;
the last entry is shown. Warning text remains visible without discount columns.

`editorTemplate`, `nodeFooterTemplate` and `nodeHeaderExtraTemplate` accept
`TemplateRef<CommercialDocumentEditorContext<T>>`. Their context is
`{$implicit:node,node,data:node.data,parent,readOnly}`. Use `let-node`,
`let-data="data"`, `let-parent="parent"`, `let-readOnly="readOnly"`.
The footer appears after node editor fields and before expandable child nodes.
It aligns its content to the right and receives every node; consumers can show root-only add menus using
`parent === null`. `toolbarTemplate` receives `{readOnly}`. Consumer action
buttons must bind this read-only value. Header extras sit beside the expansion
header so their interactive controls are not nested in its toggle button.
Reserve enough header action space with the token below for wider extras.

## Theme

Styles inherit the existing `--ngx-mat-extended-*` foundations:
`space-2` (8px), `radius` (8px), `surface`, `surface-selected`, `border`, `text`,
and `muted`. Component-specific public tokens:

| Token suffix after `--ngx-mat-extended-commercial-document-` | Default |
| --- | --- |
| `accent` | foundation text color |
| `warning` | `#a56800` |
| `danger` | `#ba1a1a` |
| `actions-width` | `136px` |

Set tokens on the editor or an ancestor. Material styling uses public Sass
component overrides. Totals adapt to two columns below 960px and place the
remise block first below 600px. Application field grids belong to projected
editors and should use the application's existing compact field conventions.
