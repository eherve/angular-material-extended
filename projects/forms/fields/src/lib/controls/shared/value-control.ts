import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  signal,
} from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NgControl,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { EditEntityDialogIntl } from "@eherve/angular-material-forms/core";

/** Shared binding lifecycle for the standalone color and tags value accessors. */
@Directive()
export abstract class ValueControl<T>
  implements ControlValueAccessor, Validator, OnInit
{
  readonly control = input<FormControl<T> | null>(null);
  readonly label = input("");
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly appearance = input<"fill" | "outline">("outline");
  readonly intl = inject(EditEntityDialogIntl);
  readonly value = signal<T>(this.emptyValue());
  private readonly boundDisabled = signal(false);
  private readonly cvaDisabled = signal(false);
  private readonly revision = signal(0);
  private ngControl: NgControl | null = null;
  private readonly cvaControl = signal<AbstractControl | null>(null);
  private readonly injector = inject(Injector);
  readonly isDisabled = computed(
    () => this.disabled() || this.boundDisabled() || this.cvaDisabled(),
  );
  readonly isRequired = computed(() => {
    this.revision();
    return (
      this.required() ||
      !!(this.control() ?? this.cvaControl())?.hasValidator(Validators.required)
    );
  });
  readonly hasRequiredError = computed(() => {
    this.revision();
    return !!(this.control() ?? this.cvaControl())?.hasError("required");
  });
  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: () => {
      this.revision();
      const control = this.control() ?? this.cvaControl();
      return !!control?.invalid && (control.touched || control.dirty);
    },
  };
  private onChange: (value: T) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;
  private readonly requiredValidator: ValidatorFn = (control) =>
    this.required() ? Validators.required(control) : null;

  constructor() {
    effect((onCleanup) => {
      const suppliedControl = this.control();
      const control = suppliedControl ?? this.cvaControl();
      this.boundDisabled.set(control?.disabled ?? false);
      if (!control) return;
      if (suppliedControl) {
        control.addValidators(this.requiredValidator);
        control.updateValueAndValidity({ emitEvent: false });
      }
      this.writeValue(control.value);
      this.boundDisabled.set(control.disabled);
      this.revision.update((value) => value + 1);
      const sub = control.events.subscribe(() => {
        // CVA writeValue can rebind before the subscription effect's next run.
        if (control !== (this.control() ?? this.ngControl?.control)) return;
        this.writeValue(control.value);
        this.boundDisabled.set(control.disabled);
        this.revision.update((value) => value + 1);
      });
      onCleanup(() => {
        sub.unsubscribe();
        if (suppliedControl) {
          control.removeValidators(this.requiredValidator);
          control.updateValueAndValidity({ emitEvent: false });
        }
      });
    });
    effect(() => {
      this.required();
      this.control()?.updateValueAndValidity({ emitEvent: false });
      this.onValidatorChange();
      this.revision.update((value) => value + 1);
    });
  }
  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, { self: true });
    this.cvaControl.set(this.ngControl?.control ?? null);
  }
  writeValue(value: T | null | undefined): void {
    // Angular invokes writeValue when the directive receives a replacement FormControl.
    this.cvaControl.set(this.ngControl?.control ?? null);
    this.value.set(this.copyValue(value ?? this.emptyValue()));
  }
  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
  validate(control: AbstractControl): ValidationErrors | null {
    return this.requiredValidator(control);
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }
  touch(): void {
    this.control()?.markAsTouched();
    this.onTouched();
  }
  protected commit(value: T): void {
    if (this.isDisabled()) return;
    const next = this.copyValue(value);
    this.value.set(next);
    this.control()?.markAsDirty();
    this.control()?.setValue(this.copyValue(next));
    this.onChange(this.copyValue(next));
    this.touch();
  }
  protected abstract emptyValue(): T;
  protected abstract copyValue(value: T): T;
}
