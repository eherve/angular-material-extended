import {
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
  imports: [MatFormFieldModule, MatSliderModule, ReactiveFormsModule],
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
      mat-slider {
        width: calc(100% - 20px);
        margin: 0 10px;
      }
      #container.bare {
        padding: 8px 0;
      }
      #container.outline {
        margin-top: 5px;
        margin-bottom: 22px;
        padding: 8px 0;
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
        padding: 0 4px;
        font-size: 12px;
        line-height: 12px;
        color: var(--mat-form-field-outlined-label-text-color);
        background: var(--mat-sys-surface, white);
      }
      #container.fill > mat-label {
        display: block;
        padding: 0 16px;
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
    </div>
  `,
})
export class EditEntitySliderFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: SliderFormField<TRecord>;
  @ViewChild(MatSliderThumb) thumb?: MatSliderThumb;
  valueLabel = "";
  valuePosition: "top" | "bottom" = "top";
  private valueSubscription?: Subscription;
  constructor(private readonly cdr: ChangeDetectorRef) {}
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
