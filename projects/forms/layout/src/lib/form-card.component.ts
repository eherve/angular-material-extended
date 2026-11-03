import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import {
  EditEntityCard,
  EditEntityConditionalStateService,
  EditEntityFormGroup,
  EditEntityRecord,
  EditEntityRenderService,
  EditEntityRuntimeCard,
  EditEntitySection,
  EditEntitySectionCardActionEvent,
} from "@eherve/angular-material-forms/core";
import { FormFieldComponent } from "@eherve/angular-material-forms/fields";
import { EditEntityResponsiveGridDirective } from "./edit-entity-responsive-grid.directive";
import { FormRenderContext } from "./form-render-context";
import { StandaloneCardContext } from "./standalone-card-context";
@Component({
  selector: "ame-field-card",
  host: { "[class.form-card--single]": "singleCard()" },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    FormFieldComponent,
    EditEntityResponsiveGridDirective,
  ],
  providers: [EditEntityConditionalStateService, EditEntityRenderService],
  templateUrl: "./form-card.component.html",
  styleUrls: ["./form-layout.scss", "./form-card.component.scss"],
})
export class FormCardComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> implements OnDestroy
{
  readonly singleCard = input(false);
  readonly card = input.required<EditEntityCard<TRecord>>();
  readonly formGroup = input.required<EditEntityFormGroup>();
  readonly record = input<TRecord>();
  readonly section = input<EditEntitySection<TRecord>>();
  readonly runtimeCard = input<EditEntityRuntimeCard<TRecord>>();
  readonly context = input<FormRenderContext<TRecord>>();
  readonly updated = output<void>();
  private destroyed = false;
  readonly actionRequested =
    output<EditEntitySectionCardActionEvent<TRecord>>();
  readonly renderedCard = signal<EditEntityRuntimeCard<TRecord> | undefined>(
    undefined,
  );
  readonly renderContext = computed(() => this.context() ?? this.local);
  readonly renderedSection = computed(
    () =>
      this.section() ?? { id: "standalone", label: "", cards: [this.card()] },
  );
  private readonly render = inject(
    EditEntityRenderService,
  ) as EditEntityRenderService<TRecord>;
  private readonly local = new StandaloneCardContext<TRecord>(
    this.render,
    () => this.rebuild(),
    inject(
      EditEntityConditionalStateService,
    ) as EditEntityConditionalStateService<TRecord>,
    (event) => this.actionRequested.emit(event),
  );
  constructor() {
    this.render.markUpdated = () => {
      if (!this.destroyed) this.updated.emit();
    };
    effect(() => {
      const card = this.card();
      const form = this.formGroup();
      const record = this.record();
      const section = this.renderedSection();
      if (this.context()) {
        this.local.unbind();
        this.renderedCard.set(this.runtimeCard());
        return;
      }
      this.local.bind(card, form, record, section);
      this.rebuild();
    });
  }
  private rebuild(): void {
    this.renderedCard.set(this.local.renderCard());
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.local.destroy();
  }
}
