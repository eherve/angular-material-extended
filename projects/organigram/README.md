# @eherve/angular-material-organigram

Angular 22 template-driven organization trees with lazy branches, multi-row connectors,
keyboard activation, drag scrolling and ancestor highlighting.

The package also provides a separate multi-parent renderer for directed acyclic graphs (DAGs).

## Installation

```sh
npm install @eherve/angular-material-organigram
```

Import standalone `OrganigramComponent`, or `OrganigramModule` in an NgModule.
Configure Angular animations (`provideAnimations()` or `BrowserAnimationsModule`);
tests may use `NoopAnimationsModule`. Angular Core/Common/Animations 22 are peers.
The library requires no application model, router, Material theme, lodash or UUID package.

```ts
import { Component } from '@angular/core';
import { OrganigramComponent, OrganigramTreeNode } from '@eherve/angular-material-organigram';

@Component({
  selector: 'example-tree',
  imports: [OrganigramComponent],
  template: `
    <app-organigram [tree]="tree" [nodeTmpl]="card" hideRoot />
    <ng-template #card let-node="node"><div class="card">{{ node.entity?.name }}</div></ng-template>
  `,
})
export class ExampleTree {
  readonly tree = new OrganigramTreeNode<{ name: string }>({
    type: 'root', children: [{ type: 'team', entity: { name: 'Team' } }],
  });
}
```

Style your projected `.card` yourself. The renderer owns connectors and spacing only.

## Public API

- `tree`: a structural `OrganigramNode<T>`, `OrganigramTreeNode<T>`, null or undefined.
- `nodeTmpl`: Angular template receiving `{ node: OrganigramTreeNode<T> }`.
- `hideRoot`: attribute or boolean; false restores the root.
- `click`: optional async `(node) => Promise<unknown>` fallback action.

`OrganigramNode<T>` has `type`, optional `entity`, `children`, `hasChildren`,
`hideChildren`, `selected` and `onClick`. Existing structural objects are accepted.
`OrganigramTreeNode<T>` adds generated unique `id`, `parent`, `depth`, immutable
`addChild` and `getParent(index = 0)`. Positive indices walk from the nearest parent;
negative indices start at the root (-1). Wrapping input does not mutate it.
Entity data is retained by reference; callers own its immutability.

A node `onClick` takes precedence over `click`. It may return children to append and
open, an empty array to finish as a leaf, or void when it handles visibility itself.
The host owns API calls and caching: loaded callbacks should toggle their branch
rather than return the same children again. `hasChildren` advertises unloaded children.
Only one action per node runs at a time. Rejections show local retry UI. Replacement
and destruction ignore late results; already-started network requests are not aborted.
Root loading, filtering, root-error handling and preserving root state belong to the host.

Enter/Space activate focused nodes. Projected buttons, links, inputs and checkboxes keep
their interactions. Mouse movement below five pixels remains a click; dragging suppresses
activation and releases outside the chart. Scrolling runs after Angular rendering.
Hover colors only the original ancestor connectors, with layout-aware horizontal segments.

## Theme and messages

Set these CSS variables on `app-organigram` or an ancestor:

| Token | Default |
| --- | --- |
| `--ngx-mat-organigram-node-width` | `200px` |
| `--ngx-mat-organigram-connector` | `#09293c` |
| `--ngx-mat-organigram-highlight` | `#e73452` |
| `--ngx-mat-organigram-focus` | `#09293c` |
| `--ngx-mat-organigram-error` | `#e9396b` |

Card width must be a CSS length, such as `250px`. Five children are grouped per row.
Messages are French by default. Inject `OrganigramIntl` and update its `messages` signal:

```ts
intl.messages.set({ loadError: 'Loading failed.', retry: 'Retry' });
```

## Multi-parent graphs

Import standalone `OrganigramGraphComponent`, or use `OrganigramModule`. Supply flat arrays with globally unique node IDs and explicit directed edges. Each node is rendered once, including nodes reached through several parents. Existing tree APIs remain available for hierarchical organigrams.

```ts
import { OrganigramGraphComponent, OrganigramGraphNode, OrganigramGraphEdge } from '@eherve/angular-material-organigram';

readonly nodes: OrganigramGraphNode<{ name: string }>[] = [
  { id: 'planned', entity: { name: 'Planifiée' } },
  { id: 'alice', entity: { name: 'Alice' } },
  { id: 'bob', entity: { name: 'Bob' } },
  { id: 'finished', entity: { name: 'À finaliser' } },
];
readonly edges: OrganigramGraphEdge[] = [
  { source: 'planned', target: 'alice' },
  { source: 'planned', target: 'bob' },
  { source: 'alice', target: 'finished' },
  { source: 'bob', target: 'finished' },
];
```

