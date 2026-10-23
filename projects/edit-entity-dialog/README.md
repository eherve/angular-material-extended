# Angular Material Edit Entity Dialog

Package : `@eherve/angular-material-edit-entity-dialog`, version initiale `22.0.0`.

Moteur d’édition configurable Angular Material : formulaire embarqué ou dialog, sections et onglets paresseux, validation avant rendu et extensions locales. Aucune API applicative, session ou navigation n’est nécessaire.

## API disponible

`EditEntityDialogModule`, `EditEntityDialogService`, `EditEntityDialog`, `EditEntityComponent`, `EditEntityDialogOpenConfig`, `EditEntityDialogNestedOptions`, `EditEntityFormGroup`, `EditEntityFormControl`, `EditEntityControlStateApi`, les types de configuration de `edit-entity-dialog.types.ts`, les types spécialisés de `fields/edit-entity-field.types.ts`, les types de base des champs, `EDIT_ENTITY_DIALOG_HOST` et `EditEntityDialogIntl` sont publics. Les services builder, renderer, conditions et payload restent privés.

Le record minimal est structurel : `{ _id?: string; __archived?: { isArchived: boolean } }`. Il n'a pas d'index `any`. Un record applicatif peut ajouter ses propriétés et conserver intégralement un état d'archive plus riche. Les callbacks de données gardent les signatures source : `create(value, formGroup, options)`, `update(_id, value, formGroup, options)`, `remove(_id)`, `archive(_id)` ; `archive` renvoie `Promise<EditEntityArchiveState>`.

Le résultat conserve `updated`, `created?`, `removed?`, `archived?`, `record?`. Une connexion est déclarée par `connect: () => EditEntityDialogConnection<TRecord>`, avec `actions?`, `recordChanged?(record)` et `destroy?()`. Le moteur crée une connexion par initialisation d’options, appelle `recordChanged` après construction initiale (avec `undefined` en création) et après une mutation réussie, avant de calculer les inputs des actions. Il détruit la connexion exactement une fois au remplacement des options ou à sa destruction. Une sauvegarde ne recrée pas la connexion et ne double pas cet événement. Les erreurs des callbacks passent à Angular `ErrorHandler` sans annuler une mutation réussie.

## Champs et valeurs

Les kinds intégrés déclarés sont `control`, `text`, `textarea`, `duration`, `number`, `checkbox`, `radio`, `select`, `autocomplete`, `date`, `date-range`, `datetime`, `datetime-range`, `time`, `time-range`, `chips`, `sortable-list`, `slider`, `display`, `metadata`, `separator`. Le RTE applicatif utilise une extension `control`. Les autocompletes multiples et les listes triables utilisent l’apparence Material `fill` pour la recherche, et une icône `delete` pour retirer une valeur ; les autocompletes simples conservent `outline`.

Les croix d’effacement des champs de saisie utilisent une icône de 18 px et la couleur `--ngx-mat-edit-entity-dialog-danger` (par défaut `--mat-sys-error`). Elles sont masquées si le champ est vide ou désactivé. Dans les listes triables et autocompletes multiples, la croix du champ d’ajout efface uniquement la recherche et conserve les valeurs sélectionnées. Les checkbox, radios et chips utilisés comme toggles ne portent pas de croix dédiée.

Les noms spécialisés source sont conservés : `TextFormField`, `TextareaFormField`, `NumberFormField`, `DurationFormField`, `SelectFormField`, `RadioFormField`, `CheckboxFormField`, `ChipsFormField`, `SliderFormField`, `AutocompleteFormField`, `SortableListFormField`, `DateFormField`, `DateRangeFormField`, `DatetimeFormField`, `DatetimeRangeFormField`, `TimeFormField`, `TimeRangeFormField`, `ControlFormField`, `DisplayFormField`.

`SelectFormField<TRecord, TValue>`, `AutocompleteFormField<TRecord, TValue>` et `SortableListFormField<TRecord, TValue>` acceptent un second paramètre de type optionnel. Pour un select typé, `TValue` désigne un élément d’option : `multiple: true` donne un `defaultValue` et des callbacks `onValueChanges`/`unique` de type `TValue[]` ; `multiple: false` ou absent conserve `TValue`. Sans second paramètre, le contrat reste `unknown` avec un booléen `multiple` dynamique accepté. Les options de select restent un tableau, un Observable de tableau ou une fonction `(record, formGroup) => options`. `IFormControlSelectOption<TValue>` conserve `name`, `value`, `color?`, `disabled?`, `group?`. `AutocompleteFormFieldService<TRecord, TValue>.search(limit, skip, search, record, formGroup, selected?)` renvoie `Promise<{ data: TValue[]; matchCount: number }>` ; `display`, `group` et `open` conservent leur contrat.

