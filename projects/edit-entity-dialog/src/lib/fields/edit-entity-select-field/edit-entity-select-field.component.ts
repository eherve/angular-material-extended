import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import {
  IFormControlSelectOption,
  SelectFormField,
} from "../edit-entity-field.types";
import { FormControlSelectComponent } from "../../controls/select/select.component";

@Component({
  selector: "app-edit-entity-select-field",
  standalone: true,
  imports: [FormControlSelectComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-form-control-select
    [control]="control"
    [label]="field.label"
    [hint]="field.hint"
    [prefixIcon]="field.prefixIcon"
    [suffix]="field.suffix"
    [options]="options"
    [multiple]="!!field.multiple"
    [group]="!!field.group"
    [open]="field.open"
  />`,
})
export class EditEntitySelectFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: SelectFormField<TRecord>;

  options: IFormControlSelectOption[] = [];
  private optionsSubscription?: Subscription;
  private valuesSubscription?: Subscription;
  get control() {
    return this.formGroup.requireFormControl(this.field.name);
  }

  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.optionsSubscription?.unsubscribe();
    this.valuesSubscription?.unsubscribe();
    const source = this.field?.options;
    if (Array.isArray(source)) this.setOptions(source);
    else if (typeof source === "function") {
      const refresh = () =>
        this.setOptions(source(this.record, this.formGroup as FormGroup));
      refresh();
      this.valuesSubscription = this.formGroup.valueChanges.subscribe(refresh);
    } else if (source) {
      this.optionsSubscription = source.subscribe((options) =>
        this.setOptions(options),
      );
    }
  }

  ngOnDestroy(): void {
    this.optionsSubscription?.unsubscribe();
    this.valuesSubscription?.unsubscribe();
  }

  private setOptions(options: IFormControlSelectOption[]): void {
    this.options = options ?? [];
    this.changeDetector.markForCheck();
  }
}
