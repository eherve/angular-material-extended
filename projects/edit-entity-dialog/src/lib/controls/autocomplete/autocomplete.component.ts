import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SearchControlBase } from "../autocomplete/search-control-base";
import { SearchPageDirective } from "../../internal/search/pagination.directive";
import { AdaptiveSearchPanelDirective } from "../../internal/search/adaptive-panel.directive";
@Component({
  selector: "app-form-control-autocomplete",
  standalone: true,
  styleUrls: ["../../internal/clear-button.scss"],
  imports: [
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
  templateUrl: "./search-control.html",
  styles: [
    ":host, mat-form-field {display:block;width:100%} .selected-item {display:flex;align-items:center;gap:var(--ngx-mat-extended-space-2, 8px)} .selected-name {flex:1} small {display:block;opacity:.7} .error {color:var(--mat-sys-error)}",
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormControlAutocompleteComponent extends SearchControlBase {}