Une durée est en **minutes** : `90` signifie une heure trente. Les dates ne sont pas sérialisées ou converties implicitement. Les bornes date acceptent Date/Moment/Day.js et les chemins de contrôles selon les types source. `date-range` et `datetime-range` utilisent `{ start: Date | null; end: Date | null } | null` ; `time` est une chaîne et `time-range` utilise `{ start: string; end: string } | null`.

Avec `lockedProperty`, le builder crée immédiatement le contrôle booléen de verrouillage. `canToggleLock` vaut `false` par défaut ; une date verrouillée sans permission est désactivée. Les permissions métier sont fournies par l'hôte.

## Formulaire

Tous les contrôles déclarés dans les cards sont construits avant le rendu, y compris les cards `component` d'un onglet non visité. Une card composant doit déclarer ses contrôles dans `fields` et les réutiliser. Ses champs contribuent aux compteurs sans être rendus une seconde fois.

Les valeurs du record précèdent les defaults du champ, puis les defaults globaux. Les defaults d'un record persisté incomplet restent dans l'état initial, sans modification automatique. `setPathControl`, `patchPathValue`, `getControl`, `requireControl`, `requireFormControl` et `resetInitialValue(paths?)` conservent les chemins imbriqués et les contrôles plats historiques lorsque le parent est atomique.

Le payload de création inclut les defaults et les contrôles additionnels ; celui d'update inclut les changements et `alwaysInUpsert`. `metadata` et les champs réellement non éditables d'un record persisté sont exclus. Un champ simplement désactivé reste soumis, y compris `0` et `false`. L'éditabilité en création conserve le comportement source.

## Champs en lecture seule

Un champ `kind: 'display'` affiche uniquement sa valeur présentée, sans montrer la valeur brute du contrôle. `display` (texte HTML ou callback) reste prioritaire. Sans `display`, les valeurs `Date`, Moment et Day.js utilisent par défaut `DD/MM/YYYY HH[h]mm`, par exemple `01/11/2028 16h32`. La propriété `format` personnalise ce format avec les tokens Moment/Day.js ; elle permet aussi de formater une chaîne ISO ou un timestamp. Les valeurs absentes ou les dates invalides affichent une chaîne vide. Les autres valeurs restent du texte. Le formControl conserve sa valeur originale.

```ts
{ kind: "display", name: "confirmationDate", label: "Date de confirmation", format: "DD/MM/YYYY HH[h]mm" }
{ kind: "display", name: "birthDate", label: "Date de naissance", format: "DD/MM/YYYY" }
```

Le format utilise Moment pour les dates natives/chaînes ISO/timestamps, et `.format()` pour les objets Moment/Day.js, en conservant leur locale et leur fuseau. Les valeurs natives/ISO sont affichées dans le fuseau local du navigateur. Les formats des champs éditables `date`/`datetime` restent fournis par leurs adaptateurs Material/Ng-Matero.

## Hôte, traductions et dates

`EditEntityDialogHost` expose `confirm(options): Promise<boolean>`, `notify(message): void`, `showJson(title, sources): void`, où chaque source a `label` et `value: unknown`. L’implémentation privée par défaut utilise MatDialog pour confirmation et affichage JSON textuel, et MatSnackBar pour les notifications. Pour personnaliser, fournir `{ provide: EDIT_ENTITY_DIALOG_HOST, useClass: MyHost }`. `disableNotifications` désactive les notifications de réussite. Une erreur de mutation conserve la saisie, libère `updating` et signale un message configurable permettant une nouvelle tentative.

`EditEntityDialogIntl.messages` est un dictionnaire typé, avec tous les messages de shell, confirmation, validation, recherche et date/heure. Ses valeurs par défaut sont françaises. `{count}` marque les nombres de champs ; `{value}` les bornes ; `{requiredLength}` et `{actualLength}` les longueurs. Modifier les propriétés puis appeler `intl.changes.next()` rafraîchit immédiatement le moteur et les contrôles OnPush. Aucun global `$localize` n’est requis. La référence complète des clés et valeurs est `src/lib/edit-entity-dialog.intl.ts`.

