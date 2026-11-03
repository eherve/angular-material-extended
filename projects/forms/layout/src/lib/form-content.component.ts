import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTabsModule } from "@angular/material/tabs";
import {
  EditEntityFormGroup,
  EditEntityRecord,
  EditEntityRenderState,
} from "@eherve/angular-material-forms/core";
import { SectionTabsModule } from "@eherve/angular-material-section-tabs";
import { EditEntityResponsiveGridDirective } from "./edit-entity-responsive-grid.directive";
import { FormCardComponent } from "./form-card.component";
import { FormRenderContext } from "./form-render-context";
@Component({
  selector: "ame-form-content",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MatSlideToggleModule,
    SectionTabsModule,
    EditEntityResponsiveGridDirective,
    FormCardComponent,
  ],
  templateUrl: "./form-content.component.html",
  styleUrl: "./form-layout.scss",
})
export class FormContentComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  readonly state = input.required<EditEntityRenderState<TRecord>>();
  readonly formGroup = input.required<EditEntityFormGroup>();
  readonly options = input.required<{ record?: TRecord }>();
  readonly context = input.required<FormRenderContext<TRecord>>();
}
