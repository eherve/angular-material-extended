export interface OrganigramNode<T = unknown> {
  type: string;
  entity?: T | null;
  hasChildren?: boolean;
  children?: readonly OrganigramNode<T>[];
  hideChildren?: boolean;
  selected?: boolean;
  onClick?: (node: OrganigramTreeNode<T>) => Promise<readonly OrganigramNode<T>[] | void>;
}

let nextNodeId = 0;

export class OrganigramTreeNode<T = unknown> implements OrganigramNode<T> {
  readonly id: string;
  type: string;
  entity?: T | null;
  hasChildren?: boolean;
  hideChildren?: boolean;
  selected?: boolean;
  parent?: OrganigramTreeNode<T>;
  depth: number;
  children: OrganigramTreeNode<T>[] = [];
  onClick?: (node: OrganigramTreeNode<T>) => Promise<readonly OrganigramNode<T>[] | void>;

  constructor(node: OrganigramNode<T>, depth = 0) {
    Object.assign(this, node);
    this.id = `ngx-mat-organigram-node-${nextNodeId++}`;
    this.type = node.type;
    this.parent = undefined;
    this.depth = depth;
    this.children = [];
    for (const child of node.children ?? []) this.addChild(child);
  }

  addChild(node: OrganigramNode<T>): void {
    const child = node instanceof OrganigramTreeNode ? node : new OrganigramTreeNode(node, this.depth + 1);
    child.parent = this;
    child.setDepth(this.depth + 1);
    this.children = [...this.children, child];
  }

  private setDepth(depth: number): void {
    this.depth = depth;
    for (const child of this.children) child.setDepth(depth + 1);
  }

  getParent(index = 0): OrganigramTreeNode<T> | null {
    const parents: OrganigramTreeNode<T>[] = [];
    for (let parent = this.parent; parent; parent = parent.parent) parents.unshift(parent);
    const position = index < 0 ? Math.abs(index) - 1 : parents.length - 1 - index;
    return parents[position] ?? null;
  }
}
