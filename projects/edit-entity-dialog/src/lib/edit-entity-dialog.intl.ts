import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface EditEntityDialogMessages {
  mutationFailed: string;
  unarchive: string;
  noSection: string;
  noComponent: string;
  noContent: string;
  showJson: string;
  no: string;
  confirmation: string;
  stay: string;
  yes: string;
  discardConfirm: string;
  discardTitle: string;
  jsonTitle: string;
  loadFailed: string;
  noData: string;
  unarchived: string;
  archived: string;
  archiveConfirm: string;
  archive: string;
  removed: string;
  removalConfirm: string;
  removalTitle: string;
  updated: string;
  created: string;
  updatedValues: string;
  formGroup: string;
  record: string;
  showEmptyFields: string;
  update: string;
  create: string;
  cancel: string;
  close: string;
  loading: string;
  invalidField: string;
  invalidFields: string;
  missingField: string;
  missingFields: string;
  required: string;
  integer: string;
  minimum: string;
  maximum: string;
  searchFailed: string;
  invalidEntity: string;
  emptyList: string;
  reorder: string;
  open: string;
  remove: string;
  clear: string;
  loadMore: string;
  durationDaysLabel: string;
  durationDaysUnit: string;
  durationHoursUnit: string;
  durationMinutesUnit: string;
  durationHoursLabel: string;
  durationMinutesLabel: string;
  invalidDate: string;
  invalidTime: string;
  rangeStart: string;
  rangeEnd: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  invalidDateStart: string;
  invalidDateEnd: string;
  requiredDateStart: string;
  requiredDateEnd: string;
  invalidTimeStart: string;
  invalidTimeEnd: string;
  requiredTimeStart: string;
  requiredTimeEnd: string;
  dateMinimum: string;
  dateMaximum: string;
  timeMinimum: string;
  timeMaximum: string;
  toggleLock: string;
  durationMinimum: string;
  durationMaximum: string;
  emailInvalid: string;
  invalidPattern: string;
  unique: string;
  maximumLength: string;
  copy: string;
  copied: string;
  showPassword: string;
  hidePassword: string;
}

/** Hosts may replace these messages and emit changes after updating them. */
@Injectable({ providedIn: "root" })
export class EditEntityDialogIntl {
  readonly changes = new Subject<void>();
  messages: EditEntityDialogMessages = {
    mutationFailed: "L’opération a échoué. Réessayez.",
    unarchive: "Désarchiver",
    noSection: "Aucune section à afficher.",
    noComponent: "Aucun composant configuré",
    noContent: "Aucun contenu à afficher.",
    showJson: "Afficher les données JSON",
    no: "Non",
    confirmation: "Confirmation",
    stay: "Rester sur la page",
    yes: "Oui",
    discardConfirm:
      "Des modifications sont en cours, souhaitez-vous réellement quitter sans les enregistrer ?",
    discardTitle: "Annuler les modifications",
    jsonTitle: "Données JSON",
    loadFailed: "Impossible de charger les données.",
    noData: "Aucune donnée à éditer.",
    unarchived: "Désarchivage effectué",
    archived: "Archivage effectué",
    archiveConfirm: "Confirmez-vous l'archivage ?",
    archive: "Archiver",
    removed: "Suppression effectuée",
    removalConfirm: "Confirmez-vous la suppression ?",
    removalTitle: "Suppression",
    updated: "Mise à jour effectuée",
    created: "Création effectuée",
    updatedValues: "Updated values",
    formGroup: "FormGroup",
    record: "Record",
    showEmptyFields: "Afficher les champs vides",
    update: "Mettre à jour",
    create: "Créer",
    cancel: "Annuler",
    close: "Fermer",
    loading: "Chargement des données",
    invalidField: "1 champ en erreur",
    invalidFields: "{count} champs en erreur",
    missingField: "1 champ obligatoire manquant",
    missingFields: "{count} champs obligatoires manquants",
    required: "Obligatoire",
    integer: "Nombre entier requis",
    minimum: "Valeur minimum : {value}",
    maximum: "Valeur maximale : {value}",
    searchFailed: "La recherche a échoué. Réessayez.",
    invalidEntity: "Sélectionnez un élément",
    emptyList: "Aucun élément",
    reorder: "Réordonner",
    open: "Ouvrir",
    remove: "Supprimer",
    clear: "Effacer",
    loadMore: "Charger plus",
    durationDaysLabel: "Jours",
    durationDaysUnit: "j",
    durationHoursUnit: "h",
    durationMinutesUnit: "min",
    durationHoursLabel: "Heures",
    durationMinutesLabel: "Minutes",
    invalidDate: "Date invalide",
    invalidTime: "Heure invalide",
    rangeStart: "début",
    rangeEnd: "fin",
    dateRangeStart: "Début",
    dateRangeEnd: "Fin",
    invalidDateStart: "Date de début invalide",
    invalidDateEnd: "Date de fin invalide",
    requiredDateStart: "Date de début obligatoire",
    requiredDateEnd: "Date de fin obligatoire",
    invalidTimeStart: "Heure de début invalide",
    invalidTimeEnd: "Heure de fin invalide",
    requiredTimeStart: "Heure de début obligatoire",
    requiredTimeEnd: "Heure de fin obligatoire",
    dateMinimum: "La date doit être postérieure ou égale au {value}.",
    dateMaximum: "La date doit être antérieure ou égale au {value}.",
    timeMinimum: "L'heure doit être postérieure ou égale à {value}.",
    timeMaximum: "L'heure doit être antérieure ou égale à {value}.",
    toggleLock: "Verrouiller ou déverrouiller",
    durationMinimum: "Durée minimum : {value}",
    durationMaximum: "Durée maximum : {value}",
    emailInvalid: "Adresse email invalide",
    invalidPattern: "Le format est invalide",
    unique: "Existe déjà",
    maximumLength:
      "Nombre de caractère max dépassé : {requiredLength} ({actualLength})",
    copy: "Copier",
    copied: "Copié",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
  };
}
