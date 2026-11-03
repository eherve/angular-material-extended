import { A11yModule } from "@angular/cdk/a11y";
import { OverlayModule } from "@angular/cdk/overlay";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";

export interface ButtonSelectItem<TValue = unknown> {
  value: TValue;
  label: string;
}

@Component({
  selector: "ame-button-select",
  standalone: true,
  imports: [A11yModule, OverlayModule, MatButtonModule],
  templateUrl: "./button-select.component.html",
  styleUrl: "./button-select.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonSelectComponent),
      multi: true,
    },
  ],
})
export class ButtonSelectComponent<TValue = unknown>
  implements ControlValueAccessor
{
  readonly items = input<readonly ButtonSelectItem<TValue>[]>([]);
  readonly color = input<string>();
  readonly ariaLabel = input("Select an option");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = signal<TValue | null>(null);
  readonly isOpen = signal(false);
  private readonly formsDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  readonly selectedItem = computed(() =>
    this.items().find((item) => Object.is(item.value, this.value())),
  );
  readonly availableItems = computed(() =>
    this.items().filter((item) => !Object.is(item.value, this.value())),
  );
  private onChange: (value: TValue | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private readonly closeDisabledOverlay = effect(() => {
    if (this.isDisabled()) this.isOpen.set(false);
  });

  writeValue(value: TValue | null | undefined): void {
    this.value.set(value ?? null);
  }
  registerOnChange(fn: (value: TValue | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formsDisabled.set(disabled);
  }
  touch(): void {
    this.onTouched();
  }
  toggle(): void {
    if (this.isDisabled() || !this.availableItems().length) return;
    this.isOpen.update((open) => !open);
    if (!this.isOpen()) this.touch();
  }
  close(): void {
    this.isOpen.set(false);
    this.touch();
  }
  select(value: TValue): void {
    if (this.isDisabled()) return;
    this.value.set(value);
    this.onChange(value);
    this.close();
  }
  handleOverlayKeydown(event: KeyboardEvent): void {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }
}
