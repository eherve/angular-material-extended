import { EditEntityTimeRangeFieldComponent } from "../../fields/edit-entity-time-range-field/edit-entity-time-range-field.component";
import { EditEntityTimeFieldComponent } from "../../fields/edit-entity-time-field/edit-entity-time-field.component";
import { EditEntityTextareaFieldComponent } from "../../fields/edit-entity-textarea-field/edit-entity-textarea-field.component";
import { EditEntityTextFieldComponent } from "../../fields/edit-entity-text-field/edit-entity-text-field.component";
import { EditEntitySortableListFieldComponent } from "../../fields/edit-entity-sortable-list-field/edit-entity-sortable-list-field.component";
import { EditEntitySliderFieldComponent } from "../../fields/edit-entity-slider-field/edit-entity-slider-field.component";
import { EditEntitySelectFieldComponent } from "../../fields/edit-entity-select-field/edit-entity-select-field.component";
import { EditEntityRadioFieldComponent } from "../../fields/edit-entity-radio-field/edit-entity-radio-field.component";
import { EditEntityNumberFieldComponent } from "../../fields/edit-entity-number-field/edit-entity-number-field.component";
import { EditEntityDurationFieldComponent } from "../../fields/edit-entity-duration-field/edit-entity-duration-field.component";
import { EditEntityDisplayFieldComponent } from "../../fields/edit-entity-display-field/edit-entity-display-field.component";
import { EditEntityDatetimeRangeFieldComponent } from "../../fields/edit-entity-datetime-range-field/edit-entity-datetime-range-field.component";
import { EditEntityDatetimeFieldComponent } from "../../fields/edit-entity-datetime-field/edit-entity-datetime-field.component";
import { EditEntityDateRangeFieldComponent } from "../../fields/edit-entity-date-range-field/edit-entity-date-range-field.component";
import { EditEntityDateFieldComponent } from "../../fields/edit-entity-date-field/edit-entity-date-field.component";
import { EditEntityControlFieldComponent } from "../../fields/edit-entity-control-field/edit-entity-control-field.component";
import { EditEntityChipsFieldComponent } from "../../fields/edit-entity-chips-field/edit-entity-chips-field.component";
import { EditEntityCheckboxFieldComponent } from "../../fields/edit-entity-checkbox-field/edit-entity-checkbox-field.component";
import { EditEntityAutocompleteFieldComponent } from "../../fields/edit-entity-autocomplete-field/edit-entity-autocomplete-field.component";
/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
  input,
  Signal,
} from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { isObservable, of, startWith, switchMap } from "rxjs";
import { SubSink } from "subsink";
import {
  EditEntityConditionalStateService,
  EditEntityFormGroup,
} from "@eherve/angular-material-forms/core";
import {
  EditEntityConditionalValue,
  EditEntityDisplayField,
  EditEntityFormField,
  EditEntityRecord,
} from "@eherve/angular-material-forms/core";

@Component({
  selector: "ame-field",
  templateUrl: "./edit-entity-field-renderer.component.html",
  styleUrls: ["./edit-entity-field-renderer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  host: { "[style.display]": "visible() ? null : 'none'" },
  imports: [
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
})
export class FormFieldComponent<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  readonly formGroup = input.required<EditEntityFormGroup>();
  readonly field = input.required<
    EditEntityFormField<TRecord> | EditEntityDisplayField<TRecord>
  >();
  readonly record = input<TRecord>();

  private readonly formValue = toSignal(
    toObservable(this.formGroup).pipe(
      switchMap((form) => form.valueChanges.pipe(startWith(form.value))),
    ),
  );
  private readonly conditions =
    new EditEntityConditionalStateService<TRecord>();
  private readonly visibilityRevision = signal(0);
  private readonly watchVisibility = effect((onCleanup) => {
    const state = this.field().visible;
    const subscriptions = new SubSink();
    this.conditions.watch(state, subscriptions, () =>
      this.visibilityRevision.update((revision) => revision + 1),
    );
    onCleanup(() => {
      subscriptions.unsubscribe();
      this.conditions.reset();
    });
  });
  readonly visible = computed(() => {
    this.formValue();
    this.visibilityRevision();
    return this.conditions.resolve(
      this.field().visible,
      this.record(),
      this.formGroup(),
      true,
    );
  });
  private readonly hint = this.resolvePresentation("hint");
  private readonly tooltip = this.resolvePresentation("tooltip");

  private readonly hintChanges = toObservable(this.hint);
  private readonly tooltipChanges = toObservable(this.tooltip);

  readonly renderedField = computed(() => {
    const field = this.field();
    if (field.kind === "display") return field;
    if (field.kind === "autocomplete" || field.kind === "sortable-list") {
      return { ...field, hint: this.hintChanges, tooltip: this.tooltipChanges };
    }
    // Keep field identity stable while control templates track presentation signals.
    const hint = this.hint;
    const tooltip = this.tooltip;
    return {
      ...field,
      get hint(): string | undefined {
        return hint();
      },
      get tooltip(): string | undefined {
        return tooltip();
      },
    };
  });

  private resolvePresentation(
    key: "hint" | "tooltip",
  ): Signal<string | undefined> {
    const source = computed(() => {
      const field = this.field();
      if (field.kind === "display") return undefined;
      const value: EditEntityConditionalValue<TRecord, string | undefined> =
        field[key];
      if (typeof value !== "function") return value;
      this.formValue();
      return value(this.record(), this.formGroup());
    });
    return toSignal(
      toObservable(source).pipe(
        switchMap((value) =>
          isObservable(value) ? value.pipe(startWith(undefined)) : of(value),
        ),
      ),
    );
  }
}
