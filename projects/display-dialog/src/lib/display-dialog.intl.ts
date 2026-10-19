import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface DisplayDialogMessages {
  loadingLabel: string;
  closeLabel: string;
  emptyLabel: string;
  errorLabel: string;
  actionErrorLabel: string;
  jsonTitle: string;
  jsonButtonLabel: string;
  recordLabel: string;
  confirmTitle: string;
  confirmOk: string;
  confirmCancel: string;
  emptyContentLabel: string;
}

@Injectable({providedIn: 'root'})
export class DisplayDialogIntl {
  readonly changes = new Subject<void>();
  messages: DisplayDialogMessages = {
    loadingLabel: 'Chargement des données',
    closeLabel: 'Fermer',
    emptyLabel: 'Aucune donnée à afficher.',
    errorLabel: 'Impossible de charger les données.',
    actionErrorLabel: "Impossible d’exécuter cette action.",
    jsonTitle: 'Données JSON',
    jsonButtonLabel: 'Afficher les données JSON',
    recordLabel: 'Record',
    confirmTitle: 'Confirmation',
    confirmOk: 'Oui',
    confirmCancel: 'Non',
    emptyContentLabel: 'Aucun contenu à afficher.',
  };
}
