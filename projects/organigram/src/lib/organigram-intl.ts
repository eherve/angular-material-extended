import { Injectable, signal } from '@angular/core';

export interface OrganigramMessages {
  loadError: string;
  retry: string;
}

@Injectable({ providedIn: 'root' })
export class OrganigramIntl {
  readonly messages = signal<OrganigramMessages>({
    loadError: 'Impossible de charger cette rubrique.',
    retry: 'Réessayer',
  });
}
