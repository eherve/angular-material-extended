export interface CommercialDocumentAmounts {
  totalExclTax: number;
  totalVat: number;
  totalInclTax: number;
}
export interface CommercialDocumentPricing extends CommercialDocumentAmounts {
  grossExclTax: number;
  lineDiscountAmount: number;
  subtotalExclTax: number;
  discountAmount: number;
  totalDiscountAmount: number;
  vatBreakdown: readonly {
    vatRate: number;
    baseExclTax: number;
    totalVat: number;
  }[];
}
export interface CommercialDocumentEditorNode<T = unknown> {
  id: string;
  title: string;
  data: T;
  amounts?: CommercialDocumentAmounts;
  quantity?: number;
  children?: readonly CommercialDocumentEditorNode<T>[];
  readOnly?: boolean;
  canRemove?: boolean;
  canMove?: boolean;
}
export interface CommercialDocumentNodeEvent<T = unknown> {
  node: CommercialDocumentEditorNode<T>;
  parent: CommercialDocumentEditorNode<T> | null;
}
export interface CommercialDocumentMoveEvent<T = unknown>
  extends CommercialDocumentNodeEvent<T> {
  direction: -1 | 1;
}
export interface CommercialDocumentEditorContext<T = unknown>
  extends CommercialDocumentNodeEvent<T> {
  $implicit: CommercialDocumentEditorNode<T>;
  data: T;
  readOnly: boolean;
}
export interface CommercialDocumentDiscountHistory {
  author?: string;
  date: Date | string | number;
}
