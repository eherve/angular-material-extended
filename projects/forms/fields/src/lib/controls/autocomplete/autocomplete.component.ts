import { MatChipsModule } from "@angular/material/chips";
import { MatMenuModule } from "@angular/material/menu";
import { ChangeDetectionStrategy, Component, forwardRef } from "@angular/core";
import {
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
} from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SearchControlBase } from "./search-control-base";
import { SearchPageDirective } from "@eherve/angular-material-forms/core";
import { AdaptiveSearchPanelDirective } from "@eherve/angular-material-forms/core";
@Component({
  selector: "app-form-control-autocomplete",
  standalone: true,
  styleUrls: ["../../internal/clear-button.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlAutocompleteComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormControlAutocompleteComponent),
      multi: true,
    },
  ],
  imports: [
    MatChipsModule,
    MatMenuModule,
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
export class FormControlAutocompleteComponent<
  TValue = unknown,
> extends SearchControlBase<TValue> {}
