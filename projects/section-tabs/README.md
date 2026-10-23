# Angular Material Section Tabs

```sh
npm install @eherve/angular-material-section-tabs
```

Import `SectionTabsModule` in the host NgModule (or standalone component imports). Configure Angular animations in the host with `provideAnimations()` or `BrowserAnimationsModule`; tests can use `NoopAnimationsModule`. Angular, animations, Material/CDK 22 and RxJS 7.8 are peers. No Router provider is needed.

## Declarative display

`SectionTabsDisplayComponent` (`app-section-tabs-display`) renders configured sections, cards and fields. Its public configuration interfaces are exported from the package root.

```ts
import {
  SectionTabsDisplayOptions,
  SectionTabsModule,
} from '@eherve/angular-material-section-tabs';

const display: SectionTabsDisplayOptions = {
  data: { name: 'Example', count: 0 },
  sections: [{
    id: 'details',
    label: 'Details',
    cards: [{
      id: 'general',
      label: 'General',
      grid: { columns: 2, gap: '12px', minColumnWidth: '220px' },
      fields: [
        { kind: 'text', label: 'Name', path: 'name' },
        { kind: 'number', label: 'Count', path: 'count', decimal: 0 },
      ],
    }],
  }],
};
```

```html
<app-section-tabs-display
  [options]="display"
  queryParamKey="record-sections"
  [(selectedIndex)]="selectedIndex">
</app-section-tabs-display>
```

Configuration supports `columns`, `gap`, `minColumnWidth`, card and field spans and breaks, completion counters, label actions, card actions, chips, and custom field or card components. Custom component inputs are filtered to inputs declared by that component. `sectionMode: 'single-card'` makes cards fill and scroll within the section. Falsy values such as `0` and `false` count as filled; empty strings are treated as empty and can be revealed with `showEmptyFields` or its toggle.

HTML labels and values are bound through Angular's `innerHTML` sanitization. Ordinary strings remain sanitized; hosts may intentionally pass `SafeHtml`. The library does not bypass Angular sanitization.

## Optional selection synchronization

`queryParamKey` and each section's `queryParamValue` are group and stable-value identifiers; they do not cause URL navigation. The optional `SectionSelectionHandler` provider synchronizes state. Without a handler, sections work locally.

```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  SECTION_SELECTION_HANDLER,
  SectionSelectionHandler,
} from '@eherve/angular-material-section-tabs';

@Injectable({ providedIn: 'root' })
export class MemorySectionSelectionHandler implements SectionSelectionHandler {
  private readonly groups = new Map<string, BehaviorSubject<string | null>>();
  private group(key: string): BehaviorSubject<string | null> {
    let group = this.groups.get(key);
    if (!group) {
      group = new BehaviorSubject<string | null>(null);
      this.groups.set(key, group);
    }
    return group;
  }
  observe(key: string): Observable<string | null> {
    return this.group(key).asObservable();
  }
  select(key: string, value: string): void {
    this.group(key).next(value);
  }
}

// In application providers:
// { provide: SECTION_SELECTION_HANDLER, useExisting: MemorySectionSelectionHandler }
```

`observe(key)` emits the initial state and later changes. A null or unknown external value keeps the current safe local choice. External changes never trigger writes. Values must be unique within a group; duplicates are a configuration error. The component releases subscriptions when its key changes or it is destroyed. Handler errors are sent to Angular's `ErrorHandler` while local selection stays available. Handlers that persist state asynchronously should serialize their writes.

## Styling and translations

Styles retain the source `section-tabs-display__*` classes and use the `app-section-tabs-display` host selector. Section tabs provide `--ngx-mat-section-tabs-primary`, `--ngx-mat-section-tabs-background`, and `--ngx-mat-section-tabs-text` defaults. Display chips use `--ngx-mat-section-tabs-display-primary` and `--ngx-mat-section-tabs-display-background`.

`SectionTabsIntl.messages` is a complete typed dictionary for fixed labels. Defaults are `sections: 'Sections'`, `emptySections: 'Aucune section à afficher'`, `emptyComponents: 'Aucun composant configuré'`, `emptyFields: 'Aucun champ renseigné'`, `emptyFieldsDescription: "Activez l'affichage des champs vides pour voir les informations attendues."`, and `showEmptyFields: 'Afficher les champs vides'`. Replace messages and emit `changes` to refresh an existing view; an explicit `showEmptyFieldsLabel` option remains in effect. `sections` is the accessible navigation label.

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
| `--ngx-mat-extended-surface` | Surface background and selected empty-fields toggle handle, with existing standalone fallbacks |
| `--ngx-mat-extended-surface-hover` | Hover background |
| `--ngx-mat-extended-surface-selected` | Selected / highlighted background |
| `--ngx-mat-extended-border` | Surface separators and outlines |
| `--ngx-mat-extended-border-selected` | Selected outline |
| `--ngx-mat-extended-accent` | Selected empty-fields toggle track and interaction color; falls back to Material primary |
| `--ngx-mat-extended-text` | Main text |
| `--ngx-mat-extended-muted` | Secondary text and icons |

Existing package-specific public color variables take precedence over the corresponding common role, which takes precedence over the standalone fallback. Action-specific colors keep their priority. Tokens only affect spacing and appearance: functional dimensions, circular controls and pill shapes remain unchanged. Material components inherit their theme; renderer headings use public Material typography roles with standalone fallbacks.

Omitting a section/card grid `gap` uses `var(--ngx-mat-extended-space-3, 16px)`. An explicit value such as `12px` is retained. Responsive grids read the computed column gap when calculating available tracks and item widths.

Readonly field grids use borderless cells with compact padding and an 8px inherited spacing-token inset, preserving configured gaps and responsive spans. The empty-fields toggle uses a compact 40×24px visual track while retaining Material’s 48px touch target. Its selected track and checkmark inherit the accent token; the selected handle uses the surface token in normal, focus, hover and pressed states.

`--ngx-mat-section-tabs-background` controls the section container. Set `--ngx-mat-section-tabs-card-background` separately for sidebar and content cards (for example, white cards on a gray container). Cards fall back to the existing section background, then `--ngx-mat-extended-surface`, then white.
