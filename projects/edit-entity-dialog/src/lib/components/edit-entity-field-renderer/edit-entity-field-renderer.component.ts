/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  Signal,
} from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { isObservable, of, startWith, switchMap } from "rxjs";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import {
  EditEntityConditionalValue,
  EditEntityDisplayField,
  EditEntityFormField,
  EditEntityRecord,
} from "../../edit-entity-dialog.types";

@Component({
  selector: "app-edit-entity-field-renderer",
  templateUrl: "./edit-entity-field-renderer.component.html",
  styleUrls: ["./edit-entity-field-renderer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EditEntityFieldRendererComponent<
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
