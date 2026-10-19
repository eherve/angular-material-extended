# Spécification de Edit Entity Dialog

Statut : spécification validée par l’utilisateur le 16 octobre 2026 ; implémentation autorisée et en cours. Les [contraintes communes](2026-10-16-sesio-extraction-design.md) et la [spec sections](2026-10-16-section-tabs-design.md) s’appliquent.

## Périmètre et structure

Source principale : `S/apps/webapp/src/app/_components/edit-entity-dialog/`.
Destination : `L/projects/edit-entity-dialog/src/lib/`.

Conserver l’organisation du moteur : `components/`, `classes/`, `services/`, `fields/`, `directives/`, le module, le service d’ouverture et les types. Ajouter `controls/` pour les implémentations privées de contrôles Material et `internal/` pour les helpers strictement nécessaires.

Le moteur doit construire et valider un formulaire avant le rendu paresseux des onglets. Il gère la présentation, l’état du formulaire et les callbacks configurés. Il ne connaît ni API HTTP, ni entités sésiO, ni session, ni habilitations.

## API publique et types

Exporter `EditEntityDialogModule`, `EditEntityDialogService`, `EditEntityDialog`, `EditEntityComponent`, `EditEntityFormGroup`, `EditEntityFormControl`, `EditEntityControlStateApi`, les configurations de champs/cards/sections/actions et les résultats utilisés par les consommateurs.

Les types spécifiques des champs sont déplacés depuis leurs composants vers `fields/edit-entity-field.types.ts`, exporté par `public-api.ts`. Conserver les noms existants (`TextFormField`, `SelectFormField`, `AutocompleteFormField`, etc.) lorsqu’ils existent, et exporter les types de service et d’option nécessaires. Les composants de rendu et les services internes ne deviennent pas publics uniquement pour faciliter un import depuis sésiO.

Le NgModule exporte le moteur embarqué et le dialog, pas chaque contrôle interne. Les extensions métier anciennement exportées par ce module sont exportées depuis leurs nouveaux emplacements dans S.

Préserver les signatures des callbacks de chargement, création, mise à jour et suppression et le résultat :

```ts
export interface EditEntityDialogResult<TRecord extends EditEntityRecord> {
  updated: boolean;
  created?: boolean;
  removed?: boolean;
  archived?: boolean;
  record?: TRecord;
}

export interface EditEntityArchiveState {
  isArchived: boolean;
}
export type EditEntityRecord = {
  _id?: string;
  __archived?: EditEntityArchiveState;
};
```

Remplacer `Archived` dans `EditEntityDataService.archive` par `EditEntityArchiveState`. Un objet sésiO comportant date et utilisateur reste structurellement assignable et doit être conservé intégralement dans le record ; la bibliothèque n’en lit que `isArchived`. Ne pas introduire un identifiant générique alternatif à `_id` dans cette première version.

Retirer l’index libre `any` du record cible. Les accès aux chemins dynamiques passent par des helpers `unknown` avec gardes et des génériques de valeur. Ne pas profiter de l’extraction pour réécrire tout le système de formulaires ; typer les frontières nouvelles et documenter les propriétés existantes réellement supportées.

## Champs et contrôles intégrés

Les contrôles sont des composants privés Angular Material/CDK, pilotés par les types de configuration du moteur. Ils peuvent conserver une séparation field/ControlValueAccessor quand elle est utile. Ils ne dépendent pas des `form-control-*` restés dans S.

| Famille | Kinds intégrés | Source supplémentaire à adapter |
|---|---|---|
| Texte et nombre | `text`, `textarea`, `number` | `_components/form-control-text/`, `form-control-textarea/`, `form-control-number/` |
| Choix | `select`, `radio`, `checkbox`, `chips`, `slider` | `form-control-select/`, wrappers existants |
| Recherche | `autocomplete` | `form-control-autocomplete/`, directive adaptive autocomplete, helpers de recherche/groupement |
| Liste ordonnée | `sortable-list` | `form-control-sortable-list/` ; partager les types de recherche, pas les états de recherche |
| Durée | `duration` | `form-control-duration/` |
| Dates et heures | `date`, `date-range`, `datetime`, `datetime-range`, `time`, `time-range` | Wrappers actuels, adaptateurs Material et Ng-Matero |
| Composition | `control`, `display`, `metadata`, `separator` | Renderer et form builder actuels |

