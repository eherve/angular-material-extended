import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OrganigramComponent } from './organigram.component';
import { OrganigramModule } from './organigram.module';
import { OrganigramTreeNode } from './organigram-tree-node';
import { OrganigramIntl } from './organigram-intl';

@Component({
  imports: [OrganigramComponent],
  template: `
    <app-organigram [tree]="tree" [nodeTmpl]="card" hideRoot style="--ngx-mat-organigram-highlight: #ff00aa" />
    <ng-template #card let-node="node"><div class="card" style="height: 30px"><span class="node-name">{{ node.entity?.name }}</span><button type="button">Action</button></div></ng-template>
  `,
})
class Host {
  tree = new OrganigramTreeNode<{ name: string }>({ type: 'root', children: [{
    type: 'parent', entity: { name: 'Parent' }, hasChildren: true, hideChildren: false,
    children: Array.from({ length: 7 }, (_, i) => ({ type: 'leaf', entity: { name: `Child ${i}` } })),
  }] });
}

@Component({ imports: [OrganigramModule], template: '<app-organigram [tree]="null" />' })
class ModuleHost {}

describe('Organigram rendered contract', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [Host, ModuleHost, NoopAnimationsModule] }));

  it('exports a usable NgModule and renders the supplied card context in multiple rows', async () => {
    const module = TestBed.createComponent(ModuleHost);
    module.detectChanges();
    expect(module.nativeElement.querySelector('app-organigram')).toBeTruthy();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges(); await fixture.whenStable();
    const cards = [...fixture.nativeElement.querySelectorAll('.node-name')] as HTMLElement[];
    expect(cards.map(card => card.textContent?.trim())).toContain('Child 6');
    const last = document.getElementById(fixture.componentInstance.tree.children[0].children[6].id)!;
    expect(last.closest('.node-block-children-row')?.classList.contains('bottom')).toBeTrue();
    expect(getComputedStyle(last.closest('.node-block-children-row')!).display).toBe('flex');
  });

  it('highlights existing ancestor connectors, isolates instances and clears on leave', async () => {
    const first = TestBed.createComponent(Host), second = TestBed.createComponent(Host);
    first.detectChanges(); second.detectChanges(); await first.whenStable();
    const leaf = first.componentInstance.tree.children[0].children[6];
    const element = document.getElementById(leaf.id)!;
    const topology = first.nativeElement.querySelectorAll('.node-block-top,.node-block-left,.node-container-bottom').length;
    element.dispatchEvent(new MouseEvent('mouseenter'));
    first.detectChanges();
    const connector = element.parentElement!.querySelector('.node-block-top')!;
    expect(getComputedStyle(connector, '::after').backgroundColor).toBe('rgb(255, 0, 170)');
    expect(first.nativeElement.querySelector('svg,polyline')).toBeNull();
    expect(second.nativeElement.querySelectorAll('.path-vertical').length).toBe(0);
    expect(first.nativeElement.querySelectorAll('.node-block-top,.node-block-left,.node-container-bottom').length).toBe(topology);
    element.dispatchEvent(new MouseEvent('mouseleave'));
    expect(first.nativeElement.querySelectorAll('.path-vertical').length).toBe(0);
    expect(first.nativeElement.querySelectorAll('[style*="--path-horizontal-color"]').length).toBe(0);
  });

  it('shows configurable error/retry text and recovers without adding duplicate children', async () => {
    const fixture = TestBed.createComponent(Host); fixture.detectChanges(); await fixture.whenStable();
    const chartElement = fixture.nativeElement.querySelector('app-organigram') as HTMLElement;
    const intl = TestBed.inject(OrganigramIntl);
    intl.messages.set({ loadError: 'Test failure', retry: 'Try again' });
    const node = fixture.componentInstance.tree.children[0];
    node.onClick = async () => { throw new Error('offline'); };
    document.getElementById(node.id)!.click(); await fixture.whenStable(); fixture.detectChanges();
    const retry = chartElement.querySelector('.node-error button') as HTMLButtonElement;
    expect(chartElement.textContent).toContain('Test failure');
    expect(retry.textContent).toContain('Try again');
    node.onClick = async () => [];
    retry.click(); await fixture.whenStable(); fixture.detectChanges();
    expect(chartElement.querySelector('.node-error')).toBeNull();
    expect(node.children.length).toBe(7);
  });
  it('keeps original connector segments highlighted as an opening branch changes their width', async () => {
    const fixture = TestBed.createComponent(Host); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.debugElement.query(By.directive(OrganigramComponent)).componentInstance as OrganigramComponent<{ name: string }>;
    const branch = fixture.componentInstance.tree.children[0].children[6];
    branch.hasChildren = true; branch.hideChildren = true;
    for (let i = 0; i < 7; i++) branch.addChild({ type: 'leaf', entity: { name: `Nested ${i}` } });
    fixture.detectChanges();
    component.highlightParents(branch);
    const element = document.getElementById(branch.id)!;
    const connector = element.parentElement!.querySelector<HTMLElement>('.node-block-top')!;
    const before = connector.getBoundingClientRect().width;
    await component.onClick(branch); fixture.detectChanges(); await fixture.whenStable();
    await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
    expect(connector.getBoundingClientRect().width).toBeGreaterThan(before);
    expect(getComputedStyle(connector, '::after').backgroundColor).toBe('rgb(255, 0, 170)');
    expect(connector.style.getPropertyValue('--path-horizontal-color')).toContain('linear-gradient');
    expect(fixture.nativeElement.querySelector('svg,polyline')).toBeNull();
    fixture.destroy();
    expect(connector.classList.contains('path-vertical')).toBeFalse();
    expect(connector.style.getPropertyValue('--path-horizontal-color')).toBe('');
  });

  it('leaves projected button clicks to the host without activating the node', async () => {
    const fixture = TestBed.createComponent(Host); fixture.detectChanges(); await fixture.whenStable();
    const node = fixture.componentInstance.tree.children[0];
    node.onClick = jasmine.createSpy('action').and.resolveTo();
    document.getElementById(node.id)!.querySelector('button')!.click();
    await fixture.whenStable();
    expect(node.onClick).not.toHaveBeenCalled();
  });

});
