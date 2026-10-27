# Changelog

## 22.2.1 — 2026-10-27

- Route graph connectors through centered orthogonal branches and keep ancestor highlights above shared segments.
- Add optional numeric node order for chronological graph ranks with uniform spacing and straight branch axes.

## 22.2.0 — 2026-10-24

- Add standalone `OrganigramGraphComponent` for directed acyclic graphs with shared multi-parent nodes.
- Validate graph IDs, edges, dimensions and cycles before deterministic Dagre layout.
- Render custom Angular cards once, measure their size and route SVG connectors between all parents.
- Support ancestor highlighting across every incoming path, keyboard activation and drag scrolling.
- Export graph types, layout helpers and configurable graph messages; preserve the hierarchical tree API.

## 22.1.0 — 2026-10-22

- Reconcile structural updates by stable node keys and retain existing row/card DOM when adding nodes.
- Preserve existing node identity and collapsed state during keyed updates.

## 22.0.1 — 2026-10-18

- Use consistent 2px connectors and center vertical segments on their branch axis.

## 22.0.0 — 2026-10-18

- Extract the reusable Angular 22 organigram from sésiO.
- Provide structural generic nodes, a standalone component and OrganigramModule.
- Preserve lazy loading, retry, immutable child arrays, keyboard and drag interactions.
- Highlight original ancestor connectors during layout animations, without SVG overlays.
- Add configurable messages, independent theme tokens, model and rendered component tests.
