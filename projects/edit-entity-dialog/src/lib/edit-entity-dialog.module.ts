import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgModule } from "@angular/core";
import { SectionTabsModule } from "@eherve/angular-material-section-tabs";
import { EditEntityAutocompleteFieldComponent } from "./fields/edit-entity-autocomplete-field/edit-entity-autocomplete-field.component";
import { EditEntityCheckboxFieldComponent } from "./fields/edit-entity-checkbox-field/edit-entity-checkbox-field.component";
import { EditEntityChipsFieldComponent } from "./fields/edit-entity-chips-field/edit-entity-chips-field.component";
import { EditEntityControlFieldComponent } from "./fields/edit-entity-control-field/edit-entity-control-field.component";
import { EditEntityDateFieldComponent } from "./fields/edit-entity-date-field/edit-entity-date-field.component";
import { EditEntityDateRangeFieldComponent } from "./fields/edit-entity-date-range-field/edit-entity-date-range-field.component";
import { EditEntityDatetimeFieldComponent } from "./fields/edit-entity-datetime-field/edit-entity-datetime-field.component";
import { EditEntityDatetimeRangeFieldComponent } from "./fields/edit-entity-datetime-range-field/edit-entity-datetime-range-field.component";
import { EditEntityDisplayFieldComponent } from "./fields/edit-entity-display-field/edit-entity-display-field.component";
import { EditEntityDurationFieldComponent } from "./fields/edit-entity-duration-field/edit-entity-duration-field.component";
import { EditEntityNumberFieldComponent } from "./fields/edit-entity-number-field/edit-entity-number-field.component";
import { EditEntityRadioFieldComponent } from "./fields/edit-entity-radio-field/edit-entity-radio-field.component";
import { EditEntitySelectFieldComponent } from "./fields/edit-entity-select-field/edit-entity-select-field.component";
import { EditEntitySliderFieldComponent } from "./fields/edit-entity-slider-field/edit-entity-slider-field.component";
import { EditEntitySortableListFieldComponent } from "./fields/edit-entity-sortable-list-field/edit-entity-sortable-list-field.component";
import { EditEntityTextFieldComponent } from "./fields/edit-entity-text-field/edit-entity-text-field.component";
import { EditEntityTextareaFieldComponent } from "./fields/edit-entity-textarea-field/edit-entity-textarea-field.component";
import { EditEntityTimeFieldComponent } from "./fields/edit-entity-time-field/edit-entity-time-field.component";
import { EditEntityTimeRangeFieldComponent } from "./fields/edit-entity-time-range-field/edit-entity-time-range-field.component";
import { EditEntityComponent } from "./components/edit-entity-component/edit-entity-component.component";
import { EditEntityDialog } from "./components/edit-entity-dialog/edit-entity-dialog.component";
import { EditEntityFieldRendererComponent } from "./components/edit-entity-field-renderer/edit-entity-field-renderer.component";
import { EditEntityResponsiveGridDirective } from "./directives/edit-entity-responsive-grid.directive";
@NgModule({
  declarations: [
    EditEntityComponent,
    EditEntityDialog,
    EditEntityFieldRendererComponent,
    EditEntityResponsiveGridDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule,
    SectionTabsModule,
    EditEntityAutocompleteFieldComponent,
    EditEntityCheckboxFieldComponent,
    EditEntityChipsFieldComponent,
    EditEntityControlFieldComponent,
    EditEntityDateFieldComponent,
    EditEntityDateRangeFieldComponent,
    EditEntityDatetimeFieldComponent,
    EditEntityDatetimeRangeFieldComponent,
    EditEntityDisplayFieldComponent,
    EditEntityDurationFieldComponent,
    EditEntityNumberFieldComponent,
    EditEntityRadioFieldComponent,
    EditEntitySelectFieldComponent,
    EditEntitySliderFieldComponent,
    EditEntitySortableListFieldComponent,
    EditEntityTextFieldComponent,
    EditEntityTextareaFieldComponent,
    EditEntityTimeFieldComponent,
    EditEntityTimeRangeFieldComponent,
  ],
  exports: [EditEntityComponent, EditEntityDialog],
})
export class EditEntityDialogModule {}
