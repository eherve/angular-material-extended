import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormControlSortableListComponent } from "../../controls/sortable-list/sortable-list.component";
import { SearchFieldBase } from "../edit-entity-autocomplete-field/search-field-base";
@Component({
  selector: "app-edit-entity-sortable-list-field",
  standalone: true,
  imports: [FormControlSortableListComponent, MatTooltipModule],
  template: `@if (service) {
    <app-form-control-sortable-list
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
export class EditEntitySortableListFieldComponent<
  TRecord extends { _id?: string },
> extends SearchFieldBase<TRecord> {}
