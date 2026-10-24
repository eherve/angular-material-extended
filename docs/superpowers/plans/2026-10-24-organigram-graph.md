# Organigram graph implementation plan

> **For agentic workers:** Use superpowers:executing-plans for inline implementation. User approved the package extension and graph component, then authorized commit, push, npm publication and integration into sésiO edge on 2026-10-24.

**Goal:** Provide a reusable multi-parent DAG component in `@eherve/angular-material-organigram`, then display the sésiO lifecycle as one connected graph.

**Architecture:** A flat, globally keyed node/edge contract feeds a validated Dagre layout. Angular renders each card once and an SVG renders edges. The existing hierarchical organigram remains a separate, supported tree component.

**Tech stack:** Angular 22.2, public template projection and signal APIs, Dagre 3.1.1, ResizeObserver, SVG.

**Spec:** Approved conversation: centred common prefix/suffix; parallel participants; shared finish once; preserve compact cards and tooltips. Graph v1 supports declarative data, ancestor highlighting, keyboard activation and drag scrolling; no graph editing or lazy branch mutation.

## Global constraints

- Generic library code has no sésiO models, services or color palette dependencies.
- Preserve all existing tree contracts and tests.
- Reject duplicate IDs, dangling edges, duplicate links, self links and cycles before layout.
- Keep graph identity stable by globally unique IDs, across input reorder and immutable updates.
- Initial implementation stays in isolated worktrees; release and edge integration were subsequently authorized on 2026-10-24.

## Review focus

- A shared child renders once, below its longest incoming branch.
- Node resizing changes routed edges without DOM replacement or relayout loops.
- Ancestor highlighting follows every incoming path and isolates component instances.
- Invalid inputs replace the previous layout with an accessible error and recover.
- Input replacement, node removal and component destruction release observers and callbacks.

## Tasks

- [x] 1. Add `src/lib/graph/organigram-graph.types.ts` and layout helper; write native Node regression tests first, then implement validation, placement and ancestor traversal.
- [x] 2. Add standalone `OrganigramGraphComponent` in its own folder: template cards, routed edges, measured heights, focus/click behavior, pan scrolling and public theme tokens. Add rendered browser specs before implementation.
- [x] 3. Export through public API and NgModule; update README, changelog and package dependencies; run targeted graph/tree tests and build the organigram package.
- [x] 4. Consume the locally packed package in the sésiO worktree, remove the two-tree presentation adapter, retain lifecycle cards/tooltips and verify the three-person seeded intervention in Chrome.
- [x] 5. Request a scoped independent review; fix actionable findings; check final diffs and report verification plus the unpublished-package state.

## Verification record

- Thirteen library native tests passed (six tree regressions and seven graph tests), including directional keyboard order.
- Nine sésiO lifecycle regressions passed, including one shared finish with exactly three incoming edges.
- Library source/template compilation and focused graph-spec compilation passed.
- Package build passed with CI=true to disable the shared Git-worktree cache.
- sésiO TypeScript and Angular template compiler passed; local dev-server build succeeded.
- Karma could not bind port 9876 (EPERM); browser specs were not executed or retried outside the sandbox.
- Chrome verified S02-103: 12 unique cards, 13 edges, one final card with three incoming edges and a centred prefix/suffix.
- Chrome verified all 13 ancestor edges highlight; Enter/Space emit while nested buttons do not; resize from 65px to 180px moves the finish and retains card DOM; duplicate-node input clears cards and recovers after restoration. Browser probes changed memory only.
- Independent review found no Important/Critical findings; consumer README updated to describe the unified DAG.
- Initial validation used an unpublished local tarball. Release delivery replaces it with the exact npm version 22.2.0.