```html
<app-organigram-graph [nodes]="nodes" [edges]="edges" [nodeTmpl]="card" />
<ng-template #card let-node="node"><article>{{ node.entity?.name }}</article></ng-template>
```

Graph inputs:

- `nodes`: readonly `OrganigramGraphNode<T>[]`; `id` is required, `entity`, `label`, `type`, `selected` and `order` are optional. `label` supplies the accessible node name. `order` is a finite numeric rank key when ordered ranking is enabled.
- `edges`: readonly `OrganigramGraphEdge[]`; `source` and `target` are node IDs. Optional `id` supplies the stable edge identity; otherwise the endpoint pair identifies it. Parallel duplicate links are rejected.
- `nodeTmpl`: required template receiving `{ node }`. Layout nodes also expose their measured `width`, `height`, `x` and `y`.
- `options`: `OrganigramGraphOptions`, with `direction` (`TB` default; `BT`, `LR`, `RL` supported), `rankBy` (`topology` default or `order`), `nodeWidth` (250), initial `nodeHeight` (64), `horizontalGap` (40), `verticalGap` (36), and `margin` (16), all dimensions in CSS pixels.
- `ariaLabel`: accessible graph-region name, default `Graphe`.

`nodeClick` emits the node on direct click or Enter/Space. Projected controls keep their own events. DOM and keyboard order follow the configured graph direction from sources to sinks. Hover and keyboard focus highlight all incoming ancestor paths. Dragging blank space scrolls the graph; native scroll and touch scrolling remain available. Set a height or max-height on the component to constrain its viewport.

Dagre computes the layout; SVG draws the connectors behind the Angular cards. ResizeObserver updates placement when a card's content or width changes. The renderer retains card DOM by node ID during immutable updates and data reorder. It never mutates supplied nodes or edges. Node IDs must remain globally unique in the supplied graph; change them when switching unrelated datasets.

Use `rankBy: 'order'` to place all nodes in ascending `order`, including nodes on separate branches. Every node must supply a finite number; use an event timestamp or a chronological sequence number. Each node gets a successive rank with the usual spacing, regardless of the numeric difference between orders. Links must not point from a greater order to a smaller one. Linked nodes with equal orders retain dependency order; other ties use node IDs. Ordering constraints influence placement but do not create rendered links or alter the supplied graph.

The graph shares the organigram connector/highlight/focus/error color tokens and `--ngx-mat-organigram-node-width`. CSS width overrides are measured before the next layout. Custom cards own their appearance and tooltip behavior.

Invalid node/edge IDs, duplicates, missing endpoints, self links, cycles, invalid orders and invalid dimensions produce an accessible error and clear the previous graph. The component's readonly `error()` signal exposes the diagnostic; validation errors are `OrganigramGraphError` with a `code`. Corrected inputs recover automatically. Empty inputs show a configurable empty message. Inject `OrganigramGraphIntl` and replace its `messages` signal (`empty`, `invalidGraph`) to localize these states.

Graph data is declarative. Loading, editing and application state are owned by the host. The graph component has no tree-collapse or lazy-child mutation API.

`layoutOrganigramGraph(nodes, edges, options?, sizes?)` and `collectOrganigramAncestorEdges(edges, nodeId)` are also exported for framework-independent layout and ancestor queries. The layout helper returns positioned node copies, SVG paths and canvas dimensions.

## Development

From the angular-material-extended repository (supported Angular CLI Node.js version):

```sh
npm run test:organigram:model
npm run test:organigram
npm run build:organigram
```

The model tests use Node's native TypeScript stripping. Browser specs use Jasmine/Karma
and cover asynchronous actions, rendered templates, multi-row layout and connector highlighting.
README and CHANGELOG are included in the built npm package.

### Incremental structural updates

Supply a stable `key` on the root and each node (unique among siblings). When a new input tree has the same root key, nodes with matching sibling keys retain their identity and DOM; only inserted or removed nodes enter or leave. Omitting keys retains replacement semantics. Keep a root key scoped to the current dataset/account, and change it when switching datasets. A node moved under another parent is recreated in its new branch.
