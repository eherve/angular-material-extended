import { Graph, graphlib, layout, type GraphLabel, type NodeLabel, type EdgeLabel } from '@dagrejs/dagre';
import type {
  OrganigramGraphEdge,
  OrganigramGraphLayout,
  OrganigramGraphNode,
  OrganigramGraphOptions,
  OrganigramGraphSize,
  OrganigramGraphErrorCode,
} from './organigram-graph.types';

export class OrganigramGraphError extends Error {
  readonly code: OrganigramGraphErrorCode;

  constructor(code: OrganigramGraphErrorCode, message: string) {
    super(message);
    this.name = 'OrganigramGraphError';
    this.code = code;
  }
}

function edgeId(edge: OrganigramGraphEdge): string {
  return edge.id ?? JSON.stringify([edge.source, edge.target]);
}

function positive(value: number, allowZero = false): boolean {
  return Number.isFinite(value) && (allowZero ? value >= 0 : value > 0);
}

function validId(id: string): boolean {
  return typeof id === 'string' && id.trim().length > 0;
}

function applyNodeOrder<T>(
  graph: Graph<GraphLabel, NodeLabel, EdgeLabel>,
  nodes: readonly OrganigramGraphNode<T>[],
  edges: readonly OrganigramGraphEdge[],
): string[] {
  const order = new Map<string, number>();
  for (const node of nodes) {
    if (!Number.isFinite(node.order))
      throw new OrganigramGraphError('invalid-order', `Missing or invalid order: ${node.id}`);
    order.set(node.id, node.order!);
  }
  for (const edge of edges) {
    if (order.get(edge.source)! > order.get(edge.target)!)
      throw new OrganigramGraphError(
        'invalid-order', `Edge goes against node order: ${edge.source} → ${edge.target}`,
      );
  }
  const inDegree = new Map(nodes.map(node => [node.id, graph.predecessors(node.id)?.length ?? 0]));
  const available = nodes.filter(node => inDegree.get(node.id) === 0).map(node => node.id);
  const compare = (a: string, b: string): number => order.get(a)! - order.get(b)! || (a < b ? -1 : a > b ? 1 : 0);
  const sequence: string[] = [];
  while (available.length) {
    available.sort(compare);
    const id = available.shift()!;
    sequence.push(id);
    for (const successor of graph.successors(id) ?? []) {
      const remaining = inDegree.get(successor)! - 1;
      inDegree.set(successor, remaining);
      if (remaining === 0) available.push(successor);
    }
  }
  for (let index = 1; index < sequence.length; index++) {
    const source = sequence[index - 1];
    const target = sequence[index];
    if (!graph.hasEdge(source, target)) graph.setEdge(source, target, { weight: 0 });
  }
  return sequence;
}

function alignOrderedChains(
  graph: Graph<GraphLabel, NodeLabel, EdgeLabel>,
  edges: readonly OrganigramGraphEdge[],
  sequence: readonly string[],
  direction: NonNullable<OrganigramGraphOptions['direction']>,
  margin: number,
): void {
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  for (const edge of edges) {
    incoming.set(edge.target, [...(incoming.get(edge.target) ?? []), edge.source]);
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge.target]);
  }
  const vertical = direction === 'TB' || direction === 'BT';
  const extent = vertical ? graph.graph().width! : graph.graph().height!;
  for (const id of sequence) {
    const parents = incoming.get(id) ?? [];
    if (parents.length !== 1 || outgoing.get(parents[0])?.length !== 1) continue;
    const parent = graph.node(parents[0])!;
    const child = graph.node(id)!;
    const center = vertical ? parent.x! : parent.y!;
    const halfSize = (vertical ? child.width : child.height) / 2;
    if (center - halfSize < margin || center + halfSize > extent - margin) continue;
    if (vertical) child.x = center;
    else child.y = center;
  }
}

