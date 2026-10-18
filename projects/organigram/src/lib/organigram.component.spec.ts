import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OrganigramComponent } from './organigram.component';
import { OrganigramTreeNode } from './organigram-tree-node';

describe('OrganigramComponent interaction', () => {
  let component: OrganigramComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: ElementRef, useValue: new ElementRef(document.createElement('div')) }] });
    component = TestBed.runInInjectionContext(() => new OrganigramComponent());
  });
  afterEach(() => component.ngOnDestroy());

  it('loads a branch only once while its request is pending', async () => {
    let resolve!: (children: OrganigramTreeNode[]) => void;
    const node = new OrganigramTreeNode({ type: 'Kind', hasChildren: true, children: [] });
    node.hideChildren = true;
    const load = jasmine.createSpy('load').and.returnValue(new Promise<OrganigramTreeNode[]>(yes => resolve = yes));
    node.onClick = load;
    component.setTree = node;
    const first = component.onClick(node); const second = component.onClick(node);
    expect(load).toHaveBeenCalledTimes(1);
    resolve([new OrganigramTreeNode({ type: 'Child' })]);
    await Promise.all([first, second]);
    expect(node.children.length).toBe(1);
    expect(node.hideChildren).toBeFalse();
  });

  it('keeps a failed branch retryable', async () => {
    const node = new OrganigramTreeNode({ type: 'Kind', hasChildren: true });
    node.onClick = jasmine.createSpy('load').and.rejectWith(new Error('offline'));
    component.setTree = node;
    await component.onClick(node);
    expect(component.nodeErrors().get(node)).toBeTruthy();
    node.onClick = async () => [];
    await component.onClick(node);
    expect(component.nodeErrors().has(node)).toBeFalse();
  });

  it('adds children without mutating the previous array used by the row pipe', () => {
    const node = new OrganigramTreeNode({ type: 'Kind' }); const before = node.children;
    node.addChild({ type: 'Child' });
    expect(node.children).not.toBe(before);
    expect(node.children[0].parent).toBe(node);
  });

  it('rebases all depths when attaching a loaded subtree', () => {
    const root = new OrganigramTreeNode({ type: 'Root' });
    const branch = new OrganigramTreeNode({ type: 'Branch', children: [{ type: 'Leaf' }] });
    root.addChild(branch);
    expect(branch.depth).toBe(1);
    expect(branch.children[0].depth).toBe(2);
  });
  it('ignores branch results after the tree is replaced', async () => {
    let resolve!: (children: OrganigramTreeNode[]) => void;
    const node = new OrganigramTreeNode({ type: 'Kind' });
    node.onClick = () => new Promise<OrganigramTreeNode[]>(yes => resolve = yes);
    component.setTree = node;
    const pending = component.onClick(node);
    component.setTree = new OrganigramTreeNode({ type: 'NewRoot' });
    resolve([new OrganigramTreeNode({ type: 'LateChild' })]); await pending;
    expect(node.children.length).toBe(0);
    expect(component.tree!.type).toBe('NewRoot');
  });

  it('does not activate a node when the pointer gesture was a drag', async () => {
    const element = document.createElement('div');
    const down = new MouseEvent('mousedown', { button: 0, clientX: 10, clientY: 10 });
    element.dispatchEvent(down); component.onMouseDown(down);
    component.onMouseMove(new MouseEvent('mousemove', { clientX: 30, clientY: 10 }));
    component.onMouseUp();
    const node = new OrganigramTreeNode({ type: 'Kind', hasChildren: true });
    node.hideChildren = true;
    const click = new MouseEvent('click'); element.dispatchEvent(click);
    await component.onClick(node, click);
    expect(node.hideChildren).toBeTrue();
    expect(component.dragging).toBeFalse();
  });

  it('activates nodes with Enter and Space and ignores key events from projected controls', () => {
    const node = new OrganigramTreeNode({ type: 'Kind' });
    const activate = spyOn(component, 'onClick').and.resolveTo();
    const container = document.createElement('div');
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, cancelable: true });
      Object.defineProperties(event, { target: { value: container }, currentTarget: { value: container } });
      component.onKeydown(event, node);
      expect(event.defaultPrevented).toBeTrue();
    }
    const nested = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperties(nested, { target: { value: document.createElement('input') }, currentTarget: { value: container } });
    component.onKeydown(nested, node);
    expect(activate).toHaveBeenCalledTimes(2);
  });

  it('marks a successful empty branch as a leaf', async () => {
    const node = new OrganigramTreeNode({ type: 'Kind', hasChildren: true });
    node.onClick = async () => [];
    component.setTree = node;
    await component.onClick(node);
    expect(node.hasChildren).toBeFalse();
    expect(node.children).toEqual([]);
  });

  it('prefers the node callback over the global action', async () => {
    const node = new OrganigramTreeNode({ type: 'Kind' });
    node.onClick = jasmine.createSpy('node action').and.resolveTo();
    component.clickHandler = jasmine.createSpy('fallback').and.resolveTo();
    component.setTree = node;
    await component.onClick(node);
    expect(node.onClick).toHaveBeenCalledTimes(1);
    expect(component.clickHandler).not.toHaveBeenCalled();
  });

  it('ignores children that resolve after destruction', async () => {
    let resolve!: (children: OrganigramTreeNode[]) => void;
    const node = new OrganigramTreeNode({ type: 'Kind' });
    node.onClick = () => new Promise<OrganigramTreeNode[]>(yes => resolve = yes);
    component.setTree = node;
    const pending = component.onClick(node);
    component.ngOnDestroy();
    resolve([new OrganigramTreeNode({ type: 'Late' })]);
    await pending;
    expect(node.children).toEqual([]);
  });

});
