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

export function layoutOrganigramGraph<T>(
  nodes: readonly OrganigramGraphNode<T>[],
  edges: readonly OrganigramGraphEdge[],
  options: OrganigramGraphOptions = {},
  sizes: ReadonlyMap<string, OrganigramGraphSize> = new Map(),
): OrganigramGraphLayout<T> {
  const config = {
    direction: options.direction ?? 'TB',
    nodeWidth: options.nodeWidth ?? 250,
    nodeHeight: options.nodeHeight ?? 64,
    horizontalGap: options.horizontalGap ?? 40,
    verticalGap: options.verticalGap ?? 36,
    margin: options.margin ?? 16,
  };
  if (
    !['TB', 'BT', 'LR', 'RL'].includes(config.direction) ||
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
  if (!nodes.length) return { nodes: [], edges: [], width: 0, height: 0 };
  layout(graph);
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
        path: points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '),
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
