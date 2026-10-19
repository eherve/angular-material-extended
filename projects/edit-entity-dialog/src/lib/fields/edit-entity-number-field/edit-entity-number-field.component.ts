import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { FormControlNumberComponent } from "../../controls/number/number.component";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { NumberFormField } from "../edit-entity-field.types";
import { Subscription } from "rxjs";

@Component({
  selector: "app-edit-entity-number-field",
  standalone: true,
  imports: [FormControlNumberComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-form-control-number
    [control]="control"
    [label]="field.label"
    [hint]="field.hint"
    [placeholder]="field.placeholder ?? ''"
    [prefixIcon]="field.prefixIcon"
    [suffix]="field.suffix"
    [hasCopyBtn]="field.hasCopyBtn ?? false"
    [min]="min"
    [max]="max"
    [step]="field.step"
    [isInteger]="!!field.isInteger"
  />`,
})
export class EditEntityNumberFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: NumberFormField<TRecord>;
  get control() {
    return this.formGroup.requireFormControl(this.field.name);
  }
  min?: number | string;
  max?: number | string;
  private boundsSub = new Subscription();
  constructor(private readonly cdr: ChangeDetectorRef) {}
  ngOnChanges(): void {
    this.boundsSub.unsubscribe();
    this.boundsSub = new Subscription();
    this.min = this.resolveBound(this.field.min);
    this.max = this.resolveBound(this.field.max);
    this.watchBound(this.field.min, (value) => (this.min = value));
    this.watchBound(this.field.max, (value) => (this.max = value));
  }
  ngOnDestroy(): void {
    this.boundsSub.unsubscribe();
  }
  private resolveBound(
    bound: number | string | undefined,
  ): number | string | undefined {
    if (typeof bound !== "string") return bound;
    return this.formGroup.getControl(bound)?.value as
      | number
      | string
      | undefined;
  }
  private watchBound(
    bound: number | string | undefined,
    update: (value: number | string | undefined) => void,
  ): void {
    if (typeof bound !== "string") return;
    const control = this.formGroup.getControl(bound);
    if (control)
      this.boundsSub.add(
        control.valueChanges.subscribe((value) => {
          update(value as number | string | undefined);
          this.cdr.markForCheck();
        }),
      );
  }
}
