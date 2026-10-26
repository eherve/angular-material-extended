/** @format */

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  RangeSelectorComponent,
  RangeSelectorOption,
  RangeSelectorState,
} from '@eherve/angular-material-range-selector';

@Component({
  selector: 'app-range-selector-demo',
  imports: [DatePipe, MatButtonModule, RangeSelectorComponent],
  templateUrl: './range-selector-demo.component.html',
  styleUrl: './range-selector-demo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeSelectorDemoComponent {
  readonly state = signal<RangeSelectorState | null>(null);
  readonly customState = signal<RangeSelectorState | null>(null);
  readonly refreshed = signal(false);
  readonly ranges: RangeSelectorOption[] = [
    { id: 'week', label: 'Semaine', view: 'week' },
    { id: 'month', label: 'Mois', view: 'month' },
    { id: 'rolling', label: '30 jours', amount: 30, unit: 'days' },
  ];
}
