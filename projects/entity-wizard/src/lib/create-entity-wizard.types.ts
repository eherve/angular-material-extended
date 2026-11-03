import {
  EditEntityComponentOptions,
  EditEntityRecord,
  EditEntityTabDisplayOptions,
} from "@eherve/angular-material-forms/core";

export interface CreateEntityWizardStep<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  optional?: boolean;
  displayOptions: EditEntityTabDisplayOptions<TRecord>;
  /** Explicit control paths, including controls prepared by the host. Defaults to rendered fields. */
  fields?: string[];
  /** This step's components persist their own mutations; Continue never submits the form. */
  componentManaged?: boolean;
}

export interface CreateEntityWizardConfiguration<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  steps: CreateEntityWizardStep<TRecord>[];
  icon?: string;
  nextLabel?: string;
  createNextLabel?: string;
  skipLabel?: string;
  finishLaterLabel?: string;
  finishLabel?: string;
  optionalLabel?: string;
  unsavedLabel?: string;
}

export interface CreateEntityWizardComponentOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> extends EditEntityComponentOptions<TRecord> {
  wizard: CreateEntityWizardConfiguration<TRecord>;
}

export type CreateEntityWizardOptions<
  TRecord extends EditEntityRecord = EditEntityRecord,
> = Omit<
  EditEntityComponentOptions<TRecord>,
  "displayOptions" | "record" | "wizard" | "navigation"
> &
  CreateEntityWizardConfiguration<TRecord>;

/** Normalize before decorating access/fields. The opening service uses this exact options object. */
export function createEntityWizardOptions<TRecord extends EditEntityRecord>(
  options: CreateEntityWizardOptions<TRecord>,
): CreateEntityWizardComponentOptions<TRecord> {
  if (!options.steps.length)
    throw new Error("A creation wizard requires at least one step");
  const {
    steps,
    icon,
    nextLabel,
    createNextLabel,
    skipLabel,
    finishLaterLabel,
    finishLabel,
    optionalLabel,
    unsavedLabel,
    ...base
  } = options;
  return {
    ...base,
    service: base.service
      ? { ...base.service, closeOnUpsert: false }
      : undefined,
    wizard: {
      steps,
      icon,
      nextLabel,
      createNextLabel,
      skipLabel,
      finishLaterLabel,
      finishLabel,
      optionalLabel,
      unsavedLabel,
    },
    displayOptions: {
      tabs: steps.map((step) => ({
        id: step.id,
        label: step.label,
        icon: step.icon,
        displayOptions: step.displayOptions,
      })),
    },
  };
}
