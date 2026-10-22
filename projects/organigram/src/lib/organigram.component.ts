/** @format */

import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  afterNextRender,
  AfterRenderRef,
  Injector,
  signal,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { OrganigramNode, OrganigramTreeNode } from './organigram-tree-node';
import { OrganigramRowsPipe } from './organigram-rows.pipe';
import { OrganigramIntl } from './organigram-intl';

@Component({
  selector: 'app-organigram',
  templateUrl: './organigram.component.html',
  styleUrls: ['./organigram.component.scss'],
  animations: [
    trigger('toggleTreeNode', [
      transition(':enter', [
        style({ height: 0, width: 0, opacity: 0 }),
        animate('0.2s', style({ height: '*', width: '*' })),
        animate('0.2s 0.2s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', width: '*', opacity: 1 }),
        animate('0.2s', style({ opacity: 0 })),
        animate('0.2s 0.2s', style({ height: 0, width: 0 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, OrganigramRowsPipe],
})
export class OrganigramComponent<T = unknown> implements OnDestroy {
  readonly intl = inject(OrganigramIntl);
  dragging = false;
  private dragOrigin: { x: number; y: number } | null = null;
  private suppressClick = false;
  private destroyed = false;
  private treeVersion = 0;
  private scrollRender?: AfterRenderRef;
  readonly pendingNodes = signal<ReadonlySet<OrganigramTreeNode<T>>>(new Set());
  readonly nodeErrors = signal<ReadonlyMap<OrganigramTreeNode<T>, string>>(new Map());
  private readonly highlightedConnectors = new Set<HTMLElement>();
  private pathObserver?: ResizeObserver;
  private hoveredNode: OrganigramTreeNode<T> | null = null;
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.suppressClick = false;
    if (event.button !== 0 || (event.target as HTMLElement).closest('button, input, a, mat-checkbox')) return;
    this.dragOrigin = { x: event.clientX, y: event.clientY };
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.dragOrigin) return;
    if (!this.dragging && Math.hypot(event.clientX - this.dragOrigin.x, event.clientY - this.dragOrigin.y) < 5) return;
    this.dragging = true;
    this.suppressClick = true;
    this.scrollRef?.nativeElement.scrollBy({ top: -event.movementY, left: -event.movementX });
    event.preventDefault();
  }

  @HostListener('document:mouseup')
  @HostListener('window:blur')
  onMouseUp(): void {
    this.dragOrigin = null;
    this.dragging = false;
  }

  @ViewChild('scroll')
  scrollRef?: ElementRef<HTMLElement>;

  @Input('hideRoot')
  set setHideRoot(hideRoot: unknown) {
    this.hideRoot = hideRoot !== false;
  }
  hideRoot = false;

  @Input('tree')
  set setTree(tree: OrganigramNode<T> | OrganigramTreeNode<T> | null | undefined) {
    this.treeVersion++;
    this.scrollRender?.destroy();
    this.pendingNodes.set(new Set());
    this.nodeErrors.set(new Map());
    this.highlightParents(null);
    if (tree?.key !== undefined && this.tree?.key === tree.key) {
      this.tree.updateFrom(tree);
    } else {
      this.tree = !tree ? null : tree instanceof OrganigramTreeNode ? tree : new OrganigramTreeNode<T>(tree);
    }
  }
  tree: OrganigramTreeNode<T> | null = null;

  @Input()
  nodeTmpl!: TemplateRef<{ node: OrganigramTreeNode<T> }>;

  @Input('click')
  clickHandler?: (node: OrganigramTreeNode<T>) => Promise<unknown>;

  nbChildByRow = 5;

  highlightParents(node: OrganigramTreeNode<T> | null): void {
    this.pathObserver?.disconnect();
    this.hoveredNode = node;
    this.paintParentPath();
    if (!node) return;
    this.pathObserver ??= new ResizeObserver(() => this.paintParentPath());
    for (const connector of this.highlightedConnectors) {
      this.pathObserver.observe(connector.parentElement!);
    }
  }

  private paintParentPath(): void {
    for (const element of this.highlightedConnectors) {
      element.classList.remove('path-vertical');
      element.style.removeProperty('--path-horizontal-color');
    }
    this.highlightedConnectors.clear();
    for (let child = this.hoveredNode; child?.parent; child = child.parent) {
      const childElement = document.getElementById(child.id);
      const parentElement = document.getElementById(child.parent.id);
      if (!childElement || !parentElement || !this.host.nativeElement.contains(parentElement) ||
          !parentElement.offsetParent) break;
      const row = childElement.closest<HTMLElement>('.node-block-children-row');
      const group = row?.parentElement;
      if (!row || !group) break;
      const rows = Array.from(group.querySelectorAll<HTMLElement>(':scope > .node-block-children-row'));
      const rowIndex = rows.indexOf(row);
      const parentX = parentElement.getBoundingClientRect().left + parentElement.offsetWidth / 2;
      const childX = childElement.getBoundingClientRect().left + childElement.offsetWidth / 2;
      this.colorVertical(childElement.parentElement?.querySelector<HTMLElement>(':scope > .node-block-top'));
      this.colorVertical(parentElement.querySelector<HTMLElement>(':scope > .node-container-bottom'));
      const groupTop = group.querySelector<HTMLElement>(':scope > .node-block-children-top');
      this.colorVertical(groupTop);
      if (rowIndex === 0) {
        this.colorRow(row, parentX, childX);
        if (groupTop) this.colorHorizontal(groupTop, parentX, childX);
      } else {
        const railX = rows[0].getBoundingClientRect().left;
        this.colorRow(rows[0], parentX, railX);
        if (groupTop) this.colorHorizontal(groupTop, parentX, railX);
        for (const previousRow of rows.slice(0, rowIndex)) {
          this.colorVertical(previousRow.querySelector<HTMLElement>(':scope > .node-block > .node-block-left'));
        }
        this.colorRow(row, railX, childX);
      }
    }
  }

  private colorVertical(element: HTMLElement | null | undefined): void {
    if (!element) return;
    element.classList.add('path-vertical');
    this.highlightedConnectors.add(element);
  }

  private colorRow(row: HTMLElement, from: number, to: number): void {
    for (const element of row.querySelectorAll<HTMLElement>(':scope > .node-block > .node-block-top')) {
      this.colorHorizontal(element, from, to);
    }
  }

  private colorHorizontal(element: HTMLElement, from: number, to: number): void {
    const style = getComputedStyle(element, '::before');
    if (style.content === 'none') return;
    const bounds = element.getBoundingClientRect();
    const offset = style.left.endsWith('%') ? parseFloat(style.left) * bounds.width / 100 : parseFloat(style.left);
    const width = parseFloat(style.width);
    const start = Math.max(0, Math.min(from, to) - bounds.left - offset);
    const end = Math.min(width, Math.max(from, to) - bounds.left - offset);
    if (end <= start || !Number.isFinite(width)) return;
    element.style.setProperty('--path-horizontal-color', `linear-gradient(to right,
      var(--ngx-mat-organigram-connector, #09293c) ${start}px, var(--ngx-mat-organigram-highlight, #e73452) ${start}px,
      var(--ngx-mat-organigram-highlight, #e73452) ${end}px, var(--ngx-mat-organigram-connector, #09293c) ${end}px)`);
    this.highlightedConnectors.add(element);
  }

  ngOnDestroy(): void {
    this.highlightParents(null);
    this.destroyed = true;
    this.treeVersion++;
    this.scrollRender?.destroy();
  }

  onKeydown(event: KeyboardEvent, node: OrganigramTreeNode<T>): void {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    void this.onClick(node);
  }

  async onClick(node: OrganigramTreeNode<T>, event?: MouseEvent): Promise<void> {
    if (event && (this.suppressClick || (event.target as HTMLElement).closest('button, input, a, mat-checkbox'))) return;
    if (this.destroyed || this.pendingNodes().has(node)) return;
    const version = this.treeVersion;
    this.pendingNodes.update(pending => new Set([...pending, node]));
    this.nodeErrors.update(errors => { const next = new Map(errors); next.delete(node); return next; });
    try {
      if (node.onClick) {
        const children = await node.onClick(node);
        if (this.destroyed || version !== this.treeVersion) return;
        if (Array.isArray(children)) {
          for (const child of children) node.addChild(child);
          node.hasChildren = node.children.length > 0;
          node.hideChildren = false;
        }
      } else if (this.clickHandler) {
        await this.clickHandler(node);
      } else if (node.hasChildren) node.hideChildren = !node.hideChildren;
      if (this.destroyed || version !== this.treeVersion) return;
      this.scrollToNode(node);
    } catch {
      if (!this.destroyed && version === this.treeVersion) {
        this.nodeErrors.update(errors => new Map(errors).set(node, this.intl.messages().loadError));
      }
    } finally {
      if (!this.destroyed && version === this.treeVersion) {
        this.pendingNodes.update(pending => { const next = new Set(pending); next.delete(node); return next; });
      }
    }
  }

  private scrollToNode(node: OrganigramTreeNode<T>): void {
    this.scrollRender?.destroy();
    this.scrollRender = afterNextRender(() => {
      if (this.destroyed) return;
      if (this.hoveredNode) this.highlightParents(this.hoveredNode);
      const element = document.getElementById(node.id);
      if (element && this.host.nativeElement.contains(element)) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }, { injector: this.injector });
  }
}
