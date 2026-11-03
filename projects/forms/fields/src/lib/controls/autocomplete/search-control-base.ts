import {
  ChangeDetectorRef,
  booleanAttribute,
  Injector,
  OnInit,
  Directive,
  effect,
  afterRenderEffect,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
  viewChild,
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
  ValueChangeEvent,
} from "@angular/forms";
import { MatFormFieldAppearance } from "@angular/material/form-field";
import { MatChipGrid } from "@angular/material/chips";
import { ErrorStateMatcher } from "@angular/material/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Subscription } from "rxjs";
import { EditEntityDialogIntl } from "@eherve/angular-material-forms/core";
import {
  SearchFunction,
  SearchState,
  sameSearchValue,
} from "@eherve/angular-material-forms/core";
import { readPath } from "@eherve/angular-material-forms/core";
export type FormControlAutocompleteFieldValueType<TValue> =
  | TValue
  | null
  | undefined;
export interface FormControlAutocompleteService<TValue = unknown> {
  display(value: TValue): {
    name: string;
    prefix?: string;
    color?: string;
    prefixColor?: string;
  };
  search: SearchFunction<TValue>;
  group?: string | ((value: TValue) => string);
  open?(value: TValue): void;
}
@Directive()
export abstract class SearchControlBase<TValue = unknown>
  implements OnChanges, OnInit, OnDestroy, ControlValueAccessor, Validator
{
  @Input() set control(value: FormControl<unknown> | null | undefined) {
    this.providedControl = value ?? undefined;
  }
  get control(): FormControl<unknown> {
    return (
      this.providedControl ??
      (this.ngControl?.control as FormControl<unknown>) ??
      this.fallbackControl
    );
  }
  @Input({ required: true }) service!: FormControlAutocompleteService<TValue>;
  @Input() appearance: MatFormFieldAppearance = "outline";
  @Input({ alias: "no-subscript", transform: booleanAttribute }) noSubscript =
    false;
  @Input({ alias: "required", transform: booleanAttribute }) requiredInput =
    false;
  @Input({ alias: "disabled", transform: booleanAttribute }) disabledInput =
    false;
  @Input("value") externalValue: FormControlAutocompleteFieldValueType<
    TValue | TValue[]
  >;
  @Input() panelWidth: string | number = "375px";
  @Input() panelMinHeight = 0;
  @Input() selectionLayout: "chips" | "rows" = "chips";
  @Input() label: string | undefined = "";
  @Input() hint?: string;
  @Input() tooltip?: string;
  @Input() placeholder: string | undefined = "";
  @Input({ transform: booleanAttribute }) multiple = false;
  @Input() limit = 10;
  readonly sortable: boolean = false;
  readonly engineErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: () =>
      this.control.invalid && (this.control.dirty || this.control.touched),
  };
  readonly intl = inject(EditEntityDialogIntl);
  readonly inputControl = new FormControl<string | unknown>(null);
  readonly selectedValues = signal<unknown[]>([]);
  readonly singleSelectionDisplay = signal<
    ReturnType<FormControlAutocompleteService<TValue>["display"]> | undefined
  >(undefined);
  readonly disabled = signal(false);
  readonly required = signal(false);
  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>("searchInput");
  // MatInput owns this attribute; apply the engine state after its host bindings render.
  private readonly requiredState = afterRenderEffect({
    write: () => {
      const required = this.required();
      this.searchInput()?.nativeElement.setAttribute(
        "aria-required",
        String(required),
      );
    },
  });
  private readonly controlRevision = signal(0);
  private readonly chipGrid = viewChild(MatChipGrid);
  private readonly refreshChipErrors = effect(() => {
    this.controlRevision();
    this.chipGrid()?.updateErrorState();
  });
  readonly invalid = signal(false);
  readonly invalidEntity = signal(false);
  readonly otherError = signal(false);
  state!: SearchState<unknown>;
  private subscriptions = new Subscription();
  private timer?: ReturnType<typeof setTimeout>;
  private draftText?: string;
  private writingDraft = false;
  private cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private ngControl: NgControl | null = null;
  private providedControl?: FormControl<unknown>;
  private readonly fallbackControl = new FormControl<unknown>(null);
  private boundControl?: FormControl<unknown>;
  private validatorControl?: FormControl<unknown>;
  private formsDisabled = false;
  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;
  private readonly requiredValidator: ValidatorFn = (control) =>
    this.requiredInput ? Validators.required(control) : null;
  ngOnChanges(changes: SimpleChanges): void {
    this.connect(!!changes["service"] || !!changes["limit"]);
    if (changes["externalValue"]) {
      this.draftText = undefined;
      this.control.setValue(this.externalValue, { emitEvent: false });
    }
    if (changes["disabledInput"]) {
      if (this.disabledInput) this.control.disable({ emitEvent: false });
      else if (changes["disabledInput"].previousValue === true)
        this.control.enable({ emitEvent: false });
    }
    if (changes["requiredInput"]) {
      this.onValidatorChange();
      this.control.updateValueAndValidity({ emitEvent: false });
    }
    this.sync();
  }
  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, { self: true });
    this.connect();
  }
  writeValue(value: unknown): void {
    this.connect();
    this.draftText = undefined;
    if (this.control.value !== value)
      this.control.setValue(value, { emitEvent: false });
    this.sync();
  }
  registerOnChange(fn: (value: unknown) => void): void {
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
    this.formsDisabled = disabled;
    this.sync();
  }
  focusInput(): void {
    this.searchInput()?.nativeElement.focus();
  }
  presentation(
    value: unknown,
  ): ReturnType<FormControlAutocompleteService<TValue>["display"]> {
    return this.service.display(value as TValue);
  }
  open(value: unknown): void {
    this.service.open?.(value as TValue);
  }
  private connect(rebuild = false): void {
    const control = this.control;
    if (!this.service || (!rebuild && this.boundControl === control)) return;
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.state?.destroy();
    clearTimeout(this.timer);
    if (this.validatorControl) {
      this.validatorControl.removeValidators(this.requiredValidator);
      this.validatorControl.updateValueAndValidity({ emitEvent: false });
    }
    if (this.boundControl !== control) this.draftText = undefined;
    this.boundControl = control;
    if (this.disabledInput) control.disable({ emitEvent: false });
    this.validatorControl =
      this.providedControl || !this.ngControl ? control : undefined;
    if (this.validatorControl) {
      control.addValidators(this.requiredValidator);
      control.updateValueAndValidity({ emitEvent: false });
    }
    this.state = new SearchState<unknown>(
      (limit, skip, search, selected) =>
        this.service.search(
          limit,
          skip,
          search,
          selected as TValue | TValue[] | undefined,
        ),
      () => this.control.value ?? undefined,
      this.limit,
    );
    this.sync();
    this.subscriptions.add(
      control.events.subscribe((event) => {
        if (this.control !== control) return;
        if (event instanceof ValueChangeEvent && !this.writingDraft)
          this.draftText = undefined;
        this.sync();
      }),
    );
    this.subscriptions.add(
      this.inputControl.valueChanges.subscribe((value) => {
        if (typeof value !== "string" && value !== null) return;
        this.state.invalidate();
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          if (!this.disabled()) void this.state.search(value ?? "");
        }, 300);
      }),
    );
    this.subscriptions.add(
      this.intl.changes.subscribe(() => this.cdr.markForCheck()),
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    clearTimeout(this.timer);
    this.state?.destroy();
    if (this.validatorControl) {
      this.validatorControl.removeValidators(this.requiredValidator);
      this.validatorControl.updateValueAndValidity({ emitEvent: false });
    }
  }
  focus(): void {
    if (!this.disabled())
      void this.state.search(
        typeof this.inputControl.value === "string"
          ? this.inputControl.value
          : "",
      );
  }
  /** Options and selected values always use the configured label, including strings. */
  display = (value: unknown): string =>
    value == null ? "" : this.presentation(value).name;
  /** Only native input text is a draft; a string option is still a real value. */
  displayInput = (value: unknown): string =>
    this.draftText !== undefined && value === this.draftText
      ? this.draftText
      : this.display(value);
  inputChanged(event: Event): void {
    if (
      this.multiple ||
      this.disabled() ||
      !(event.target instanceof HTMLInputElement)
    )
      return;
    this.draftText = event.target.value;
    this.writingDraft = true;
    try {
      this.apply(this.draftText === "" ? null : this.draftText);
    } finally {
      this.writingDraft = false;
    }
  }
  groups(): { name: string; options: unknown[] }[] {
    const result = new Map<string, unknown[]>();
    for (const option of this.state.options()) {
      const group = this.service.group;
      const value =
        typeof group === "function"
          ? group(option as TValue)
          : group
            ? readPath(option, group)
            : "";
      const name = value == null ? "" : String(value);
      result.set(name, [...(result.get(name) ?? []), option]);
    }
    return [...result].map(([name, options]) => ({ name, options }));
  }
  select(value: unknown): void {
    if (this.disabled()) return;
    this.draftText = undefined;
    if (this.multiple) {
      if (!this.selectedValues().some((item) => sameSearchValue(item, value)))
        this.apply([...this.selectedValues(), value]);
      this.inputControl.setValue(null, { emitEvent: false });
    } else {
      this.apply(value);
      this.inputControl.setValue(value, { emitEvent: false });
    }
  }
  remove(index: number): void {
    if (this.disabled() || index < 0 || index >= this.selectedValues().length)
      return;
    this.apply(this.selectedValues().filter((_value, i) => i !== index));
  }
  get hasInputValue(): boolean {
    const value = this.inputControl.value;
    return value !== null && value !== undefined && value !== "";
  }
  clear(): void {
    if (this.disabled()) return;
    this.draftText = undefined;
    if (!this.multiple && !this.sortable) this.apply(null);
    this.inputControl.setValue(null);
  }
  drop(
    event: Pick<CdkDragDrop<unknown[]>, "previousIndex" | "currentIndex">,
  ): void {
    if (this.disabled() || event.previousIndex === event.currentIndex) return;
    const values = [...this.selectedValues()];
    if (
      event.previousIndex < 0 ||
      event.currentIndex < 0 ||
      event.previousIndex >= values.length ||
      event.currentIndex >= values.length
    )
      return;
    moveItemInArray(values, event.previousIndex, event.currentIndex);
    this.apply(values);
  }
  touched(): void {
    if (this.providedControl || !this.ngControl) this.control.markAsTouched();
    this.onTouched();
  }
  private apply(value: unknown): void {
    if (this.providedControl || !this.ngControl) {
      this.control.setValue(value);
      this.control.markAsDirty();
      this.control.markAsTouched();
    }
    this.onChange(value);
    this.onTouched();
    this.sync();
  }
  private sync(): void {
    if (!this.service) return;
    this.controlRevision.update((revision) => revision + 1);
    this.singleSelectionDisplay.set(
      !this.multiple &&
        !this.sortable &&
        this.draftText === undefined &&
        this.control.value != null
        ? this.presentation(this.control.value)
        : undefined,
    );
    this.disabled.set(
      this.control.disabled || this.disabledInput || this.formsDisabled,
    );
    this.required.set(
      this.requiredInput || this.control.hasValidator(Validators.required),
    );
    this.invalid.set(this.control.hasError("required"));
    this.invalidEntity.set(this.control.hasError("invalidEntity"));
    this.otherError.set(
      this.control.invalid && !this.invalid() && !this.invalidEntity(),
    );
    this.selectedValues.set(
      Array.isArray(this.control.value)
        ? [...this.control.value]
        : this.control.value == null
          ? []
          : [this.control.value],
    );
    if (this.disabled()) this.inputControl.disable({ emitEvent: false });
    else this.inputControl.enable({ emitEvent: false });
    if (!this.multiple)
      this.inputControl.setValue(this.control.value, { emitEvent: false });
    this.cdr.markForCheck();
  }
}
