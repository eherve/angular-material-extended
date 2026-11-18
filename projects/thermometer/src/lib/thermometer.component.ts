import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

export type ThermometerColorThreshold = [number, string] | [string];
export type ThermometerIcon =
  | "flame"
  | "water-drop"
  | "fire"
  | "light"
  | "humidity"
  | "cloud"
  | "air-quality";

@Component({
  selector: "app-thermometer",
  standalone: true,
  host: {
    role: "img",
    "[attr.aria-label]":
      "displayValue() === null ? '—' : displayValue() + ' ' + unit()",
  },
  imports: [DecimalPipe, MatIconModule],
  templateUrl: "./thermometer.component.html",
  styleUrl: "./thermometer.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThermometerComponent {
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly graduationColors = input<
    ThermometerColorThreshold[] | null | undefined
  >();
  readonly colors = input<ThermometerColorThreshold[] | null | undefined>();
  readonly setpoint = input<number | null | undefined>(null);
  readonly value = input<number | null | undefined>(null);
  readonly unit = input("°C");
  readonly round = input("0.0-0");
  readonly icon = input<ThermometerIcon>();
  readonly color = input<string>();
  readonly setpointLabel = input("Consigne");
  readonly validRange = computed(
    () =>
      Number.isFinite(this.min()) &&
      Number.isFinite(this.max()) &&
      Number.isFinite(this.max() - this.min()) &&
      this.max() > this.min(),
  );
  readonly displayValue = computed(() => this.finiteValue(this.value()));
  readonly displaySetpoint = computed(() =>
    this.validRange() ? this.finiteValue(this.setpoint()) : null,
  );
  readonly graduation = computed(() =>
    this.validRange()
      ? Array.from({ length: 21 }, (_, index) => {
          const value =
            index === 20
              ? this.max()
              : this.min() + (this.max() - this.min()) * (index / 20);
          return {
            value,
            color: this.getColor(
              this.graduationColors(),
              value,
              "var(--ngx-mat-thermometer-graduation-color, #aaa)",
            ),
          };
        })
      : [],
  );
  readonly valuePercent = computed(() =>
    this.validRange() && this.displayValue() !== null
      ? (1 - this.rangeFraction(this.displayValue()!)) * 100
      : null,
  );
  readonly setpointOffset = computed(() =>
    this.displaySetpoint() === null
      ? null
      : this.rangeFraction(this.displaySetpoint()!) * 120,
  );
  readonly displayColor = computed(() =>
    this.getColor(
      this.colors(),
      this.displayValue(),
      this.color() || "var(--ngx-mat-thermometer-color, #09293c)",
    ),
  );

  private finiteValue(value: number | null | undefined): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  private rangeFraction(value: number): number {
    return Math.min(
      Math.max((value - this.min()) / (this.max() - this.min()), 0),
      1,
    );
  }

  private getColor(
    colors: ThermometerColorThreshold[] | null | undefined,
    value: number | null,
    fallback: string,
  ): string {
    if (!colors || value === null) return fallback;
    for (const option of colors) {
      if (option.length === 1) return option[0];
      if (value < option[0]) return option[1];
    }
    return fallback;
  }
}
