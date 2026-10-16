import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatChipsModule } from "@angular/material/chips";
import { Observable, Subscription } from "rxjs";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { ChipsFormField } from "../edit-entity-field.types";
@Component({
  selector: "app-edit-entity-chips-field",
  standalone: true,
  imports: [MatChipsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mat-chip-listbox
    [attr.aria-label]="field.label"
    [multiple]="!!field.multiple"
    [formControl]="formGroup.requireFormControl(field.name)"
  >
    @for (option of options; track option) {
      <mat-chip-option
        [value]="option.value"
        [style.color]="option.color ?? null"
        >{{ option.name }}</mat-chip-option
      >
    }
  </mat-chip-listbox>`,
})
export class EditEntityChipsFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: ChipsFormField<TRecord>;
  options: import("../edit-entity-field.types").ChipsFormFieldOption[] = [];
  private sub?: Subscription;
  constructor(private readonly cdr: ChangeDetectorRef) {}
  ngOnChanges(): void {
    this.sub?.unsubscribe();
    const source = this.field.options;
    if (Array.isArray(source)) this.setOptions(source);
    else
      this.sub = (
        source as Observable<
          import("../edit-entity-field.types").ChipsFormFieldOption[]
        >
      ).subscribe((values) => this.setOptions(values));
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  private setOptions(
    values: import("../edit-entity-field.types").ChipsFormFieldOption[],
  ): void {
    this.options = values ?? [];
    this.cdr.markForCheck();
  }
}
