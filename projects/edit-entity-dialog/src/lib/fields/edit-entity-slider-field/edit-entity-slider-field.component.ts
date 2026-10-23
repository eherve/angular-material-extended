import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSliderModule, MatSliderThumb } from "@angular/material/slider";
import { Subscription } from "rxjs";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { SliderFormField } from "../edit-entity-field.types";

@Component({
  selector: "app-edit-entity-slider-field",
  standalone: true,
  styleUrls: ["../../internal/clear-button.scss"],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSliderModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      #container {
        width: 100%;
        min-width: unset;
        position: relative;
      }
      .form-field-clear-btn {
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
      }
      mat-slider {
        width: calc(100% - 56px);
        margin: 0 var(--ngx-mat-extended-space-2, 8px);
      }
      #container.bare {
        padding: var(--ngx-mat-extended-space-2, 8px) 0;
      }
      #container.outline {
        margin-top: var(--ngx-mat-extended-space-1, 4px);
        margin-bottom: var(--ngx-mat-extended-space-4, 24px);
        padding: var(--ngx-mat-extended-space-2, 8px) 0;
        border: 1px solid
          var(--mat-form-field-outlined-outline-color, var(--mat-sys-outline));
        border-radius: var(
          --mat-form-field-outlined-container-shape,
          var(--mat-sys-corner-extra-small)
        );
      }
      #container.outline:before {
        content: attr(label);
        position: absolute;
        z-index: 2;
        top: -6px;
        left: 10px;
        padding: 0 var(--ngx-mat-extended-space-1, 4px);
        font-size: 12px;
        line-height: 12px;
        color: var(--mat-form-field-outlined-label-text-color);
        background: var(--mat-sys-surface, white);
      }
      #container.fill > mat-label {
        display: block;
        padding: 0 var(--ngx-mat-extended-space-2, 8px);
      }
      #value {
        position: absolute;
        transform: translateX(-50%);
        top: -8px;
      }
      #value.position-bottom {
        top: unset;
        bottom: -8px;
      }
    `,
  ],
  template: `
    <div
      id="container"
      #container
      [formGroup]="formGroup"
      [attr.label]="field.label"
      [class]="field.bare ? 'bare' : (field.appearance ?? 'outline')"
      [class.disabled]="control.disabled"
    >
      @if (!field.bare && field.appearance === "fill") {
        <mat-label>{{ field.label }}</mat-label>
      }
      <mat-slider
        [max]="field.max ?? 100"
        [min]="field.min ?? 0"
        [step]="field.step ?? 1"
        [showTickMarks]="!!field.showTicks"
        [discrete]="!!field.discrete"
        [displayWith]="sliderDisplayWith"
      >
        <input
          matSliderThumb
          [formControl]="control"
          [attr.aria-label]="field.bare ? field.label : null"
          #slider
        />
        @if (thumb && !field.discrete) {
          <mat-label
            id="value"
            [class]="'position-' + valuePosition"
            #label
            [style.left]="
              'max(' +
              thumb.percentage * 100 +
              '%, ' +
              label.clientWidth / 2 +
              'px)'
            "
            >{{ valueLabel }}</mat-label
          >
        }
      </mat-slider>
      @if (
        control.enabled && control.value !== null && control.value !== undefined
      ) {
        <button
          mat-icon-button
          class="form-field-clear-btn"
          type="button"
          [attr.aria-label]="intl.messages.clear"
          (click)="clearValue(); $event.stopPropagation()"
        >
          <mat-icon>close</mat-icon>
        </button>
      }
    </div>
  `,
})
export class EditEntitySliderFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnChanges, OnDestroy
{
  readonly intl = inject(EditEntityDialogIntl);
  clearValue(): void {
    if (this.control.disabled) return;
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.control.setValue(null);
  }
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: SliderFormField<TRecord>;
  @ViewChild(MatSliderThumb) thumb?: MatSliderThumb;
  valueLabel = "";
  valuePosition: "top" | "bottom" = "top";
  private valueSubscription?: Subscription;
  constructor(private readonly cdr: ChangeDetectorRef) {
    this.intl.changes
      .pipe(takeUntilDestroyed())
      .subscribe(() => cdr.markForCheck());
  }
  get control() {
    return this.formGroup.requireFormControl(this.field.name);
  }
  sliderDisplayWith = (value: number | null): string => {
    if (value == null) return "";
    const formatted = this.field.thumbFormatter
      ? this.field.thumbFormatter(value).toString()
      : value.toString();
    return formatted + (this.field.thumbSuffix ?? "");
  };
  ngOnChanges(): void {
    this.valueSubscription?.unsubscribe();
    this.valuePosition = this.field.valuePosition ?? "top";
    this.refreshValue(this.control.value);
    this.valueSubscription = this.control.valueChanges.subscribe((value) =>
      this.refreshValue(value),
    );
  }
  ngOnDestroy(): void {
    this.valueSubscription?.unsubscribe();
  }
  private refreshValue(value: unknown): void {
    this.valueLabel = this.sliderDisplayWith(
      value == null ? null : Number(value),
    );
    this.cdr.markForCheck();
  }
}