L’hôte fournit les adaptateurs Material et Ng-Matero et sa locale. Exemple avec Moment :

```ts
import { provideMomentDateAdapter } from "@angular/material-moment-adapter";
import { provideMomentDatetimeAdapter } from "@ng-matero/extensions-moment-adapter";
import { MAT_DATE_LOCALE } from "@angular/material/core";

providers: [
  provideMomentDateAdapter(),
  ...provideMomentDatetimeAdapter(),
  { provide: MAT_DATE_LOCALE, useValue: "fr" },
];
```

Le package n’impose aucune locale. Les dépendances Moment, Day.js, Material Moment adapter, Ng-Matero extensions et leur adaptateur sont déclarées comme peers.

Les permissions workspace/module, `visualContext`, `queryParameter`, Noos et les intégrations métier sont hors du contrat npm. Aucun Router ni autre package de dialog n'est nécessaire.

## Ouvrir un dialog et recevoir son résultat

```ts
import {
  EditEntityDialogModule,
  EditEntityDialogService,
  EditEntityComponentOptions,
} from "@eherve/angular-material-edit-entity-dialog";

const options: EditEntityComponentOptions<{ _id?: string; name: string }> = {
  title: "Modifier un exemple",
  record: { _id: "1", name: "Exemple" },
  displayOptions: {
    section: {
      id: "main",
      label: "Général",
      cards: [
        {
          id: "identity",
          label: "Identité",
          fields: [
            { kind: "text", name: "name", label: "Nom", required: true },
          ],
        },
      ],
    },
  },
  service: { update: async (_id, changes) => true },
};
// Importer EditEntityDialogModule dans le module ou composant hôte.
dialogService
  .open(options)
  .afterClosed()
  .subscribe((result) => console.log(result));
```

`open(options, config?)` conserve la configuration MatDialog, plus `nested?: { inset?, minWidth?, minHeight?, viewportMargin? } | null`. Les valeurs par défaut sont `width: 90vw`, `height: 90vh`, `maxWidth/maxHeight: 90vw/90vh`, `autoFocus/restoreFocus: false`, `disableClose: true`, `panelClass: edit-entity-dialog-panel`. Les options de l’appelant surchargent ces valeurs ; `data` reste toujours `options`. Une ouverture imbriquée reprend les dimensions de la surface parente moins 64px, avec minimum 640 × 480 limité au viewport ; `nested: null` désactive ce comportement.

Le moteur embarqué conserve `<app-edit-entity-component [options]="options" (result)="onSaved($event)" (closeRequest)="onClose($event)" />`. `displayMode` vaut `page` ou `dialog`.

`create` retournant `false` conserve les modifications. Un record créé active `created: true`. `update` retournant `false` conserve les modifications ; `true` sauvegarde les valeurs courantes dans le record ; un record serveur remplace la référence et recharge le formulaire. Suppression et archivage conservent `removed` et `archived` ; toutes les propriétés d’un objet d’archive retourné sont préservées. `closeOnUpsert` émet directement le résultat. Une fermeture sans sauvegarde émet `{ updated: false, record }`.

Par défaut, fermer avec des modifications requiert une confirmation ; `confirmOnWipClose: false` désactive cette confirmation. `validateOnEnter` autorise Entrée à sauvegarder un formulaire valide. Seul le dialog supérieur traite Entrée et Échap ; les saisies multilignes, menus et autocomplete ouverts conservent leurs touches. `showJsonDataButton: true` active explicitement le bouton de diagnostic JSON.

## Extensions et validation avant rendu

Un champ `control` reçoit les inputs automatiques `label`, `control`, `formGroup`, `record`. `inputs` les complète, puis `fields: { inputName: 'form.path' }` les remplace par les valeurs mappées, recalculées à chaque modification. Seuls les inputs déclarés par le composant sont transmis.

Une card `kind: 'component'` reçoit le contexte courant et peut déclarer `input`; elle doit déclarer ses contrôles dans `fields` et réutiliser le formGroup fourni. Les contrôles et validateurs required/pattern/email/longueur/entier/bornes et plages temporelles existent avant le premier rendu de la card. Les validateurs métier ajoutés par `prepareFormGroup` restent installés. Les identifiants de recherche peuvent être des chaînes, `0` ou `false` ; une règle d’entité métier telle que `invalidEntity` appartient à l’hôte.

## Styles

