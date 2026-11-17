import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import {
  MatChipGrid,
  MatChipsModule,
  MatChipInputEvent,
} from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { IFormControlSelectOption } from "@eherve/angular-material-forms/core";
import { Observable, isObservable } from "rxjs";
import { ValueControl } from "../shared/value-control";

type TagOption = IFormControlSelectOption<string>;
const search = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
@Component({
  selector: "ame-tags-input",
  standalone: true,
  imports: [
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: "./tags.component.html",
  styleUrl: "./tags.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlTagsComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormControlTagsComponent),
      multi: true,
    },
  ],
})
export class FormControlTagsComponent extends ValueControl<string[]> {
  private readonly materialGrid = viewChild(MatChipGrid);
  // The grid presents the outer value accessor; it has no separate NgControl.
  private readonly refreshErrorState = effect(() => {
    // Track the outer error state even before Material receives its matcher input.
    this.errorMatcher.isErrorState(null, null);
    this.materialGrid()?.updateErrorState();
  });
  override readonly label = input("Tags");
  readonly options = input<TagOption[] | Observable<TagOption[]> | null>(null);
  readonly currentTag = signal("");
  readonly separatorKeys = [ENTER, COMMA];
  readonly commaKey = [COMMA];
  private readonly availableOptions = signal<TagOption[]>([]);
  readonly filteredOptions = computed(() => {
    const selected = new Set(this.value().map(search));
    const query = search(this.currentTag());
    return this.availableOptions().filter(
      (option) =>
        !selected.has(search(option.value)) &&
        (!query || search(option.value).includes(query)),
    );
  });
  constructor() {
    super();
    effect((onCleanup) => {
      const source = this.options();
      this.availableOptions.set([]);
      if (isObservable(source)) {
        const sub = source.subscribe((options) =>
          this.availableOptions.set(options ?? []),
        );
        onCleanup(() => sub.unsubscribe());
      } else this.availableOptions.set(source ?? []);
    });
  }
  protected override emptyValue(): string[] {
    return [];
  }
  protected override copyValue(value: string[]): string[] {
    return [...value];
  }
  addTag(raw: string): void {
    const tag = raw.trim();
    if (!tag || this.value().some((value) => search(value) === search(tag)))
      return;
    this.commit([...this.value(), tag]);
  }
  add(event: MatChipInputEvent): void {
    this.addTag(event.value ?? "");
    this.currentTag.set("");
    event.chipInput.clear();
  }
  selected(event: MatAutocompleteSelectedEvent, input: HTMLInputElement): void {
    this.addTag(String(event.option.value ?? ""));
    this.currentTag.set("");
    input.value = "";
    event.option.deselect();
  }
  remove(index: number): void {
    this.commit(this.value().filter((_, current) => current !== index));
  }
}
