import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  effect,
  viewChild,
  input,
} from "@angular/core";
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInput, MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { ColorValue } from "@eherve/angular-material-forms/core";
import { ValueControl } from "../shared/value-control";
import { DEFAULT_COLORS } from "./color-palette";

@Component({
  selector: "ame-color-picker",
  standalone: true,
  host: { "[class.inline]": "inline()" },
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: "./color.component.html",
  styleUrl: "./color.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlColorComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormControlColorComponent),
      multi: true,
    },
  ],
})
export class FormControlColorComponent extends ValueControl<ColorValue | null> {
  private readonly materialInput = viewChild(MatInput);
  // The displayed hex input has no NgControl; refresh through Material's public API.
  private readonly refreshErrorState = effect(() => {
    // Track the outer error state even before Material receives its matcher input.
    this.errorMatcher.isErrorState(null, null);
    this.materialInput()?.updateErrorState();
  });
  override readonly label = input("Couleur");
  readonly colors = input<string[][] | undefined>(DEFAULT_COLORS);
  readonly inline = input(false);
  readonly defaultColors = DEFAULT_COLORS;
  protected override emptyValue(): null {
    return null;
  }
  protected override copyValue(value: ColorValue | null): ColorValue | null {
    return value ? { ...value } : null;
  }
  setColor(hex: string): void {
    const normalized = hex.replace("#", "");
    const expanded =
      normalized.length === 3
        ? normalized
            .split("")
            .map((value) => value + value)
            .join("")
        : normalized;
    const rgb = [0, 2, 4].map((offset) =>
      parseInt(expanded.slice(offset, offset + 2), 16),
    );
    this.commit({
      hex,
      contrast:
        rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 179
          ? "#000000"
          : "#ffffff",
    });
  }
  setContrast(contrast: string): void {
    const value = this.value();
    if (value) this.commit({ ...value, contrast });
  }
  clearValue(): void {
    this.commit(null);
  }
}