Ajouter le fichier de panel `@eherve/angular-material-edit-entity-dialog/styles.css` aux styles globaux de l’application, avec les styles Material habituels. Il ne cible que `.edit-entity-dialog-panel`. Les styles des contrôles et du moteur sont embarqués ; aucun SCSS sésiO n’est requis.

Variables CSS publiques, héritées dans la page et à fournir aussi dans le conteneur overlay pour personnaliser les dialogs :

| Variable                                         | Valeur par défaut       |
| ------------------------------------------------ | ----------------------- |
| `--ngx-mat-edit-entity-dialog-primary`           | `#0f334d`               |
| `--ngx-mat-edit-entity-dialog-background`        | `#f4f6f8`               |
| `--ngx-mat-edit-entity-dialog-text`              | `#102f49`               |
| `--ngx-mat-edit-entity-dialog-muted`             | `#61718a`               |
| `--ngx-mat-edit-entity-dialog-border`            | `rgba(14, 43, 67, .12)` |
| `--ngx-mat-edit-entity-dialog-header-background` | `#0f334d`               |
| `--ngx-mat-edit-entity-dialog-header-text`       | `#fff`                  |

La démo `src/app/demos/edit-entity-dialog` utilise uniquement l’API npm publique. Elle présente chaque famille de champs, une création et une mise à jour en mémoire, une erreur suivie d’une nouvelle tentative, une connexion par instance, un contrôle et une card locaux, ainsi qu’une ouverture imbriquée.

## Journalisation des modifications

`EDIT_ENTITY_LOGGER` et son interface `EditEntityLogger` sont publics. Le moteur appelle
`debug(message, updates)` quand `formGroup.isUpdated` est vrai et que le contenu des
modifications change, indépendamment de la visibilité ou de l’état du bouton de mise
à jour. Les valeurs transmises sont des copies ; revenir à la valeur initiale ne
produit pas de log. La détection suit le debounce existant du formulaire.

Par défaut, le logger utilise `console.debug` en mode développement et reste silencieux
en production. Activer le niveau **Verbose** dans Chrome pour voir ces messages.
Pour utiliser le logger de l’application, fournir le token dans ses providers :

```ts
import { EDIT_ENTITY_LOGGER } from '@eherve/angular-material-edit-entity-dialog';

{ provide: EDIT_ENTITY_LOGGER, useExisting: ApplicationLogger }
```

`ApplicationLogger` doit implémenter `debug(message: string, updates: Readonly<Record<string, unknown>>): void`.
La politique d’activation du logger fourni est contrôlée par l’application.

## Inherited theme contract

Declare these optional CSS custom properties on an ancestor (including an overlay container when needed). The components do not declare common tokens on their hosts, so changing an ancestor updates existing instances without changing their inputs.

| Token | Standalone default / role |
| --- | --- |
| `--ngx-mat-extended-space-1` | `4px`, small spacing |
| `--ngx-mat-extended-space-2` | `8px`, compact surface padding and control spacing |
| `--ngx-mat-extended-space-3` | `16px`, group and default grid gaps |
| `--ngx-mat-extended-space-4` | `24px`, larger separation |
| `--ngx-mat-extended-space-5` | `32px`, reserved larger separation |
| `--ngx-mat-extended-radius` | `8px`, surface corners |
| `--ngx-mat-extended-surface` | Surface background, with the component's existing standalone color fallback |
| `--ngx-mat-extended-surface-hover` | Hover background |
| `--ngx-mat-extended-surface-selected` | Selected / highlighted background |
| `--ngx-mat-extended-border` | Surface separators and outlines |
| `--ngx-mat-extended-border-selected` | Selected outline |
| `--ngx-mat-extended-text` | Main text |
| `--ngx-mat-extended-muted` | Secondary text and icons |

Existing package-specific public color variables take precedence over the corresponding common role, which takes precedence over the standalone fallback. Action-specific colors keep their priority. Tokens only affect spacing and appearance: functional dimensions, circular controls and pill shapes remain unchanged. Material components inherit their theme; renderer headings use public Material typography roles with standalone fallbacks.

Omitting a section/card grid `gap` uses `var(--ngx-mat-extended-space-3, 16px)`. An explicit value such as `12px` is retained. Responsive grids read the computed column gap when calculating available tracks and item widths.

`--ngx-mat-edit-entity-dialog-background` controls the dialog container. Set `--ngx-mat-edit-entity-dialog-card-background` separately for cards (for example, white cards on a gray dialog). Cards fall back to the existing dialog background, then `--ngx-mat-extended-surface`, then white.