function straightPathIfClear(
  graph: Graph<GraphLabel, NodeLabel, EdgeLabel>,
  sourceId: string,
  targetId: string,
  direction: NonNullable<OrganigramGraphOptions['direction']>,
): string | null {
  const vertical = direction === 'TB' || direction === 'BT';
  const forward = direction === 'TB' || direction === 'LR';
  const source = graph.node(sourceId)!;
  const target = graph.node(targetId)!;
  const center = vertical ? source.x! : source.y!;
  if (center !== (vertical ? target.x! : target.y!)) return null;
  const start = (vertical ? source.y! : source.x!) + (forward ? 1 : -1) * (vertical ? source.height : source.width) / 2;
  const end = (vertical ? target.y! : target.x!) - (forward ? 1 : -1) * (vertical ? target.height : target.width) / 2;
  const route = vertical ? [{ x: center, y: start }, { x: center, y: end }] :
    [{ x: start, y: center }, { x: end, y: center }];
  if (!routeIsClear(graph, sourceId, targetId, route)) return null;
  return vertical ? `M ${center} ${start} L ${center} ${end}` : `M ${start} ${center} L ${end} ${center}`;
}

function routeIsClear(
  graph: Graph<GraphLabel, NodeLabel, EdgeLabel>,
  sourceId: string,
  targetId: string,
  route: readonly { x: number; y: number }[],
): boolean {
  for (const id of graph.nodes()) {
    if (id === sourceId || id === targetId) continue;
    const box = graph.node(id)!;
    const left = box.x! - box.width / 2;
    const right = box.x! + box.width / 2;
    const top = box.y! - box.height / 2;
    const bottom = box.y! + box.height / 2;
    for (let index = 1; index < route.length; index++) {
      const previous = route[index - 1];
      const current = route[index];
      if (previous.x === current.x && previous.x > left && previous.x < right &&
        Math.max(previous.y, current.y) > top && Math.min(previous.y, current.y) < bottom) return false;
      if (previous.y === current.y && previous.y > top && previous.y < bottom &&
        Math.max(previous.x, current.x) > left && Math.min(previous.x, current.x) < right) return false;
    }
  }
  return true;
}

function branchRails(
  graph: Graph<GraphLabel, NodeLabel, EdgeLabel>,
  edges: readonly OrganigramGraphEdge[],
  direction: NonNullable<OrganigramGraphOptions['direction']>,
): ReadonlyMap<string, number> {
  const vertical = direction === 'TB' || direction === 'BT';
  const forward = direction === 'TB' || direction === 'LR';
  const targets = new Map<string, string[]>();
  for (const edge of edges)
    targets.set(edge.source, [...(targets.get(edge.source) ?? []), edge.target]);
  const rails = new Map<string, number>();
  for (const [sourceId, children] of targets) {
    if (children.length < 2) continue;
    const source = graph.node(sourceId)!;
    const sourceEdge = (vertical ? source.y! : source.x!) +
      (forward ? 1 : -1) * (vertical ? source.height : source.width) / 2;
    const nearest = Math.min(...children.map(id => {
      const target = graph.node(id)!;
      const targetEdge = (vertical ? target.y! : target.x!) -
        (forward ? 1 : -1) * (vertical ? target.height : target.width) / 2;
      return (targetEdge - sourceEdge) * (forward ? 1 : -1);
    }));
    rails.set(sourceId, sourceEdge + (forward ? 1 : -1) * nearest / 2);
  }
  return rails;
}

function branchPathIfClear(
  graph: Graph<GraphLabel, NodeLabel, EdgeLabel>,
  sourceId: string,
  targetId: string,
  rail: number,
  direction: NonNullable<OrganigramGraphOptions['direction']>,
): string | null {
  const vertical = direction === 'TB' || direction === 'BT';
  const forward = direction === 'TB' || direction === 'LR';
  const source = graph.node(sourceId)!;
  const target = graph.node(targetId)!;
  const sourceCenter = vertical ? source.x! : source.y!;
  const targetCenter = vertical ? target.x! : target.y!;
  const start = (vertical ? source.y! : source.x!) + (forward ? 1 : -1) * (vertical ? source.height : source.width) / 2;
  const end = (vertical ? target.y! : target.x!) - (forward ? 1 : -1) * (vertical ? target.height : target.width) / 2;
  const route = vertical
    ? [
      { x: sourceCenter, y: start }, { x: sourceCenter, y: rail },
      { x: targetCenter, y: rail }, { x: targetCenter, y: end },
    ]
    : [
      { x: start, y: sourceCenter }, { x: rail, y: sourceCenter },
      { x: rail, y: targetCenter }, { x: end, y: targetCenter },
    ];
  if (!routeIsClear(graph, sourceId, targetId, route)) return null;
  return route.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
}