Chaque contrôle respecte : `writeValue` sans émission utilisateur, disabled/required/touched/dirty, validation, effacement, valeurs `0` et `false`, et nettoyage des abonnements. Si le contrôle utilise directement le FormControl du moteur, ne pas ajouter un CVA redondant.

### Contrats de recherche et de choix

Conserver l’ordre actuel des arguments, en typant les valeurs :

```ts
export interface IFormControlSelectOption<TValue = unknown> {
  name: string;
  value: TValue;
  color?: string;
  disabled?: boolean;
  group?: string;
}

export interface AutocompleteFormFieldService<TRecord, TValue> {
  display(value: TValue): { name: string; prefix?: string; color?: string };
  search(
    limit: number,
    skip: number,
    search: string,
    record: TRecord | undefined,
    formGroup: FormGroup,
    selected?: TValue | TValue[],
  ): Promise<{ data: TValue[]; matchCount: number }>;
  group?: string | ((value: TValue) => string);
  open?: (value: TValue) => void;
}
```

Les options de select restent un tableau, un Observable de tableau ou une fonction `(record, formGroup) => options`. Réévaluer les fonctions lors des changements du formulaire et les abonnements lors du remplacement de configuration. Les groupes, choix désactivés et sélection multiple doivent être préservés.

Pour autocomplete et liste triable, préserver pagination `limit/skip`, texte de recherche, affichage, groupement, sélection unique/multiple et callback `open`. Les résultats d’une ancienne recherche ne doivent pas remplacer ceux de la recherche courante ; une erreur laisse le contrôle utilisable et indique l’échec sans supprimer la sélection. Préserver l’égalité des objets et la prévention des doublons selon le comportement des contrôles sources ; les tests utilisent deux objets distincts représentant le même `_id`.

La durée reste stockée en **minutes**. Conserver les `quickOptions`, les bornes et l’effacement à `null` ; une valeur de 90 représente une heure trente et n’est jamais convertie implicitement en secondes.

### Dates et verrouillage

Conserver les valeurs et bornes actuelles Date/Moment/Day.js, les chemins de contrôles utilisés comme bornes dynamiques et `included` pour la normalisation de début de journée. Ne pas changer la sémantique de fuseau ou la sérialisation lors de l’extraction.

Supprimer la lecture directe `SessionData.$user` et du propriétaire dans le contrôle date. Ajouter à `DateFormField<TRecord>` :

```ts
canToggleLock?: EditEntityConditionalState<TRecord>;
```

Avec `lockedProperty` : le formulaire contient toujours le contrôle booléen correspondant ; `canToggleLock` vaut `false` par défaut. Le bouton n’est accessible que lorsque cette permission est vraie. Si la valeur est verrouillée et la permission fausse, le champ date est désactivé. Sans `lockedProperty`, aucun comportement de verrouillage. sésiO fournit explicitement la règle actuelle « création ou utilisateur créateur » et conserve ses contrôles serveur.

Ne pas forcer la locale française dans les providers du NgModule. Documenter les providers d’adaptateurs et `MAT_DATE_LOCALE` à installer par l’hôte. La démo utilise `fr`, sésiO conserve sa configuration.

## Extensions hors du package

- `rte` n’est pas un kind intégré de première version. Migrer ses usages sésiO vers `kind: 'control'` avec un composant local utilisant Quill. Conserver `moduleName`, `filePathPrefix`, hauteur et upload dans S.
- Les cards de localisation, RTE et action tree restent des cards `kind: 'component'` dans S.
- Les onglets médias et analyse documentaire restent des composants S. Leur dépendance à DisplayDialog ne crée donc pas de dépendance entre les packages.
- Les contrôles globaux `form-control-*` de S encore utilisés ailleurs restent en place. Le nouveau moteur ne doit pas les importer.

