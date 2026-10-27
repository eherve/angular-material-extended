export interface OrganigramGraphNode<T = unknown> {
  id: string;
  entity?: T | null;
  label?: string;
  type?: string;
  selected?: boolean;
  order?: number;
}

export interface OrganigramGraphEdge {
  id?: string;
  source: string;
  target: string;
}

export interface OrganigramGraphOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  rankBy?: 'topology' | 'order';
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalGap?: number;
  verticalGap?: number;
  margin?: number;
}

export interface OrganigramGraphSize {
  width: number;
  height: number;
}

export interface OrganigramGraphLayoutNode<T> extends OrganigramGraphNode<T>, OrganigramGraphSize {
  x: number;
  y: number;
}

export interface OrganigramGraphLayoutEdge extends OrganigramGraphEdge {
  id: string;
  path: string;
}

export interface OrganigramGraphLayout<T> extends OrganigramGraphSize {
  nodes: OrganigramGraphLayoutNode<T>[];
  edges: OrganigramGraphLayoutEdge[];
}

export type OrganigramGraphErrorCode =
  | 'invalid-node-id'
  | 'duplicate-node'
  | 'invalid-edge'
  | 'duplicate-edge'
  | 'self-edge'
  | 'cycle'
  | 'invalid-order'
  | 'invalid-options';
