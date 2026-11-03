import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import {
  EditEntityComponentOptions,
  EditEntityConditionalStateService,
  EditEntityFormBuilderService,
  EditEntityRecord,
  EditEntityRenderService,
  EditEntitySubmitValueService,
} from "@eherve/angular-material-forms/core";
import { EntityFormSession } from "@eherve/angular-material-forms/editor";
import { FormContentComponent } from "@eherve/angular-material-forms/layout";
@Component({
  selector: "app-edit-entity-component",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormContentComponent,
  ],
  providers: [
    EntityFormSession,
    EditEntityConditionalStateService,
    EditEntityFormBuilderService,
    EditEntityRenderService,
    EditEntitySubmitValueService,
  ],
  templateUrl: "./edit-entity-component.component.html",
  styleUrl: "./edit-entity-component.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEntityComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnInit, OnChanges, OnDestroy
{
  @Input({ required: true }) options!: EditEntityComponentOptions<TRecord>;
  @Input() displayMode: "page" | "dialog" = "page";
  readonly session = inject<EntityFormSession<TRecord>>(EntityFormSession);
  @Output() readonly result = this.session.result;
  @Output() readonly closeRequest = this.session.closeRequest;
  ngOnInit(): void {
    this.session.options = this.options;
    this.session.displayMode = this.displayMode;
    void this.session.initialize();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["options"] && !changes["options"].firstChange) {
      this.session.options = this.options;
      void this.session.initialize();
    }
  }
  ngOnDestroy(): void {
    this.session.destroy();
  }
  get formGroup(): import("@eherve/angular-material-forms/core").EditEntityFormGroup {
    return this.session.formGroup;
  }
  create(): Promise<void> {
    return this.session.create();
  }
  update(): Promise<void> {
    return this.session.update();
  }
  remove(): Promise<void> {
    return this.session.remove();
  }
  archive(): Promise<void> {
    return this.session.archive();
  }
  readonly markComponentUpdated = (): void =>
    this.session.markComponentUpdated();
  requestClose(): Promise<void> {
    return this.session.requestClose();
  }
  refreshPresentation(): void {
    this.session.refreshPresentation();
  }
  submitFromKeyboard(): boolean {
    return this.session.submitFromKeyboard();
  }
}
