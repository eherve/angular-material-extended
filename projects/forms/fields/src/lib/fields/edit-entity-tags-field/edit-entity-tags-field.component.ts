import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import {
  EditEntityFormGroup,
  EditEntityRecord,
  TagsFormField,
  IFormControlSelectOption,
} from "@eherve/angular-material-forms/core";
import { FormControlTagsComponent } from "../../controls/tags/tags.component";
import { Subscription } from "rxjs";
@Component({
  selector: "ame-edit-entity-tags-field",
  standalone: true,
  imports: [FormControlTagsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ame-tags-input
    [control]="control"
    [label]="field.label"
    [appearance]="field.appearance ?? 'outline'"
    [options]="options"
  />`,
})
export class EditEntityTagsFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: TagsFormField<TRecord>;
  get control(): FormControl<string[]> {
    return this.formGroup.requireFormControl(this.field.name) as FormControl<
      string[]
    >;
  }
  options: IFormControlSelectOption<string>[] = [];
  private subscription?: Subscription;
  constructor(private readonly cdr: ChangeDetectorRef) {}
  ngOnChanges(): void {
    this.subscription?.unsubscribe();
    this.options = [];
    const source = this.field.options;
    const setOptions = (options: IFormControlSelectOption<string>[]): void => {
      this.options = options ?? [];
      this.cdr.markForCheck();
    };
    if (typeof source === "function") {
      const refresh = (): void =>
        setOptions(source(this.record, this.formGroup as FormGroup));
      refresh();
      this.subscription = this.formGroup.valueChanges.subscribe(refresh);
    } else if (Array.isArray(source)) setOptions(source);
    else if (source) this.subscription = source.subscribe(setOptions);
  }
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
