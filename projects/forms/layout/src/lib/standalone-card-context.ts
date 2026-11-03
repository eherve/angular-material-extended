import {
  EditEntityCard,
  EditEntityCardAction,
  EditEntityComponentOptions,
  EditEntityConditionalStateService,
  EditEntityDialogIntl,
  EditEntityFormGroup,
  EditEntityRecord,
  EditEntityRenderService,
  EditEntityRuntimeCard,
  EditEntityRuntimeCardAction,
  EditEntityRuntimeMenuOption,
  EditEntitySection,
  EditEntitySectionCardActionEvent,
} from "@eherve/angular-material-forms/core";
import { DialogNavigationController } from "@eherve/angular-material-section-tabs";
import { Subject, Subscription } from "rxjs";
import { SubSink } from "subsink";
import { FormRenderContext } from "./form-render-context";

let nextCardId = 0;
/** Standalone cards delegate business actions; they never create controls or persist records. */
export class StandaloneCardContext<TRecord extends EditEntityRecord>
  implements FormRenderContext<TRecord>
{
  readonly intl = new EditEntityDialogIntl();
  readonly navigationController = new DialogNavigationController();
  showEmptyFields = true;
  showEmptyFieldsLabel = this.intl.messages.showEmptyFields;
  private readonly bodyId = `standalone-card-${nextCardId++}`;
  private options!: EditEntityComponentOptions<TRecord>;
  private form!: EditEntityFormGroup;
  private section!: EditEntitySection<TRecord>;
  private expanded?: boolean;
  private card?: EditEntityCard<TRecord>;
  private subs = new Subscription();
  private conditions = new SubSink();
  private readonly events = new Subject<
    EditEntitySectionCardActionEvent<TRecord>
  >();
  constructor(
    private readonly render: EditEntityRenderService<TRecord>,
    private readonly changed: () => void,
    private readonly conditional: EditEntityConditionalStateService<TRecord>,
    private readonly actionRequested: (
      event: EditEntitySectionCardActionEvent<TRecord>,
    ) => void,
  ) {}
  bind(
    card: EditEntityCard<TRecord>,
    form: EditEntityFormGroup,
    record: TRecord | undefined,
    section?: EditEntitySection<TRecord>,
  ): void {
    if (this.card !== card) {
      this.expanded = undefined;
      this.card = card;
    }
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.conditions.unsubscribe();
    this.conditions = new SubSink();
    this.conditional.reset();
    this.form = form;
    this.section = section ?? { id: "standalone", label: "", cards: [card] };
    this.options = {
      record,
      displayOptions: { section: { ...this.section, cards: [card] } },
    };
    const watch = (
      state: Parameters<EditEntityConditionalStateService<TRecord>["watch"]>[0],
    ): void =>
      this.conditional.watch(state, this.conditions, () => this.changed());
    watch(this.section.visible);
    watch(card.visible);
    for (const field of card.fields ?? []) {
      if ("visible" in field) watch(field.visible);
    }
    for (const action of card.actions ?? []) {
      watch(action.visible);
      watch(action.disabled);
      for (const option of action.menuOptions ?? []) {
        watch(option.visible);
        watch(option.disabled);
      }
    }
    this.subs.add(form.valueChanges.subscribe(() => this.changed()));
    this.subs.add(form.statusChanges.subscribe(() => this.changed()));
  }
  renderCard(): EditEntityRuntimeCard<TRecord> | undefined {
    const state = this.render.buildRenderState(
      this.options,
      this.form,
      this.showEmptyFields,
    );
    const item = state.sections?.[0]?.items.find(
      (item) => item.type !== "break",
    );
    if (!item) return undefined;
    return {
      ...item,
      expanded:
        !item.source.expandable ||
        (this.expanded ?? item.source.initiallyExpanded !== false),
      bodyId: this.bodyId,
      componentInputs: this.render.filterDeclaredComponentInputs(
        item.component,
        {
          ...item.componentInputs,
          cardActionEvents$: this.events.asObservable(),
        },
      ),
    };
  }
  onShowEmptyFieldsChange(checked: boolean): void {
    this.showEmptyFields = checked;
    this.changed();
  }
  toggleCard(card: EditEntityRuntimeCard<TRecord>): void {
    this.expanded = !card.expanded;
    this.changed();
  }
  async handleCardAction(
    card: EditEntityRuntimeCard<TRecord>,
    action: EditEntityRuntimeCardAction<TRecord>,
    section: EditEntitySection<TRecord>,
  ): Promise<void> {
    if (!action.isDisabled) this.emit(card, action, section);
  }
  async handleCardMenuOption(
    card: EditEntityRuntimeCard<TRecord>,
    action: EditEntityRuntimeCardAction<TRecord>,
    option: EditEntityRuntimeMenuOption<TRecord>,
    section: EditEntitySection<TRecord>,
  ): Promise<void> {
    if (!action.isDisabled && !option.isDisabled)
      this.emit(card, action, section, option);
  }
  private emit(
    card: EditEntityRuntimeCard<TRecord>,
    action: EditEntityRuntimeCardAction<TRecord>,
    section: EditEntitySection<TRecord>,
    option?: EditEntityRuntimeMenuOption<TRecord>,
  ): void {
    const event: EditEntitySectionCardActionEvent<TRecord> = {
      record: this.options.record,
      formGroup: this.form,
      options: this.options,
      section,
      card: card.source,
      action: action as EditEntityCardAction<TRecord>,
      option,
      runtimeCard: card,
      runtimeAction: action,
      runtimeOption: option,
      optionId: option?.id,
    };
    this.events.next(event);
    this.actionRequested(event);
  }
  unbind(): void {
    this.subs.unsubscribe();
    this.conditions.unsubscribe();
  }
  destroy(): void {
    this.unbind();
    this.events.complete();
    this.navigationController.destroy();
  }
}
