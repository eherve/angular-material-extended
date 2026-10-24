import { Injectable, signal } from '@angular/core';

export interface OrganigramGraphMessages {
  empty: string;
  invalidGraph: string;
}

@Injectable({ providedIn: 'root' })
export class OrganigramGraphIntl {
  readonly messages = signal<OrganigramGraphMessages>({
    empty: 'Aucun élément à afficher.',
    invalidGraph: 'Impossible d’afficher ce graphe : les données sont invalides.',
  });
}
