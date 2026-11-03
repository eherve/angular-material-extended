import {
  EditEntityDialogIntl,
  EditEntityRecord,
  EditEntityRuntimeCard,
  EditEntityRuntimeCardAction,
  EditEntityRuntimeMenuOption,
  EditEntitySection,
} from "@eherve/angular-material-forms/core";
import { DialogNavigationController } from "@eherve/angular-material-section-tabs";
export interface FormRenderContext<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  intl: EditEntityDialogIntl;
  navigationController: DialogNavigationController;
  showEmptyFields: boolean;
  showEmptyFieldsLabel: string;
  onShowEmptyFieldsChange(checked: boolean): void;
  toggleCard(card: EditEntityRuntimeCard<TRecord>): void;
  handleCardAction(
    card: EditEntityRuntimeCard<TRecord>,
    action: EditEntityRuntimeCardAction<TRecord>,
    section: EditEntitySection<TRecord>,
  ): Promise<void>;
  handleCardMenuOption(
    card: EditEntityRuntimeCard<TRecord>,
    action: EditEntityRuntimeCardAction<TRecord>,
    option: EditEntityRuntimeMenuOption<TRecord>,
    section: EditEntitySection<TRecord>,
  ): Promise<void>;
}
