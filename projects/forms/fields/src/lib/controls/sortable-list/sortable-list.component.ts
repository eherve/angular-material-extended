import { NgTemplateOutlet } from "@angular/common";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatMenuModule } from "@angular/material/menu";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SearchControlBase } from "../autocomplete/search-control-base";
import { SearchPageDirective } from "@eherve/angular-material-forms/core";
import { AdaptiveSearchPanelDirective } from "@eherve/angular-material-forms/core";
@Component({
  selector: "app-form-control-sortable-list",
  standalone: true,
  styleUrls: ["../../internal/clear-button.scss"],
  imports: [
    NgTemplateOutlet,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    DragDropModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    SearchPageDirective,
    AdaptiveSearchPanelDirective,
  ],
  templateUrl: "../autocomplete/search-control.html",
  styles: [
    ":host, mat-form-field {display:block;width:100%} .selected-item {display:flex;align-items:center;gap:var(--ngx-mat-extended-space-2, 8px)} .selected-name {flex:1} small {display:block;opacity:.7} .error {color:var(--mat-sys-error)}",
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormControlSortableListComponent<TValue = unknown> extends SearchControlBase<TValue> {
  @Input() override itemActions:
    | TemplateRef<{ $implicit: TValue; index: number; disabled: boolean }>
    | undefined = undefined;
  override multiple = true;
  override panelWidth = "";
  override appearance = "fill" as const;
  override selectionLayout: "chips" | "rows" = "rows";
  override readonly sortable = true;
}
