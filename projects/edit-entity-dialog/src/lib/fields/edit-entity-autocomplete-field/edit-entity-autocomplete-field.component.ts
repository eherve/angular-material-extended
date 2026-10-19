import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormControlAutocompleteComponent } from "../../controls/autocomplete/autocomplete.component";
import { SearchFieldBase } from "../edit-entity-autocomplete-field/search-field-base";
@Component({
  selector: "app-edit-entity-autocomplete-field",
  standalone: true,
  imports: [FormControlAutocompleteComponent, MatTooltipModule],
  template: `@if (service) {
    <app-form-control-autocomplete
      [control]="formGroup.requireFormControl(field.name)"
      [service]="service"
      [label]="field.label"
      [hint]="hint"
      [placeholder]="field.placeholder ?? ''"
      [multiple]="multiple"
      [matTooltip]="tooltip ?? ''"
    />
  }`,
  styles: [":host {display:block;width:100%}"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEntityAutocompleteFieldComponent<
  TRecord extends { _id?: string },
> extends SearchFieldBase<TRecord> {}
