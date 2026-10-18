# @eherve/angular-material-organigram

Angular 22 template-driven organization trees with lazy branches, multi-row connectors,
keyboard activation, drag scrolling and ancestor highlighting.

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
