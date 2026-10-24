import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganigramGraphComponent } from './organigram-graph.component';
import type { OrganigramGraphEdge, OrganigramGraphNode } from './organigram-graph.types';

type Card = { name: string; height?: number };
const nodes: OrganigramGraphNode<Card>[] = ['plan', 'a', 'b', 'b2', 'c', 'end'].map((id) => ({
  id,
  entity: { name: id },
}));
const edges: OrganigramGraphEdge[] = [
  ['plan', 'a'],
  ['plan', 'b'],
  ['plan', 'c'],
  ['b', 'b2'],
  ['a', 'end'],
  ['b2', 'end'],
  ['c', 'end'],
].map(([source, target]) => ({ source, target }));

@Component({
  imports: [OrganigramGraphComponent],
  template: `<app-organigram-graph
      [nodes]="nodes()"
      [edges]="edges()"
      [nodeTmpl]="card"
      (nodeClick)="selected.push($event.id)"
    />
    <ng-template #card let-node="node"
      ><article class="test-card" [style.height.px]="node.entity?.height ?? 50">
        <span>{{ node.entity?.name }}</span
        ><button type="button" (click)="buttonClicks = buttonClicks + 1">Action</button>
      </article></ng-template
    >`,
})
class Host {
  readonly nodes = input<readonly OrganigramGraphNode<Card>[]>(nodes);
  readonly edges = input<readonly OrganigramGraphEdge[]>(edges);
  selected: string[] = [];
  buttonClicks = 0;
}

async function settle(fixture: ComponentFixture<Host>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  fixture.detectChanges();
  await fixture.whenStable();
}

describe('OrganigramGraphComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [Host] }));

  it('renders one shared finish card with three incoming edges and updates after card resize', async () => {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.graph-node').length).toBe(6);
    expect(element.querySelectorAll('[data-node-id="end"]').length).toBe(1);
    expect(element.querySelectorAll('path[data-target="end"]').length).toBe(3);
    const b = element.querySelector<HTMLElement>('[data-node-id="b"]')!;
    const end = element.querySelector<HTMLElement>('[data-node-id="end"]')!;
    const previousTop = end.offsetTop;
    fixture.componentRef.setInput(
      'nodes',
      nodes.map((node) => (node.id === 'b' ? { ...node, entity: { name: 'Large card', height: 180 } } : node)),
    );
    await settle(fixture);
    await settle(fixture);
    expect(element.querySelector('[data-node-id="b"]')).toBe(b);
    expect(b.offsetHeight).toBe(180);
    expect(end.offsetTop).toBeGreaterThan(previousTop);
  });

  it('highlights every ancestor edge and isolates separate instances', async () => {
    const first = TestBed.createComponent(Host),
      second = TestBed.createComponent(Host);
    document.body.appendChild(first.nativeElement);
    await settle(first);
    await settle(second);
    const element = first.nativeElement as HTMLElement;
    element.querySelector('[data-node-id="end"]')!.dispatchEvent(new MouseEvent('mouseenter'));
    first.detectChanges();
    expect(element.querySelectorAll('path.highlighted').length).toBe(7);
    expect(second.nativeElement.querySelectorAll('path.highlighted').length).toBe(0);
    element.querySelector('[data-node-id="end"]')!.dispatchEvent(new MouseEvent('mouseleave'));
    first.detectChanges();
    expect(element.querySelectorAll('path.highlighted').length).toBe(0);
    (element.querySelector('[data-node-id="b2"]') as HTMLElement).focus();
    first.detectChanges();
    expect(element.querySelectorAll('path.highlighted').length).toBe(2);
  });

  it('keeps keyed cards during immutable updates and rejects invalid replacement graphs', async () => {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const element = fixture.nativeElement as HTMLElement;
    const end = element.querySelector('[data-node-id="end"]');
    fixture.componentRef.setInput('nodes', [...nodes].reverse());
    await settle(fixture);
    expect(element.querySelector('[data-node-id="end"]')).toBe(end);
    fixture.componentRef.setInput('edges', [...edges, { source: 'end', target: 'plan' }]);
    await settle(fixture);
    expect(element.querySelector('[role="alert"]')).toBeTruthy();
    expect(element.querySelectorAll('.graph-node').length).toBe(0);
    fixture.componentRef.setInput('edges', edges);
    await settle(fixture);
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelectorAll('.graph-node').length).toBe(6);
  });

  it('activates by keyboard and leaves projected buttons to the host', async () => {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const element = fixture.nativeElement as HTMLElement;
    const a = element.querySelector('[data-node-id="a"]')!;
    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    a.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(fixture.componentInstance.selected).toEqual(['a', 'a']);
    (a.querySelector('button') as HTMLButtonElement).click();
    expect(fixture.componentInstance.buttonClicks).toBe(1);
    expect(fixture.componentInstance.selected).toEqual(['a', 'a']);
  });

  it('shows the French empty state and removes stale nodes', async () => {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    fixture.componentRef.setInput('nodes', []);
    fixture.componentRef.setInput('edges', []);
    await settle(fixture);
    expect(fixture.nativeElement.textContent).toContain('Aucun élément à afficher');
    expect(fixture.nativeElement.querySelectorAll('.graph-node').length).toBe(0);
  });
});
