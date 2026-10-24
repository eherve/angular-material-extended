import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutOrganigramGraph, collectOrganigramAncestorEdges } from '../src/lib/graph/organigram-graph-layout.ts';

const node = (id) => ({ id, entity: { name: id } });
const edge = (source, target) => ({
  id: `${source}:${target}`,
  source,
  target,
});
const nodes = ['plan', 'a', 'b', 'b2', 'c', 'end'].map(node);
const edges = [
  edge('plan', 'a'),
  edge('plan', 'b'),
  edge('plan', 'c'),
  edge('b', 'b2'),
  edge('a', 'end'),
  edge('b2', 'end'),
  edge('c', 'end'),
];
const centre = (item) => item.x + item.width / 2;

test('renders a shared child once and places it after its longest incoming branch', () => {
  const result = layoutOrganigramGraph(nodes, edges);
  assert.equal(result.nodes.length, 6);
  assert.equal(result.edges.length, 7);
  const end = result.nodes.find((item) => item.id === 'end');
  for (const parent of result.nodes.filter((item) => ['a', 'b2', 'c'].includes(item.id))) {
    assert.ok(end.y > parent.y + parent.height);
  }
  assert.equal(centre(result.nodes.find((item) => item.id === 'plan')), centre(end));
});

test('uses actual card dimensions, keeps cards separate and never mutates graph data', () => {
  const immutableNodes = nodes.map((item) => Object.freeze({ ...item }));
  const immutableEdges = edges.map((item) => Object.freeze({ ...item }));
  const result = layoutOrganigramGraph(
    immutableNodes,
    immutableEdges,
    {},
    new Map([['b', { width: 350, height: 220 }]]),
  );
  const b = result.nodes.find((item) => item.id === 'b');
  assert.equal(b.height, 220);
  assert.equal(b.width, 350);
  for (const link of result.edges) assert.ok(link.path.startsWith('M '));
  for (let i = 0; i < result.nodes.length; i++)
    for (let j = i + 1; j < result.nodes.length; j++) {
      const a = result.nodes[i],
        b = result.nodes[j];
      assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
    }
  assert.equal(immutableNodes[0].x, undefined);
});

test('is deterministic after input reorder and supports disconnected graphs and empty data', () => {
  const first = layoutOrganigramGraph(nodes, edges);
  assert.deepEqual(layoutOrganigramGraph([...nodes].reverse(), [...edges].reverse()), first);
  const separate = layoutOrganigramGraph([node('a'), node('b')], []);
  assert.equal(separate.nodes.length, 2);
  assert.notEqual(separate.nodes[0].x, separate.nodes[1].x);
  assert.deepEqual(layoutOrganigramGraph([], []), {
    nodes: [],
    edges: [],
    width: 0,
    height: 0,
  });
});

test('rejects malformed graphs and cycles before passing them to the layout engine', () => {
  const reject = (n, e, code, options) =>
    assert.throws(
      () => layoutOrganigramGraph(n, e, options),
      (error) => error.code === code,
    );
  reject([node('')], [], 'invalid-node-id');
  reject([node('a'), node('a')], [], 'duplicate-node');
  reject([node('a')], [edge('a', 'missing')], 'invalid-edge');
  reject([node('a')], [edge('a', 'a')], 'self-edge');
  reject([node('a'), node('b')], [edge('a', 'b'), edge('a', 'b')], 'duplicate-edge');
  reject([node('a'), node('b')], [edge('a', 'b'), edge('b', 'a')], 'cycle');
  reject([node('a')], [], 'invalid-options', { nodeWidth: -1 });
  reject([node('a')], [], 'invalid-options', { verticalGap: NaN });
});

test('highlights every incoming ancestor path of a shared node and stops at the requested node', () => {
  assert.deepEqual([...collectOrganigramAncestorEdges(edges, 'end')].sort(), edges.map((item) => item.id).sort());
  assert.deepEqual([...collectOrganigramAncestorEdges(edges, 'b2')].sort(), ['b:b2', 'plan:b']);
  assert.deepEqual([...collectOrganigramAncestorEdges(edges, 'plan')], []);
});

test('routes edges in the configured direction and validates measured sizes', () => {
  const result = layoutOrganigramGraph([node('a'), node('b')], [edge('a', 'b')], { direction: 'LR' });
  assert.ok(result.nodes.find((item) => item.id === 'b').x > result.nodes.find((item) => item.id === 'a').x);
  assert.throws(
    () => layoutOrganigramGraph([node('a')], [], {}, new Map([['a', { width: 100, height: Infinity }]])),
    (error) => error.code === 'invalid-options',
  );
});

test('orders rendered cards from source to sink for keyboard navigation in every direction', () => {
  for (const direction of ['TB', 'BT', 'LR', 'RL']) {
    const result = layoutOrganigramGraph([node('z-source'), node('a-target')], [edge('z-source', 'a-target')], {
      direction,
    });
    assert.deepEqual(
      result.nodes.map((item) => item.id),
      ['z-source', 'a-target'],
    );
  }
});
