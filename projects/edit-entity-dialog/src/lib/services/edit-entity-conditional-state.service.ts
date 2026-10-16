/** @format */

import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable, isObservable } from "rxjs";
import { SubSink } from "subsink";
import {
  EditEntityConditionalState,
  EditEntityRecord,
} from "../edit-entity-dialog.types";

@Injectable()
export class EditEntityConditionalStateService<
  TRecord extends EditEntityRecord = EditEntityRecord,
> {
  private readonly observableValues = new Map<Observable<boolean>, boolean>();

  reset(): void {
    this.observableValues.clear();
  }

  watch(
    state: EditEntityConditionalState<TRecord> | undefined,
    subsink: SubSink,
    refresh: () => void,
  ): void {
    if (!state || !isObservable(state)) return;

    subsink.add(
      state.subscribe((value) => {
        this.observableValues.set(state, value);
        refresh();
      }),
    );
  }

  resolve(
    state: EditEntityConditionalState<TRecord> | undefined,
    record: TRecord | undefined,
    formGroup: FormGroup,
    fallback: boolean,
  ): boolean {
    if (state === undefined || state === null) return fallback;
    if (typeof state === "boolean") return state;
    if (isObservable(state))
      return this.observableValues.get(state) ?? fallback;
    if (typeof state === "function") return state(record, formGroup);
    return fallback;
  }
}
