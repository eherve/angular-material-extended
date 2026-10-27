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
const pathPoints = (path) =>
  [...path.matchAll(/[ML] (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((match) => [Number(match[1]), Number(match[2])]);

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

test('fans siblings out from one centered parent stem and enters card centers', () => {
  const result = layoutOrganigramGraph(
    ['parent', 'left', 'middle', 'right'].map(node),
    [edge('parent', 'left'), edge('parent', 'middle'), edge('parent', 'right')],
  );
  const parent = result.nodes.find((item) => item.id === 'parent');
  const routes = result.edges.map((item) => ({
    target: result.nodes.find((node) => node.id === item.target),
    points: pathPoints(item.path),
  }));
  const junction = routes[0].points[1];
  assert.deepEqual(junction[0], centre(parent));
  assert.ok(junction[1] > parent.y + parent.height);
  for (const { target, points } of routes) {
    assert.deepEqual(points[0], [centre(parent), parent.y + parent.height]);
    assert.deepEqual(points[1], junction);
    assert.deepEqual(points.at(-1), [centre(target), target.y]);
    for (let index = 1; index < points.length; index++)
      assert.ok(
        points[index][0] === points[index - 1][0] ||
          points[index][1] === points[index - 1][1],
      );
  }
});

test('keeps long and multi-parent links orthogonal without crossing intermediate cards', () => {
  const result = layoutOrganigramGraph(nodes, edges);
  const parent = result.nodes.find((item) => item.id === 'plan');
  const middle = result.nodes.find((item) => item.id === 'b');
  const target = result.nodes.find((item) => item.id === 'end');
  const outgoing = result.edges
    .filter((item) => item.source === 'plan')
    .map((item) => pathPoints(item.path));
  assert.ok(
    outgoing.every(
      (points) =>
        points[0][0] === centre(parent) &&
        points[0][1] === parent.y + parent.height,
    ),
  );
  assert.ok(outgoing.every((points) => points[1][1] === outgoing[0][1][1]));
  for (const route of outgoing) {
    for (let index = 1; index < route.length; index++) {
      const [x1, y1] = route[index - 1];
      const [x2, y2] = route[index];
      assert.ok(x1 === x2 || y1 === y2);
      if (x1 === x2 && x1 > middle.x && x1 < middle.x + middle.width)
        assert.ok(
          Math.max(y1, y2) <= middle.y ||
            Math.min(y1, y2) >= middle.y + middle.height,
        );
    }
  }
  for (const link of result.edges.filter((item) => item.target === 'end')) {
    assert.deepEqual(pathPoints(link.path).at(-1), [centre(target), target.y]);
  }
});

test('uses centered exits and orthogonal paths in all graph directions', () => {
  for (const direction of ['TB', 'BT', 'LR', 'RL']) {
    const result = layoutOrganigramGraph(
      [node('parent'), node('child')],
      [edge('parent', 'child')],
      { direction },
    );
    const parent = result.nodes.find((item) => item.id === 'parent');
    const child = result.nodes.find((item) => item.id === 'child');
    const points = pathPoints(result.edges[0].path);
    const exit = {
      TB: [centre(parent), parent.y + parent.height],
      BT: [centre(parent), parent.y],
      LR: [parent.x + parent.width, parent.y + parent.height / 2],
      RL: [parent.x, parent.y + parent.height / 2],
    }[direction];
    const entrance = {
      TB: [centre(child), child.y],
      BT: [centre(child), child.y + child.height],
      LR: [child.x, child.y + child.height / 2],
      RL: [child.x + child.width, child.y + child.height / 2],
    }[direction];
    assert.deepEqual(points[0], exit);
    assert.deepEqual(points.at(-1), entrance);
    for (let index = 1; index < points.length; index++)
      assert.ok(
        points[index][0] === points[index - 1][0] ||
          points[index][1] === points[index - 1][1],
      );
  }
});

test('orders every graph level by the supplied numeric order while keeping branches separate', () => {
  const orderedNodes = [
    ['finished', 6],
    ['alice-done', 4],
    ['bob-start', 3],
    ['planned', 1],
    ['bob-done', 5],
    ['root', 0],
    ['alice-start', 2],
  ].map(([id, order]) => ({ ...node(id), order }));
  const orderedEdges = [
    edge('root', 'planned'),
    edge('planned', 'alice-start'),
    edge('planned', 'bob-start'),
    edge('alice-start', 'alice-done'),
    edge('bob-start', 'bob-done'),
    edge('alice-done', 'finished'),
    edge('bob-done', 'finished'),
  ];
  const result = layoutOrganigramGraph(orderedNodes, orderedEdges, { rankBy: 'order' });
  assert.deepEqual(result.nodes.map((item) => item.id), [
    'root', 'planned', 'alice-start', 'bob-start', 'alice-done', 'bob-done', 'finished',
  ]);
  assert.equal(result.edges.length, orderedEdges.length);
  assert.notEqual(
    centre(result.nodes.find((item) => item.id === 'alice-start')),
    centre(result.nodes.find((item) => item.id === 'bob-start')),
  );
  const gaps = result.nodes.slice(1).map((item, index) => item.y - result.nodes[index].y);
  assert.ok(gaps.every((gap) => gap === gaps[0]));
});

test('keeps a chronological branch on one vertical axis between interleaved events', () => {
  const ids = ['root', 'planned', 'ef1', 'tp1', 'ar1', 'ef2', 'tp2', 'ar2', 'tp3', 'tp4', 'tp5', 'end'];
  const orderedNodes = ids.map((id, order) => ({ ...node(id), order }));
  const links = [
    edge('root', 'planned'), edge('planned', 'ef1'), edge('planned', 'tp1'), edge('planned', 'ar1'),
    edge('ef1', 'ef2'), edge('tp1', 'tp2'), edge('tp2', 'tp3'), edge('tp3', 'tp4'),
    edge('tp4', 'tp5'), edge('ar1', 'ar2'), edge('ef2', 'end'), edge('tp5', 'end'), edge('ar2', 'end'),
  ];
  const result = layoutOrganigramGraph(orderedNodes, links, { rankBy: 'order' });
  const branch = ['tp1', 'tp2', 'tp3', 'tp4', 'tp5'].map(id => result.nodes.find(item => item.id === id));
  assert.ok(branch.every(item => centre(item) === centre(branch[0])));
  for (let index = 1; index < branch.length; index++) {
    const link = result.edges.find(item => item.source === branch[index - 1].id && item.target === branch[index].id);
    assert.deepEqual(pathPoints(link.path), [
      [centre(branch[0]), branch[index - 1].y + branch[index - 1].height],
      [centre(branch[0]), branch[index].y],
    ]);
  }
});

test('splits chronologically staggered siblings from one parent rail', () => {
  const orderedNodes = ['root', 'planned', 'first', 'second', 'third']
    .map((id, order) => ({ ...node(id), order }));
  const result = layoutOrganigramGraph(orderedNodes, [
    edge('root', 'planned'), edge('planned', 'first'), edge('planned', 'second'), edge('planned', 'third'),
  ], { rankBy: 'order' });
  const routes = ['first', 'third'].map(id => ({
    target: result.nodes.find(item => item.id === id),
    points: pathPoints(result.edges.find(item => item.target === id).path),
  }));
  const parent = result.nodes.find(item => item.id === 'planned');
  const rail = routes[0].points[1][1];
  for (const { target, points } of routes) {
    assert.deepEqual(points, [
      [centre(parent), parent.y + parent.height],
      [centre(parent), rail],
      [centre(target), rail],
      [centre(target), target.y],
    ]);
  }
});

test('keeps linked events with equal order in dependency order', () => {
  const result = layoutOrganigramGraph(
    [{ ...node('later'), order: 1 }, { ...node('child'), order: 0 }, { ...node('parent'), order: 0 }],
    [edge('parent', 'child')],
    { rankBy: 'order' },
  );
  assert.deepEqual(result.nodes.map((item) => item.id), ['parent', 'child', 'later']);
});

test('rejects missing, nonfinite and edge-conflicting orders only when ordered ranking is selected', () => {
  assert.throws(
    () => layoutOrganigramGraph([node('a')], [], { rankBy: 'order' }),
    (error) => error.code === 'invalid-order',
  );
  assert.throws(
    () => layoutOrganigramGraph([{ ...node('a'), order: Infinity }], [], { rankBy: 'order' }),
    (error) => error.code === 'invalid-order',
  );
  assert.throws(
    () => layoutOrganigramGraph(
      [{ ...node('a'), order: 2 }, { ...node('b'), order: 1 }],
      [edge('a', 'b')],
      { rankBy: 'order' },
    ),
    (error) => error.code === 'invalid-order',
  );
  assert.equal(layoutOrganigramGraph([node('a')], []).nodes.length, 1);
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
