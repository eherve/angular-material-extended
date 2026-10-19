import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
} from "@angular/core";
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { TextFieldModule } from "@angular/cdk/text-field";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import { Subscription } from "rxjs";

@Component({
  selector: "app-form-control-textarea",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TextFieldModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (control) {
    <mat-form-field [appearance]="appearance" [style.height]="height"
      ><mat-label>{{ label }}</mat-label
      ><textarea
        matInput
        [required]="isRequired"
        cdkTextareaAutosize
        [cdkAutosizeMinRows]="minRows"
        [cdkAutosizeMaxRows]="maxRows"
        [formControl]="control"
        [placeholder]="placeholder"
        (blur)="control.markAsTouched()"
      ></textarea>
      @if (hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @if (control.hasError("required")) {
        <mat-error>{{ intl.messages.required }}</mat-error>
      }
    </mat-form-field>
  }`,
})
export class FormControlTextareaComponent implements OnDestroy {
  @Input() label = "";
  @Input() hint?: string;
  @Input() placeholder = "";
  @Input() height?: string;
  @Input() minRows = 1;
  @Input() maxRows = -1;
  @Input() appearance: "fill" | "outline" = "outline";
  private _control?: FormControl<string | null>;
  @Input({ required: true }) set control(control: FormControl<string | null>) {
    if (this._control === control) return;
    this.removeValidator(this._control);
    this._control = control;
    this.addValidator(control);
  }
  get control(): FormControl<string | null> {
    return this._control!;
  }
  private readonly ownedRequiredValidator: ValidatorFn = (control) =>
    Validators.required(control);
  private requiredValidator?: ValidatorFn;
  private _required = false;
  @Input() set required(value: boolean) {
    this._required = value;
    if (this.requiredValidator)
      this.control?.removeValidators(this.requiredValidator);
    this.requiredValidator = value ? this.ownedRequiredValidator : undefined;
    this.addValidator(this.control);
  }
  get isRequired(): boolean {
    return (
      this.control?.hasValidator(Validators.required) ||
      (this.requiredValidator != null &&
        this.control?.hasValidator(this.requiredValidator)) ||
      false
    );
  }
  private readonly intlSubscription: Subscription;
  constructor(
    readonly intl: EditEntityDialogIntl,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.intlSubscription = intl.changes.subscribe(() => cdr.markForCheck());
  }
  ngOnDestroy(): void {
    this.intlSubscription.unsubscribe();
    this.removeValidator(this.control);
  }
  private addValidator(control?: AbstractControl | null): void {
    if (!control) return;
    if (this._required) this.requiredValidator ??= this.ownedRequiredValidator;
    if (this.requiredValidator) control.addValidators(this.requiredValidator);
    control.updateValueAndValidity();
  }
  private removeValidator(control?: AbstractControl | null): void {
    if (!control || !this.requiredValidator) return;
    control.removeValidators(this.requiredValidator);
    control.updateValueAndValidity();
  }
}
