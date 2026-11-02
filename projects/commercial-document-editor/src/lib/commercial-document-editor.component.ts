import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  input,
  output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import {
  CommercialDocumentDiscountHistory,
  CommercialDocumentEditorContext,
  CommercialDocumentEditorNode,
  CommercialDocumentMoveEvent,
  CommercialDocumentNodeEvent,
  CommercialDocumentPricing,
} from "./commercial-document-editor.models";

@Component({
  selector: "ngx-mat-commercial-document-editor",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: "./commercial-document-editor.component.html",
  styleUrl: "./commercial-document-editor.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommercialDocumentEditorComponent<T = unknown> {
  readonly nodes = input<readonly CommercialDocumentEditorNode<T>[]>([]);
  readonly title = input("Lignes");
  readonly emptyLabel = input("Aucune ligne");
  readonly readOnly = input(false);
  readonly embedded = input(false);
  readonly pricing = input<CommercialDocumentPricing | null>(null);
  readonly discountControl = input<
    FormControl<number> | FormControl<number | null> | null
  >(null);
  readonly showDiscounts = input(true);
  readonly discountHistory = input<
    readonly CommercialDocumentDiscountHistory[]
  >([]);
  readonly warning = input<string | null>(null);
  readonly locale = input("fr");
  readonly currency = input("EUR");
  readonly amountScopeLabel = input("document");
  readonly toolbarTemplate = input<TemplateRef<{ readOnly: boolean }> | null>(
    null,
  );
  readonly editorTemplate = input<TemplateRef<
    CommercialDocumentEditorContext<T>
  > | null>(null);
  readonly nodeFooterTemplate = input<TemplateRef<
    CommercialDocumentEditorContext<T>
  > | null>(null);
  readonly nodeHeaderExtraTemplate = input<TemplateRef<
    CommercialDocumentEditorContext<T>
  > | null>(null);
  readonly moveNode = output<CommercialDocumentMoveEvent<T>>();
  readonly removeNode = output<CommercialDocumentNodeEvent<T>>();

  locked(
    node: CommercialDocumentEditorNode<T>,
    parent: CommercialDocumentEditorNode<T> | null,
  ): boolean {
    return this.readOnly() || !!node.readOnly || !!parent?.readOnly;
  }
  context(
    node: CommercialDocumentEditorNode<T>,
    parent: CommercialDocumentEditorNode<T> | null,
  ): CommercialDocumentEditorContext<T> {
    return {
      $implicit: node,
      node,
      data: node.data,
      parent,
      readOnly: this.locked(node, parent),
    };
  }
  move(
    node: CommercialDocumentEditorNode<T>,
    parent: CommercialDocumentEditorNode<T> | null,
    direction: -1 | 1,
  ): void {
    if (!this.locked(node, parent) && node.canMove !== false)
      this.moveNode.emit({ node, parent, direction });
  }
  remove(
    node: CommercialDocumentEditorNode<T>,
    parent: CommercialDocumentEditorNode<T> | null,
  ): void {
    if (!this.locked(node, parent) && node.canRemove !== false)
      this.removeNode.emit({ node, parent });
  }
}
