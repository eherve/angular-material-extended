import {
  ChangeDetectorRef,
  Directive,
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
import { FormControl, Validators, ValueChangeEvent } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Subscription } from "rxjs";
import { AutocompleteFormFieldService } from "../../fields/edit-entity-field.types";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";
import {
  SearchFunction,
  SearchState,
  sameSearchValue,
} from "../../internal/search/search-state";
import { readPath } from "../../internal/value.helpers";
export type SearchControlService = Omit<
  AutocompleteFormFieldService<unknown, unknown>,
  "search"
> & { search: SearchFunction<unknown> };
@Directive()
export abstract class SearchControlBase implements OnChanges, OnDestroy {
  @Input({ required: true }) control!: FormControl<unknown>;
  @Input({ required: true }) service!: SearchControlService;
  @Input() label = "";
  @Input() hint?: string;
  @Input() tooltip?: string;
  @Input() placeholder = "";
  @Input() multiple = false;
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
    ReturnType<SearchControlService["display"]> | undefined
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
  readonly invalid = signal(false);
  readonly invalidEntity = signal(false);
  readonly otherError = signal(false);
  state!: SearchState<unknown>;
  private subscriptions = new Subscription();
  private timer?: ReturnType<typeof setTimeout>;
  private draftText?: string;
  private writingDraft = false;
  private cdr = inject(ChangeDetectorRef);
  ngOnChanges(changes: SimpleChanges): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.state?.destroy();
    clearTimeout(this.timer);
    if (!this.control || !this.service) return;
    this.state = new SearchState<unknown>(
      (...args) => this.service.search(...args),
      () => this.control.value ?? undefined,
      this.limit,
    );
    if (changes["control"]) this.draftText = undefined;
    this.sync();
    this.subscriptions.add(
      this.control.events.subscribe((event) => {
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
          if (!this.control.disabled) void this.state.search(value ?? "");
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
  }
  focus(): void {
    if (!this.control.disabled)
      void this.state.search(
        typeof this.inputControl.value === "string"
          ? this.inputControl.value
          : "",
      );
  }
  /** Options and selected values always use the configured label, including strings. */
  display = (value: unknown): string =>
    value == null ? "" : this.service.display(value).name;
  /** Only native input text is a draft; a string option is still a real value. */
  displayInput = (value: unknown): string =>
    this.draftText !== undefined && value === this.draftText
      ? this.draftText
      : this.display(value);
  inputChanged(event: Event): void {
    if (
      this.multiple ||
      this.control.disabled ||
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
          ? group(option)
          : group
            ? readPath(option, group)
            : "";
      const name = value == null ? "" : String(value);
      result.set(name, [...(result.get(name) ?? []), option]);
    }
    return [...result].map(([name, options]) => ({ name, options }));
  }
  select(value: unknown): void {
    if (this.control.disabled) return;
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
    if (
      this.control.disabled ||
      index < 0 ||
      index >= this.selectedValues().length
    )
      return;
    this.apply(this.selectedValues().filter((_value, i) => i !== index));
  }
  clear(): void {
    if (!this.control.disabled) {
      this.apply(this.multiple ? [] : null);
      this.inputControl.setValue(null, { emitEvent: false });
    }
  }
  drop(
    event: Pick<CdkDragDrop<unknown[]>, "previousIndex" | "currentIndex">,
  ): void {
    if (this.control.disabled || event.previousIndex === event.currentIndex)
      return;
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
    this.control.markAsTouched();
  }
  private apply(value: unknown): void {
    this.control.setValue(value);
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.sync();
  }
  private sync(): void {
    this.singleSelectionDisplay.set(
      !this.multiple &&
        !this.sortable &&
        this.draftText === undefined &&
        this.control.value != null
        ? this.service.display(this.control.value)
        : undefined,
    );
    this.disabled.set(this.control.disabled);
    this.required.set(this.control.hasValidator(Validators.required));
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
    if (this.control.disabled) this.inputControl.disable({ emitEvent: false });
    else this.inputControl.enable({ emitEvent: false });
    if (!this.multiple)
      this.inputControl.setValue(this.control.value, { emitEvent: false });
    this.cdr.markForCheck();
  }
}
