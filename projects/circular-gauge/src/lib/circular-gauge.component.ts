import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Circular progress indicator with an optional unavailable state. */
@Component({
  selector: 'app-circular-gauge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'accessibleLabel()',
    '[class.compact]': 'compact()',
    '[style.--gauge-progress]': 'progressStyle()',
    '[style.--gauge-color]': 'color()',
  },
  template: `<div class="gauge" [class.unavailable]="progress() === null">
    <div class="gauge-inner"><strong>{{ progress() === null ? '—' : text() }}</strong>
      @if (progress() !== null && suffix()) { <span>{{ suffix() }}</span> }
    </div>
  </div>`,
  styleUrl: './circular-gauge.component.scss',
})
export class CircularGaugeComponent {
  readonly progress = input<number | string | null>(null);
  readonly text = input.required<string>();
  readonly label = input.required<string>();
  readonly suffix = input('');
  readonly color = input('var(--ngx-mat-circular-gauge-color, var(--mat-sys-primary, currentColor))');
  readonly unavailableLabel = input('Non calculable');
  readonly compact = input(false);
  readonly progressStyle = computed((): string => {
    const progress = this.progress();
    const value = typeof progress === 'string' ? Number.parseFloat(progress) : progress;
    return `${value === null || !Number.isFinite(value) ? 0 : Math.max(0, Math.min(100, value))}%`;
  });
  readonly accessibleLabel = computed((): string => this.progress() === null ?
    `${this.label()} : ${this.unavailableLabel()}` : `${this.label()} : ${this.text()}${this.suffix()}`);
}
