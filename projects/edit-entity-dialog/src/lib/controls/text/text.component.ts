import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  Optional,
} from "@angular/core";
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { Subscription } from "rxjs";
import {
  EDIT_ENTITY_DIALOG_HOST,
  EditEntityDialogHost,
} from "../../edit-entity-dialog-host";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";

export type FormControlTextType = "text" | "email" | "tel" | "password";

@Component({
  selector: "app-form-control-text",
  standalone: true,
  styleUrls: ["../../internal/clear-button.scss"],
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (control) {
      <mat-form-field [appearance]="appearance">
        <mat-label>{{ label }}</mat-label>
        @if (prefixIcon) {
          <mat-icon matIconPrefix>{{ prefixIcon }}</mat-icon>
        }
        @if (hasCopyBtn && !isPassword) {
          <button
            mat-icon-button
            matIconPrefix
            type="button"
            [disabled]="!control.value"
            [attr.aria-label]="intl.messages.copy"
            (click)="copy($event)"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
        }
        <input
          matInput
          [type]="inputType"
          [required]="isRequired"
          [formControl]="control"
          [placeholder]="placeholder"
          [pattern]="pattern ?? ''"
          [maxlength]="max ?? null"
          [autocomplete]="autocomplete"
          [attr.data-1p-ignore]="type !== 'password'"
        />
        @if (hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
        @if (
          control.value && !control.disabled && isPassword && !passwordVisible
        ) {
          <button
            mat-icon-button
            matSuffix
            type="button"
            tabindex="-1"
            [attr.aria-label]="intl.messages.showPassword"
            (click)="passwordVisible = true; $event.stopPropagation()"
          >
            <mat-icon>visibility</mat-icon>
          </button>
        }
        @if (
          control.value && !control.disabled && isPassword && passwordVisible
        ) {
          <button
            mat-icon-button
            matSuffix
            type="button"
            tabindex="-1"
            [attr.aria-label]="intl.messages.hidePassword"
            (click)="passwordVisible = false; $event.stopPropagation()"
          >
            <mat-icon>visibility_off</mat-icon>
          </button>
        }
        @if (control.value && !control.disabled) {
          <button
            mat-icon-button
            matSuffix
            class="form-field-clear-btn"
            type="button"
            tabindex="-1"
            [attr.aria-label]="intl.messages.clear"
            (click)="clearValue(); $event.stopPropagation()"
          >
            <mat-icon>clear</mat-icon>
          </button>
        }
        @if (suffix) {
          <span matTextSuffix>{{ suffix }}</span>
        }
        @if (control.hasError("required")) {
          <mat-error>{{ intl.messages.required }}</mat-error>
        }
        @if (control.hasError("email")) {
          <mat-error>{{ intl.messages.emailInvalid }}</mat-error>
        }
        @if (control.hasError("pattern")) {
          <mat-error>{{ intl.messages.invalidPattern }}</mat-error>
        }
        @if (control.hasError("unique")) {
          <mat-error>{{ intl.messages.unique }}</mat-error>
        }
        @if (control.hasError("maxlength")) {
          <mat-error>{{
            intl.messages.maximumLength
              .replace(
                "{requiredLength}",
                "" + control.getError("maxlength").requiredLength
              )
              .replace(
                "{actualLength}",
                "" + control.getError("maxlength").actualLength
              )
          }}</mat-error>
        }
      </mat-form-field>
    }
  `,
})
export class FormControlTextComponent implements OnDestroy {
  @Input() label = "";
  @Input() hint?: string;
  @Input() prefixIcon?: string;
  @Input() hasCopyBtn = false;
  @Input() suffix?: string;
  @Input() placeholder = "";
  @Input() autocomplete = "off";
  @Input() appearance: "fill" | "outline" = "outline";

  private readonly ownedEmailValidator: ValidatorFn = (control) =>
    Validators.email(control);
  private emailValidator?: ValidatorFn;
  private lengthValidator?: ValidatorFn;
  private patternValidator?: ValidatorFn;
  private _control?: FormControl<string | null>;
  @Input({ required: true }) set control(control: FormControl<string | null>) {
    if (this._control !== control) {
      this.removeOwnValidators(this._control);
      this._control = control;
      this.applyValidators();
    }
  }
  get control(): FormControl<string | null> {
    return this._control!;
  }

  private _type: FormControlTextType = "text";
  @Input() set type(type: FormControlTextType) {
    this._type = type;
    this.replaceValidator(
      "emailValidator",
      type === "email" ? this.ownedEmailValidator : undefined,
    );
  }
  get type(): FormControlTextType {
    return this._type;
  }
  get isPassword(): boolean {
    return this.type === "password";
  }
  passwordVisible = false;
  get inputType(): FormControlTextType {
    return this.isPassword && this.passwordVisible ? "text" : this.type;
  }

  private _pattern: string | RegExp = "";
  @Input() set pattern(pattern: string | RegExp | undefined) {
    this._pattern = pattern ?? "";
    this.replaceValidator(
      "patternValidator",
      this._pattern ? Validators.pattern(this._pattern) : undefined,
    );
  }
  get pattern(): string | RegExp {
    return this._pattern;
  }

  private _max?: number;
  @Input() set max(max: number | undefined) {
    this._max = max;
    this.replaceValidator(
      "lengthValidator",
      max == null ? undefined : Validators.maxLength(max),
    );
  }
  get max(): number | undefined {
    return this._max;
  }
  get isRequired(): boolean {
    return this.control?.hasValidator(Validators.required) ?? false;
  }

  private readonly intlSubscription: Subscription;
  constructor(
    readonly intl: EditEntityDialogIntl,
    private readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(EDIT_ENTITY_DIALOG_HOST)
    private readonly host?: EditEntityDialogHost,
  ) {
    this.intlSubscription = this.intl.changes.subscribe(() =>
      this.cdr.markForCheck(),
    );
  }

  clearValue(): void {
    this.control?.markAsTouched();
    this.control?.markAsDirty();
    this.control?.setValue(null);
  }

  async copy(event: Event): Promise<void> {
    event.stopPropagation();
    const value = this.control?.value;
    if (!value || this.isPassword || !this.hasCopyBtn) return;
    await navigator.clipboard?.writeText(value);
    this.host?.notify(this.intl.messages.copied);
  }

  ngOnDestroy(): void {
    this.intlSubscription.unsubscribe();
    this.removeOwnValidators(this.control);
  }

  private applyValidators(): void {
    if (this.type === "email") this.emailValidator = this.ownedEmailValidator;
    if (this.max != null) this.lengthValidator = Validators.maxLength(this.max);
    if (this.pattern) this.patternValidator = Validators.pattern(this.pattern);
    this.addOwnValidators(this.control);
  }

  private replaceValidator(
    key: "emailValidator" | "lengthValidator" | "patternValidator",
    next?: ValidatorFn,
  ): void {
    const previous = this[key];
    if (previous) this.control?.removeValidators(previous);
    this[key] = next;
    if (next) this.control?.addValidators(next);
    this.control?.updateValueAndValidity();
  }

  private addOwnValidators(control?: AbstractControl | null): void {
    if (!control) return;
    for (const validator of [
      this.emailValidator,
      this.lengthValidator,
      this.patternValidator,
    ])
      if (validator) control.addValidators(validator);
    control.updateValueAndValidity();
  }

  private removeOwnValidators(control?: AbstractControl | null): void {
    if (!control) return;
    for (const validator of [
      this.emailValidator,
      this.lengthValidator,
      this.patternValidator,
    ])
      if (validator) control.removeValidators(validator);
    control.updateValueAndValidity();
  }
}