function orthogonalPath(
  points: readonly { x: number; y: number }[],
  source: NodeLabel,
  target: NodeLabel,
  direction: NonNullable<OrganigramGraphOptions['direction']>,
): string {
  const vertical = direction === 'TB' || direction === 'BT';
  const forward = direction === 'TB' || direction === 'LR';
  const primary = (point: { x: number; y: number }): number =>
    vertical ? point.y : point.x;
  const secondary = (point: { x: number; y: number }): number =>
    vertical ? point.x : point.y;
  const point = (along: number, across: number): { x: number; y: number } =>
    vertical ? { x: across, y: along } : { x: along, y: across };
  const sourceCenter = vertical ? source.x! : source.y!;
  const targetCenter = vertical ? target.x! : target.y!;
  const sourceEdge =
    (vertical ? source.y! : source.x!) +
    (forward
      ? (vertical ? source.height : source.width) / 2
      : -(vertical ? source.height : source.width) / 2);
  const targetEdge =
    (vertical ? target.y! : target.x!) +
    (forward
      ? -(vertical ? target.height : target.width) / 2
      : (vertical ? target.height : target.width) / 2);
  const waypoints = points.slice(1, -1);
  const rail = waypoints.length
    ? primary(waypoints[0])
    : (sourceEdge + targetEdge) / 2;
  const route = [point(sourceEdge, sourceCenter), point(rail, sourceCenter)];
  for (const waypoint of waypoints) {
    const previous = route[route.length - 1];
    if (
      primary(previous) !== primary(waypoint) &&
      secondary(previous) !== secondary(waypoint)
    )
      route.push(point(primary(waypoint), secondary(previous)));
    route.push(waypoint);
  }
  const last = route[route.length - 1];
  route.push(
    point(primary(last), targetCenter),
    point(targetEdge, targetCenter),
  );
  return route
    .filter(
      (current, index) =>
        !index ||
        current.x !== route[index - 1].x ||
        current.y !== route[index - 1].y,
    )
    .map((current, index) => `${index ? 'L' : 'M'} ${current.x} ${current.y}`)
    .join(' ');
}

