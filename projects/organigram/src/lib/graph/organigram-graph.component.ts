import { CommonModule } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import type { OrganigramGraphNode, OrganigramGraphEdge, OrganigramGraphOptions } from './organigram-graph.types';
import type { OrganigramGraphLayout, OrganigramGraphSize } from './organigram-graph.types';
import { collectOrganigramAncestorEdges, layoutOrganigramGraph } from './organigram-graph-layout';
import { OrganigramGraphIntl } from './organigram-graph-intl';

@Component({
  selector: 'app-organigram-graph',
  templateUrl: './organigram-graph.component.html',
  styleUrl: './organigram-graph.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mousedown)': 'startDrag($event)',
    '(mousemove)': 'moveDrag($event)',
    '(document:mouseup)': 'endDrag()',
    '(window:blur)': 'endDrag()',
  },
})
export class OrganigramGraphComponent<T = unknown> {
  readonly nodes = input<readonly OrganigramGraphNode<T>[]>([]);
  readonly edges = input<readonly OrganigramGraphEdge[]>([]);
  readonly nodeTmpl = input.required<TemplateRef<{ node: OrganigramGraphNode<T> }>>();
  readonly options = input<OrganigramGraphOptions>({});
  readonly ariaLabel = input('Graphe');
  readonly nodeClick = output<OrganigramGraphNode<T>>();
  readonly intl = inject(OrganigramGraphIntl);
  readonly dragging = signal(false);
  readonly hoveredId = signal<string | null>(null);
  readonly focusedId = signal<string | null>(null);
  private readonly sizes = signal<ReadonlyMap<string, OrganigramGraphSize>>(new Map());
  private readonly cards = viewChildren<ElementRef<HTMLElement>>('graphNode');
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private dragOrigin: { x: number; y: number } | null = null;
  private dragPoint: { x: number; y: number } | null = null;
  private suppressClick = false;

  private readonly result = computed((): { layout: OrganigramGraphLayout<T>; error: Error | null } => {
    try {
      return {
        layout: layoutOrganigramGraph(this.nodes(), this.edges(), this.options(), this.sizes()),
        error: null,
      };
    } catch (error: unknown) {
      return {
        layout: { nodes: [], edges: [], width: 0, height: 0 },
        error: error instanceof Error ? error : new Error('Graph layout failed'),
      };
    }
  });
  readonly layout = computed(() => this.result().layout);
  readonly error = computed(() => this.result().error);
  readonly highlightedEdges = computed(() =>
    collectOrganigramAncestorEdges(this.layout().edges, this.hoveredId() ?? this.focusedId() ?? ''),
  );

  constructor() {
    afterRenderEffect((onCleanup) => {
      const cards = this.cards().map((card) => card.nativeElement);
      const validIds = new Set(cards.map((card) => card.dataset['nodeId']!));
      untracked(() => {
        const previous = this.sizes();
        if ([...previous.keys()].some((id) => !validIds.has(id)))
          this.sizes.set(new Map([...previous].filter(([id]) => validIds.has(id))));
      });
      if (typeof ResizeObserver === 'undefined' || !cards.length) return;
      let active = true;
      const observer = new ResizeObserver((entries) => {
        if (!active) return;
        const next = new Map(this.sizes());
        let changed = false;
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          const id = element.dataset['nodeId'];
          if (!id || !validIds.has(id)) continue;
          const box = entry.borderBoxSize[0];
          const width = box?.inlineSize ?? element.offsetWidth;
          const height = box?.blockSize ?? element.offsetHeight;
          if (width <= 0 || height <= 0) continue;
          const previous = next.get(id);
          if (previous && Math.abs(previous.width - width) < 0.5 && Math.abs(previous.height - height) < 0.5) continue;
          next.set(id, { width, height });
          changed = true;
        }
        if (changed) this.sizes.set(next);
      });
      for (const card of cards) observer.observe(card);
      onCleanup(() => {
        active = false;
        observer.disconnect();
      });
    });
  }

  activate(node: OrganigramGraphNode<T>, event: MouseEvent | KeyboardEvent): void {
    if (this.isProjectedControl(event.target)) return;
    if (event instanceof MouseEvent && this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    if (event instanceof KeyboardEvent) {
      if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
    }
    this.nodeClick.emit(node);
  }

  focusOut(event: FocusEvent): void {
    const current = event.currentTarget as HTMLElement;
    if (event.relatedTarget instanceof Node && current.contains(event.relatedTarget)) return;
    this.focusedId.set(null);
  }

  startDrag(event: MouseEvent): void {
    this.suppressClick = false;
    if (event.button !== 0 || this.isProjectedControl(event.target)) return;
    this.dragOrigin = this.dragPoint = { x: event.clientX, y: event.clientY };
  }

  moveDrag(event: MouseEvent): void {
    if (!this.dragOrigin || !this.dragPoint) return;
    if (!this.dragging() && Math.hypot(event.clientX - this.dragOrigin.x, event.clientY - this.dragOrigin.y) < 5)
      return;
    this.dragging.set(true);
    this.suppressClick = true;
    this.viewport()?.nativeElement.scrollBy({
      left: this.dragPoint.x - event.clientX,
      top: this.dragPoint.y - event.clientY,
    });
    this.dragPoint = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  }

  endDrag(): void {
    this.dragOrigin = this.dragPoint = null;
    this.dragging.set(false);
  }

  private isProjectedControl(target: EventTarget | null): boolean {
    return (
      target instanceof Element && !!target.closest('button, a, input, textarea, select, [contenteditable="true"]')
    );
  }
}
