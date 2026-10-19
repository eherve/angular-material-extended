import { Component, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  SECTION_SELECTION_HANDLER,
  SectionSelectionHandler,
  SectionTabsDisplayOptions,
  SectionTabsModule,
} from '@eherve/angular-material-section-tabs';

interface DemoRecord {
  name: string;
  quantity: number;
  active: boolean;
}

@Injectable()
export class MemorySectionSelectionHandler implements SectionSelectionHandler {
  private readonly groups = new Map<string, BehaviorSubject<string | null>>();

  private getGroup(key: string): BehaviorSubject<string | null> {
    let group = this.groups.get(key);
    if (!group) {
      group = new BehaviorSubject<string | null>(null);
      this.groups.set(key, group);
    }
    return group;
  }

  observe(key: string): Observable<string | null> {
    return this.getGroup(key).asObservable();
  }

  select(key: string, value: string): void {
    this.getGroup(key).next(value);
  }
}

@Component({
  selector: 'app-section-tabs-demo',
  standalone: true,
  imports: [SectionTabsModule],
  providers: [MemorySectionSelectionHandler, { provide: SECTION_SELECTION_HANDLER, useExisting: MemorySectionSelectionHandler }],
  templateUrl: './section-tabs-demo.component.html',
  styleUrl: './section-tabs-demo.component.scss',
})
export class SectionTabsDemoComponent {
  readonly record: DemoRecord = { name: 'Exemple de configuration', quantity: 0, active: true };
  readonly localOptions: SectionTabsDisplayOptions = this.makeOptions();
  readonly synchronizedOptions: SectionTabsDisplayOptions = this.makeOptions();

  private makeOptions(): SectionTabsDisplayOptions {
    return {
      data: this.record,
      sections: [
        {
          id: 'details',
          queryParamValue: 'details',
          label: 'Détails',
          icon: 'info',
          cards: [
            {
              id: 'general',
              label: 'Informations générales',
              grid: { columns: 2, gap: '12px', minColumnWidth: '220px' },
              fields: [
                { kind: 'text', label: 'Nom', path: 'name' },
                { kind: 'number', label: 'Quantité', path: 'quantity', decimal: 0 },
                { kind: 'text', label: 'Actif', path: 'active' },
              ],
            },
          ],
        },
        {
          id: 'history',
          queryParamValue: 'history',
          label: 'Historique',
          icon: 'history',
          cards: [{ id: 'events', label: 'Événements', fields: [{ kind: 'text', label: 'Dernière mise à jour', path: 'name' }] }],
        },
      ],
    };
  }
}
