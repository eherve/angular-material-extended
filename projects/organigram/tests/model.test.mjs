import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrganigramTreeNode } from '../src/lib/organigram-tree-node.ts';

test('wraps structural input without mutating it or retaining its children array', () => {
  const input = { type: 'root', entity: { name: 'Root' }, children: [{ type: 'leaf' }] };
  const node = new OrganigramTreeNode(input);
  assert.notEqual(node.children, input.children);
  assert.equal(input.children[0].parent, undefined);
  assert.equal(node.children[0].parent, node);
});
test('adds children immutably and rebases descendants', () => {
  const root = new OrganigramTreeNode({ type: 'root' });
  const before = root.children;
  const branch = new OrganigramTreeNode({ type: 'branch', children: [{ type: 'leaf' }] });
  root.addChild(branch);
  assert.notEqual(root.children, before);
  assert.equal(branch.parent, root);
  assert.equal(branch.depth, 1);
  assert.equal(branch.children[0].depth, 2);
});
test('resolves parent indices in both directions', () => {
  const root = new OrganigramTreeNode({ type: 'root', children: [{ type: 'branch', children: [{ type: 'leaf' }] }] });
  const leaf = root.children[0].children[0];
  assert.equal(leaf.getParent(), root.children[0]);
  assert.equal(leaf.getParent(1), root);
  assert.equal(leaf.getParent(-1), root);
  assert.equal(leaf.getParent(-2), root.children[0]);
  assert.equal(leaf.getParent(9), null);
});
test('assigns unique IDs when trees are constructed from the same source', () => {
  const source = { type: 'root', children: [{ type: 'leaf' }] };
  const a = new OrganigramTreeNode(source), b = new OrganigramTreeNode(source);
  assert.equal(new Set([a.id, b.id, a.children[0].id, b.children[0].id]).size, 4);
});
test('preserves callbacks and structural presentation state', () => {
  const onClick = async () => [];
  const node = new OrganigramTreeNode({ type: 'branch', selected: true, hideChildren: true, hasChildren: true, onClick });
  assert.equal(node.onClick, onClick);
  assert.equal(node.selected, true);
  assert.equal(node.hideChildren, true);
});

test('keyed updates preserve existing nodes and append only new children', () => {
  const root = new OrganigramTreeNode({ key: 'root', type: 'root', children: [{ key: 'a', type: 'leaf', entity: { name: 'Before' } }] });
  const first = root.children[0];
  root.updateFrom({ key: 'root', type: 'root', children: [{ key: 'a', type: 'leaf', entity: { name: 'After' } }, { key: 'b', type: 'leaf' }] });
  assert.equal(root.children[0], first);
  assert.equal(first.entity.name, 'After');
  assert.equal(root.children[1].parent, root);
  const children = root.children;
  root.updateFrom({ key: 'root', type: 'root', children: [{ key: 'a', type: 'leaf' }, { key: 'b', type: 'leaf' }] });
  assert.equal(root.children, children);
  root.updateFrom({ key: 'root', type: 'root', children: [{ key: 'b', type: 'leaf' }] });
  assert.equal(root.children.length, 1);
  assert.equal(root.children[0].key, 'b');
});