Le contrat existant d’un champ `control` conserve `component`, `inputs`, `fields` (mapping input → chemin du formulaire), et les inputs automatiques `label`, `control`, `formGroup`, `record`. Filtrer les inputs sur ceux déclarés par le composant ; rafraîchir les valeurs mappées lors des changements du formulaire.

Une card composant déclare tous ses contrôles dans `fields`, même si elle n’est pas encore rendue. `completion` ne remplace pas ces déclarations. Les contrôles ne sont pas rendus une seconde fois par le moteur.

## Permissions et modèle de rendu

Supprimer `EditEntityAccessScope`, `Workspace`, `WorkspaceModule` et la dépendance `UserAccessService`. Retirer la propriété `section.access` du contrat npm. Côté sésiO, la remplacer par une condition `visible` obtenue dans `sesio-edit-access.ts`.

Cette condition doit être combinée avec l’éventuelle condition `visible` déjà présente, préserver les mises à jour asynchrones et rester fausse en création sans record, conformément au contrat actuel `access`. Ne pas remplacer une permission par `true` pour faire compiler.

Conserver les états `visible`, `disabled`, `required`, `editable` et leur forme booléen/Observable/fonction existante, les grilles et compteurs. Ne pas inclure un champ non éditable dans un payload simplement parce qu’un contrôle existe. Les règles de payload restent celles du service `edit-entity-submit-value` actuel.

## Connexion et services d’interface

Ajouter dans `edit-entity-dialog.types.ts` :

```ts
export interface EditEntityDialogConnection<TRecord extends EditEntityRecord> {
  actions?: readonly EditEntityAction<TRecord>[];
  recordChanged?(record: TRecord | undefined): void;
  destroy?(): void;
}
// Ajouter à EditEntityComponentOptions<TRecord> :
// connect?: () => EditEntityDialogConnection<TRecord>;
```

Supprimer `visualContext` et `queryParameter` du contrat npm. Les options sésiO correspondantes vivent dans `SesioEditDialogIntegrationOptions<TRecord>`.

Une connexion est créée pour l’initialisation des options du composant. Elle reçoit le record après construction initiale du formulaire, y compris `undefined` en création, puis après création, update, archive ou remplacement du record par une action. Recalculer les inputs d’actions après cet événement. Une reconstruction interne du formulaire après sauvegarde ne crée pas une seconde connexion et ne double pas l’événement. Changer l’ensemble d’options détruit l’ancienne connexion. La destruction est exécutée exactement une fois et libère URL et Noos.

Afficher les actions des options suivies des actions de connexion, dans leurs positions respectives, sans muter les options. Une configuration réutilisée pour deux ouvertures produit deux jeux d’actions de connexion indépendants ; aucun état de registration ne doit être stocké dans le service singleton ou dans la configuration partagée.

`SesioEditDialogIntegrationService.decorate<TRecord extends EditEntityRecord>(options: EditEntityComponentOptions<TRecord>, integration: SesioEditDialogIntegrationOptions<TRecord>): EditEntityComponentOptions<TRecord>` retourne une nouvelle configuration, compose les connexions existantes et leurs actions, puis conserve les callbacks `prepareFormGroup`, `ready`, `onValueChanges` des consommateurs. Ajouter Noos aux actions de la connexion, avec inputs calculés depuis la registration privée de cette connexion. Les informations visuelles et query parameters de cette interface reprennent les types source mais restent définies dans S.

Dans `edit-entity-dialog-host.ts` :

```ts
export interface EditEntityDialogJsonSource {
  label: string;
  value: unknown;
}
export interface EditEntityDialogHost {
  confirm(options: EditEntityConfirmOptions): Promise<boolean>;
  notify(message: string): void;
  showJson(title: string, sources: readonly EditEntityDialogJsonSource[]): void;
}
export const EDIT_ENTITY_DIALOG_HOST =
  new InjectionToken<EditEntityDialogHost>('EDIT_ENTITY_DIALOG_HOST');
```

