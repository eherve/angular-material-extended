import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface SectionTabsMessages {
  sections: string;
  emptySections: string;
  emptyComponents: string;
  emptyFields: string;
  emptyFieldsDescription: string;
  showEmptyFields: string;
}

@Injectable({ providedIn: "root" })
export class SectionTabsIntl {
  readonly changes = new Subject<void>();
  messages: SectionTabsMessages = {
    sections: "Sections",
    emptySections: "Aucune section à afficher",
    emptyComponents: "Aucun composant configuré",
    emptyFields: "Aucun champ renseigné",
    emptyFieldsDescription: "Activez l'affichage des champs vides pour voir les informations attendues.",
    showEmptyFields: "Afficher les champs vides",
  };
}
