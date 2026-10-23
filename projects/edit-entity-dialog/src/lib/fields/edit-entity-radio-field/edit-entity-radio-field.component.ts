import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatRadioModule } from "@angular/material/radio";
import { Observable, Subscription } from "rxjs";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import {
  IFormControlSelectOption,
  RadioFormField,
} from "../edit-entity-field.types";
@Component({
  selector: "app-edit-entity-radio-field",
  standalone: true,
  imports: [MatRadioModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .form-field {
        width: calc(100% - 8px);
      }
      .radio-label {
        position: absolute;
        top: -7px;
        left: 10px;
        padding: 0 var(--ngx-mat-extended-space-1, 4px);
        background: var(--mat-sys-surface, white);
        font-size: 12px;
        line-height: 12px;
      }
      .mat-mdc-radio-group {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--ngx-mat-extended-space-3, 16px);
        min-height: 56px;
        margin-top: var(--ngx-mat-extended-space-1, 4px);
        padding: var(--ngx-mat-extended-space-1, 4px) var(--ngx-mat-extended-space-2, 8px);
        border: 1px solid var(--ngx-mat-extended-border, #ccc);
        border-radius: var(--ngx-mat-extended-radius, 8px);
      }
      .mat-mdc-radio-group.column {
        flex-direction: column;
        align-items: flex-start;
      }
    `,
  ],
  template: `<div class="form-field">
    <mat-radio-group
      [formControl]="control"
      [attr.aria-label]="field.label"
      [class.column]="field.direction === 'column'"
      ><span class="radio-label">{{ field.label }}</span>
      @for (option of options; track option.value) {
        <mat-radio-button [value]="option.value" [disabled]="!!option.disabled"
          ><span [style.color]="option.color ?? null">{{
            option.name
          }}</span></mat-radio-button
        >
      }
    </mat-radio-group>
    @if (field.hint) {
      <div [innerHTML]="field.hint"></div>
    }
  </div>`,
})
export class EditEntityRadioFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: RadioFormField<TRecord>;
  options: IFormControlSelectOption[] = [];
  private sub?: Subscription;
  constructor(private readonly cdr: ChangeDetectorRef) {}
  get control() {
    return this.formGroup.requireFormControl(this.field.name);
  }
  ngOnChanges(): void {
    this.sub?.unsubscribe();
    const source = this.field.options;
    if (Array.isArray(source)) this.setOptions(source);
    else if (typeof source === "function") {
      const refresh = () =>
        this.setOptions(source(this.record, this.formGroup as FormGroup));
      refresh();
      this.sub = this.formGroup.valueChanges.subscribe(refresh);
    } else
      this.sub = (source as Observable<IFormControlSelectOption[]>).subscribe(
        (values) => this.setOptions(values),
      );
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  private setOptions(values: IFormControlSelectOption[]): void {
    this.options = values ?? [];
    this.cdr.markForCheck();
  }
}