export function layoutOrganigramGraph<T>(
  nodes: readonly OrganigramGraphNode<T>[],
  edges: readonly OrganigramGraphEdge[],
  options: OrganigramGraphOptions = {},
  sizes: ReadonlyMap<string, OrganigramGraphSize> = new Map(),
): OrganigramGraphLayout<T> {
  const config = {
    direction: options.direction ?? 'TB',
    rankBy: options.rankBy ?? 'topology',
    nodeWidth: options.nodeWidth ?? 250,
    nodeHeight: options.nodeHeight ?? 64,
    horizontalGap: options.horizontalGap ?? 40,
    verticalGap: options.verticalGap ?? 36,
    margin: options.margin ?? 16,
  };
  if (
    !['TB', 'BT', 'LR', 'RL'].includes(config.direction) ||
    !['topology', 'order'].includes(config.rankBy) ||
    !positive(config.nodeWidth) ||
    !positive(config.nodeHeight) ||
    !positive(config.horizontalGap, true) ||
    !positive(config.verticalGap, true) ||
    !positive(config.margin, true)
  ) {
    throw new OrganigramGraphError('invalid-options', 'Invalid graph dimensions or layout direction');
  }
  const graph = new Graph<GraphLabel, NodeLabel, EdgeLabel>({ directed: true });
  graph.setGraph({
    rankdir: config.direction,
    nodesep: config.horizontalGap,
    ranksep: config.verticalGap,
    marginx: config.margin,
    marginy: config.margin,
  });
  const sortedNodes = [...nodes].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const node of sortedNodes) {
    if (!validId(node.id)) throw new OrganigramGraphError('invalid-node-id', 'Node IDs must be nonempty strings');
    if (graph.hasNode(node.id)) throw new OrganigramGraphError('duplicate-node', `Duplicate node: ${node.id}`);
    const size = sizes.get(node.id) ?? {
      width: config.nodeWidth,
      height: config.nodeHeight,
    };
    if (!positive(size.width) || !positive(size.height))
      throw new OrganigramGraphError('invalid-options', `Invalid node size: ${node.id}`);
    graph.setNode(node.id, { width: size.width, height: size.height });
  }
  const sortedEdges = edges
    .map((edge) => ({ ...edge, id: edgeId(edge) }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const edgeIds = new Set<string>();
  for (const edge of sortedEdges) {
    if (!validId(edge.id) || !graph.hasNode(edge.source) || !graph.hasNode(edge.target))
      throw new OrganigramGraphError('invalid-edge', `Invalid edge: ${edge.id}`);
    if (edge.source === edge.target) throw new OrganigramGraphError('self-edge', `Self edge: ${edge.id}`);
    if (edgeIds.has(edge.id) || graph.hasEdge(edge.source, edge.target))
      throw new OrganigramGraphError('duplicate-edge', `Duplicate edge: ${edge.id}`);
    edgeIds.add(edge.id);
    graph.setEdge(edge.source, edge.target, {});
  }
  if (!graphlib.alg.isAcyclic(graph)) throw new OrganigramGraphError('cycle', 'Directed graph contains a cycle');
  const orderSequence = config.rankBy === 'order' ? applyNodeOrder(graph, sortedNodes, sortedEdges) : [];
  if (!nodes.length) return { nodes: [], edges: [], width: 0, height: 0 };
  layout(graph);
  if (config.rankBy === 'order')
    alignOrderedChains(graph, sortedEdges, orderSequence, config.direction, config.margin);
  const rails = config.rankBy === 'order'
    ? branchRails(graph, sortedEdges, config.direction)
    : new Map<string, number>();
  const vertical = config.direction === 'TB' || config.direction === 'BT';
  const backwards = config.direction === 'BT' || config.direction === 'RL';
  return {
    nodes: sortedNodes
      .map((node) => {
        const box = graph.node(node.id)!;
        return {
          ...node,
          x: box.x! - box.width / 2,
          y: box.y! - box.height / 2,
          width: box.width,
          height: box.height,
        };
      })
      .sort((a, b) => {
        const primary = vertical ? a.y + a.height / 2 - b.y - b.height / 2 : a.x + a.width / 2 - b.x - b.width / 2;
        return (backwards ? -primary : primary) || (vertical ? a.x - b.x : a.y - b.y);
      }),
    edges: sortedEdges.map((edge) => {
      const points = graph.edge(edge.source, edge.target)!.points!;
      return {
        ...edge,
        path: (config.rankBy === 'order' && straightPathIfClear(graph, edge.source, edge.target, config.direction)) ||
          (rails.has(edge.source) && branchPathIfClear(
            graph, edge.source, edge.target, rails.get(edge.source)!, config.direction,
          )) ||
          orthogonalPath(points, graph.node(edge.source)!, graph.node(edge.target)!, config.direction),
      };
    }),
    width: graph.graph().width!,
    height: graph.graph().height!,
  };
}

export function collectOrganigramAncestorEdges(
  edges: readonly OrganigramGraphEdge[],
  nodeId: string,
): ReadonlySet<string> {
  const incoming = new Map<string, OrganigramGraphEdge[]>();
  for (const edge of edges) {
    const list = incoming.get(edge.target) ?? [];
    list.push(edge);
    incoming.set(edge.target, list);
  }
  const visited = new Set<string>();
  const result = new Set<string>();
  const pending = [nodeId];
  while (pending.length) {
    const current = pending.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const edge of incoming.get(current) ?? []) {
      result.add(edgeId(edge));
      pending.push(edge.source);
    }
  }
  return result;
}
