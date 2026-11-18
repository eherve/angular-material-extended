import { DecimalPipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from "@angular/core";

@Component({
  selector: "app-star-rate",
  standalone: true,
  host: {
    role: "img",
    "[attr.aria-label]": "displayValue() + ' / ' + starCount()",
  },
  imports: [DecimalPipe],
  templateUrl: "./star-rate.component.html",
  styleUrl: "./star-rate.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRateComponent {
  readonly shrink = input(false, { transform: booleanAttribute });
  readonly max = input(5, { transform: numberAttribute });
  readonly value = input(0, {
    transform: (value: number | string | null | undefined): number =>
      typeof value === "string" ? parseFloat(value) : (value ?? 0),
  });
  readonly step = input<number | null>(null);
  readonly starCount = computed(() =>
    Number.isFinite(this.max()) && this.max() > 0 ? Math.floor(this.max()) : 0,
  );
  readonly displayValue = computed(() =>
    Number.isFinite(this.value())
      ? Math.min(Math.max(this.value(), 0), this.starCount())
      : 0,
  );
  readonly fills = computed(() =>
    Array.from({ length: this.starCount() }, (_, index) =>
      Math.min(
        Math.max(this.roundValue(this.displayValue() - index) * 100, 0),
        100,
      ),
    ),
  );
  readonly percent = computed(() =>
    this.starCount()
      ? Math.min(
          Math.max(
            (this.roundValue(this.displayValue()) / this.starCount()) * 100,
            0,
          ),
          100,
        )
      : 0,
  );

  private roundValue(value: number): number {
    const step = this.step();
    return step !== null && Number.isFinite(step) && step > 0
      ? Math.round(value / step) * step
      : value;
  }
}
