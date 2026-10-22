# Changelog

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