Implémentation par défaut privée : MatDialog pour confirmation et JSON textuel, MatSnackBar pour notifications. Le provider sésiO délègue aux services existants. `disableNotifications` reste respecté. Les erreurs de callbacks de connexion vont à `ErrorHandler` sans masquer le résultat d’une opération métier déjà réussie.

## Cycle de formulaire, mutations et fermeture

- Préserver `prepareFormGroup`, `ready`, chemins imbriqués, valeurs initiales et `resetInitialValue`.
- Les defaults appliqués à un record persisté incomplet ne rendent pas immédiatement le formulaire modifié. Reprendre le test existant sur ce cas.
- La création transmet la valeur de création construite ; la mise à jour transmet seulement les changements et les champs `alwaysInUpsert` selon les règles actuelles.
- `update` retournant `false` ne marque pas le formulaire sauvegardé. Un retour `true` conserve les modifications validées dans le record courant ; un record retourné par le serveur devient la référence complète.
- Une Promise rejetée maintient le dialog ouvert, conserve les saisies et libère l’état `updating` dans `finally`. Afficher une erreur non technique via les messages configurables et permettre une nouvelle tentative.
- Préserver suppression, raisons de non-suppression, archive/désarchive et `closeOnUpsert`. Aucune opération automatique sans action utilisateur.
- `confirmOnWipClose` utilise le host de confirmation ; refuser la confirmation conserve le formulaire.
- Seul le dialog au sommet traite Entrée et Échap. Préserver les exclusions de saisie multi-ligne, les overlays et les règles du composant source ; tester le cas où un autocomplete est ouvert.
- Les abonnements du form builder, du renderer, des conditions, des contrôles et des connexions sont libérés au remplacement ou à la destruction.

## Tests d’acceptation par unité

| Unité | Cas obligatoires |
|---|---|
| FormGroup / builder | Defaults sur record persisté sans dirty ; chemins imbriqués ; arrays ; reset partiel ; contrôle de card non visitée déjà valide/invalide |
| Submit value | Create complet ; update partiel ; `alwaysInUpsert` ; champs non éditables ; aucune perte des valeurs `0`/`false` |
| Renderer | Conditions synchrones/Observable ; visibilité combinée ; `single-card` ; compteurs ; composants et inputs filtrés |
| Texte/nombre/choix | Required, min/max, valeur nulle, select multiple/groupé/désactivé, remplacement d’options, propagation touched/disabled |
| Autocomplete | Pagination, course de deux recherches, erreur puis reprise, sélection objet, absence de doublons |
| Liste triable | Ajout, suppression et réordonnancement ; ordre présent dans la valeur envoyée ; aucun changement en disabled |
| Durée | 90 minutes, min/max, quick option, valeur 0 et effacement null |
| Dates | Bornes liées à un autre contrôle, `included`, date vide, autorisation du verrouillage true/false et changement de permission |
| Mutations | Create faux/record ; update faux/vrai/record ; erreur puis retry ; archive objet conservé avec propriétés supplémentaires |
| Fermeture | Résultat exact ; confirmation refusée ; Entrée/Échap sur dialogs imbriqués ; autocomplete ouvert |
| Connexion | Initialisation création/édition, record après mutation, aucune double notification après rebuild, nettoyage exactement une fois |
| Extension | Contrôle et card locaux branchés sans import de S dans le package ; valeurs déclarées avant leur premier rendu |

Les tests de verrouillage côté S vérifient utilisateur créateur, autre utilisateur et création. Les tests Noos/URL utilisent des doubles, sans requête AWS ou API métier.

## Livrable autonome

La démo `L/src/app/demos/edit-entity-dialog/edit-entity-dialog-demo.component.{ts,html,scss}` utilise une entité fictive en mémoire, couvre les familles de champs, create/update, une card composant, un champ `control`, des erreurs simulées et un dialog imbriqué. Son README documente les types réellement exportés, les providers date/locale, le thème, les connexions et le résultat de fermeture.
