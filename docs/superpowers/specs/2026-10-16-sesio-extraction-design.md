# Extraction des composants sésiO vers Angular Material Extended

Date : 16 octobre 2026. Statut : spécification validée ; implémentation en cours dans les deux branches et worktrees explicitement autorisés par l’utilisateur.

## Objectif et décisions convenues

Publier trois bibliothèques Angular réutilisables à partir de `section-tabs`, `display-dialog` et `edit-entity-dialog`. sésiO devient un consommateur de leurs API publiques, en conservant son comportement utilisateur et ses intégrations métier.

Décisions validées dans la conversation :

- Extraire le socle générique en premier ; conserver les extensions métier dans sésiO.
- Intégrer les contrôles configurables Angular Material directement dans `edit-entity-dialog`, sans package de contrôles supplémentaire.
- Fournir la synchronisation des sections par un handler injectable, implémenté par sésiO avec son `NavigationService`.
- Préparer les specs et le plan maintenant ; confier ultérieurement les implémentations à des subagents avec un modèle adapté à la tâche.

Les signatures, le découpage opérationnel et les choix de première version ci-dessous ont été validés par l’utilisateur le 16 octobre 2026. Ce document n'autorise ni publication, ni commit, ni création de branche/worktree.

## Documents de référence

- [Sections et handler de sélection](2026-10-16-section-tabs-design.md)
- [Dialog de consultation](2026-10-16-display-dialog-design.md)
- [Dialog d’édition et contrôles](2026-10-16-edit-entity-dialog-design.md)
- [Plan d’implémentation et délégation](../plans/2026-10-16-sesio-extraction.md)

Dans ces documents, `L/` désigne la racine du dépôt `angular-material-extended` et `S/` celle de `sesio__engine`. Les chemins sont relatifs à ces racines pour rester valables dans les futurs worktrees.

## État source observé

| Dépôt | Chemin local de référence | Révision observée | État |
|---|---|---|---|
| L | `/Users/eherve/Git/angular-material-extended` | `6a6d136`, branche `main` | Propre avant création de ces documents |
| S | `/Users/eherve/Git/Sesio/sesio__engine` | `4535edd9f`, branche `edge` | Modifications préexistantes Amplify, Sentry et document de stratégie de tests |

Ces révisions sont un repère d’analyse, pas une instruction de checkout. Relire l’état courant avant implémentation et signaler une divergence affectant les contrats.

Les deux manifestes utilisent Angular 22.2 et TypeScript 6.0. Les bibliothèques existantes `datatable` et `tooltip` utilisent `ng-packagr`, une API publique et la compilation partielle en production. La démo L est configurée sur le port 4242 ; la webapp sésiO est sur 4200.

Les dossiers sources contiennent respectivement 11, 7 et 41 fichiers TypeScript pour sections, consultation et édition lors de l’inventaire. Leur taille ne représente pas le périmètre final : plusieurs contrôles et utilitaires nécessaires sont ailleurs.

## Architecture cible

| Dossier L | Projet Angular | Package proposé | Version initiale proposée |
|---|---|---|---|
| `projects/section-tabs` | `NgxMatSectionTabs` | `@eherve/angular-material-section-tabs` | `22.0.0` |
| `projects/display-dialog` | `NgxMatDisplayDialog` | `@eherve/angular-material-display-dialog` | `22.0.0` |
| `projects/edit-entity-dialog` | `NgxMatEditEntityDialog` | `@eherve/angular-material-edit-entity-dialog` | `22.0.0` |

```text
sésiO : services d’entités, permissions, médias, Noos, navigation
  ├── angular-material-edit-entity-dialog ──┐
  ├── angular-material-display-dialog ─────┼── angular-material-section-tabs
  └── angular-material-section-tabs ───────┘
```

- Aucun import de S dans L, même uniquement pour un type.
- Aucun import entre les deux packages de dialogs.
- Aucun quatrième package `core` ou `controls` pour cette première extraction.
- Les petites implémentations privées de confirmation ou de loader peuvent exister dans chaque dialog. Ne pas les placer dans `section-tabs` pour créer artificiellement un socle commun.
- Les imports entre bibliothèques passent par les noms npm et leurs exports publics, jamais par leurs sources ou par des chemins `dist/...` dans le code consommateur.
- Conserver les noms de classes, les sélecteurs publics existants et les formes génériques des configurations lorsqu’ils ne dépendent pas de sésiO. Aucun double sélecteur ou alias de transition n’est nécessaire. Les composants privés ajoutés peuvent utiliser le préfixe `ngx-mat`.
- Conserver l’intégration NgModule existante ; les nouveaux composants privés peuvent être standalone. Une conversion globale vers les signals ou standalone est hors périmètre.

## Packaging et dépendances

Chaque projet possède `package.json`, `ng-package.json`, `src/public-api.ts`, `tsconfig.lib.json`, `tsconfig.lib.prod.json`, `tsconfig.spec.json` et `README.md`. Le build écrit dans `dist/<dossier>`. Les noms npm et versions sont des choix de conception ; leur disponibilité et les droits de publication devront être vérifiés avant publication.

- `peerDependencies` Angular/Material/CDK nécessaires : `^22.0.0` ; RxJS lorsqu’utilisé : `^7.8.0`.
- Les dialogs déclarent `@eherve/angular-material-section-tabs: ^22.0.0` en peer dependency.
- `tslib: ^2.3.0` reste une dépendance d’exécution, conformément aux projets existants.
- `@angular/router` est absent des trois bibliothèques. La navigation reste dans l’hôte.
- Pour l’édition, conserver initialement les dépendances génériques réellement utilisées pour dates/datetime : Moment, Day.js, adaptateurs Material/Ng-Matero, `@ng-matero/extensions`. Ne pas remplacer les widgets pendant l’extraction. Déclarer leurs plages à partir des manifestes source observés (`moment ^2.30.1`, `dayjs ^1.11.20`, extensions `^22.1.1`, adaptateur extensions `^22.0.0`, adaptateur Material `^22.0.0`).
- `lodash-es ^4.17.21` et `subsink ^1.0.2` peuvent être conservés là où ils servent réellement. Ne pas recopier les dépendances complètes de sésiO. Les types de compilation nécessaires sont en devDependencies.
- Remplacer le simple scroll de `ngx-scrollbar` par CSS dans les nouveaux packages ; conserver les comportements de défilement et les dimensions.
- Pour la pagination des recherches, utiliser un observateur natif nettoyé à la destruction plutôt que rendre `ngx-intersection-observer` obligatoire pour le moteur d’édition.
- Quill, AWS, Noos, Mapbox, modèles sésiO et `@eherve/model-mapper` sont absents des packages et de leurs déclarations publiques.
- Build de production avec `compilationMode: partial`. `sideEffects: false` seulement si aucun fichier n’installe d’effet global ; les styles embarqués de composants ne nécessitent pas un bootstrap applicatif.

Les règles de distribution suivent les [recommandations officielles Angular](https://angular.dev/tools/libraries/creating-libraries) et le [format des packages Angular](https://angular.dev/tools/libraries/angular-package-format).

## Styles, langues et ressources

- Les bibliothèques doivent s’afficher sans le SCSS global sésiO, ses polices ou ses icônes SVG privées.
- Définir des variables publiques à valeurs par défaut : `--ngx-mat-section-tabs-primary`, `--ngx-mat-section-tabs-background`, `--ngx-mat-section-tabs-text` ; pour chaque dialog, `--ngx-mat-<display-dialog|edit-entity-dialog>-primary`, `-background`, `-text`, `-muted`, `-border`, `-header-background`, `-header-text`.
- Mapper les anciennes variables `--app-*` uniquement dans `S/apps/webapp/src/styles.scss`, à la racine et au niveau de l’overlay si nécessaire. Ne pas laisser de référence `--app-*` dans les bibliothèques.
- Les styles d’overlay nécessaires sont livrés sous `@eherve/angular-material-<dialog>/styles.css`, déclarés dans les assets et exports. Le fichier contient uniquement les classes de panel du package ; aucun style global générique sur tous les dialogs Material.
- Garder les libellés français existants par défaut et les options de libellés déjà publiques. Ajouter un service injectable `SectionTabsIntl`, `DisplayDialogIntl` ou `EditEntityDialogIntl` avec un `changes: Subject<void>` et un dictionnaire `messages` dont les clés correspondent à tous les textes fixes de la bibliothèque.
- Les dictionnaires sont typés sans index libre. Ils sont dérivés des littéraux effectivement conservés pendant chaque extraction, documentés dans le README du package et utilisés pour remplacer tous les `$localize` internes. La bibliothèque ne nécessite donc pas le global `$localize` pour fonctionner ; sésiO peut fournir des traductions `$localize` dans ses propres providers.
- Préserver les labels ARIA, le focus, l’usage clavier et les annonces d’erreur des contrôles Material.

## Intégration sésiO commune aux dialogs

Les implémentations métier restent des compositions utilisant le moteur npm, pas des copies du moteur. Créer dans S un répertoire `apps/webapp/src/app/_integrations/angular-material-extended/` :

| Fichier | Responsabilité |
|---|---|
| `sesio-section-selection-handler.service.ts` | Handler des sections, navigation initiale et événements Router |
| `sesio-dialog-query-binding.ts` | Binding par instance pour l’identifiant de dialog dans l’URL |
| `sesio-edit-dialog-integration.service.ts` | Connexion du moteur d’édition aux services de confirmation, notification, JSON et Noos |
| `sesio-display-dialog-integration.service.ts` | Connexion du moteur de consultation aux services de confirmation, JSON et Noos |
| `sesio-edit-access.ts` | Conversion des règles workspace/module en conditions `visible` et permission de verrouillage de date |
| `extensions/noos-dialog-action/sesio-noos-dialog-action.component.ts` | Action locale avec inputs `registration?: VisualContextRegistration` et `visible: boolean` ; réutilise `NoosContextActionComponent` et appelle `NoosConversationWindowService.openContext(registration)` |
| `extensions/` | Composants de médias, localisation, RTE et action tree conservés côté application |

La connexion de chaque dialog est créée par une factory `connect`, spécifiée dans les documents des packages. Une connexion possède son propre état, reçoit le record initial puis les changements, et libère ses ressources à la destruction. Elle gère dans S :

1. la présence du bouton JSON selon les droits de session ;
2. l’enregistrement, la mise à jour et le retrait du contexte visuel ;
3. le bouton Noos via une action composant ;
4. la liaison du record à un query parameter.

Les actions contextuelles sont retournées par chaque connexion via sa propriété `actions`. Leurs factories d’inputs capturent uniquement l’état de cette connexion. Pour Noos, le composant local n’affiche le bouton que si `visible` est vrai et une registration existe ; les inputs sont réévalués après `recordChanged`. Ne jamais partager un handle de registration entre deux ouvertures, même si elles réutilisent la même configuration.

### Contrat du binding URL des dialogs dans S

```ts
export interface SesioDialogQueryBinding {
  update(recordId: string | undefined): void;
  destroy(): void;
}

export function createSesioDialogQueryBinding(
  navigation: NavigationService,
  options: { name: string; restoreOnClose?: boolean },
  reportError: (error: unknown) => void,
): SesioDialogQueryBinding;
```

- Aucune écriture sans `_id` chaîne non vide.
- À la première écriture, mémoriser la valeur précédente ; si elle est déjà égale à l’identifiant, mémoriser `null`, comme actuellement.
- Mettre à jour avec `NavigationService.updateQueryParameters(..., 'merge')`, sans imposer `replaceUrl: true` : c’est distinct du comportement des sections.
- À la fermeture, restaurer seulement si `restoreOnClose !== false` et si la valeur courante est toujours celle écrite par cette instance.
- Sérialiser les écritures d’une instance, y compris la restauration, et ne pas laisser une Promise tardive réécrire l’URL après la fermeture. Une erreur est signalée via `reportError`, sans rejet non géré.
- Préserver les autres paramètres, le fragment et les outlets. Les dialogs imbriqués n’écrasent pas l’état de l’autre instance lors de leur fermeture normale dans l’ordre inverse d’ouverture.
- Le binding n’ouvre jamais un dialog depuis une URL ; les appelants existants gardent cette responsabilité.

### Extensions conservées

| Source S actuelle | Destination S proposée |
|---|---|
| `edit-entity-dialog/tabs/media-tab/` | `_integrations/angular-material-extended/extensions/edit-media-tab/` |
| `edit-entity-dialog/cards/location-section-card/` | `.../extensions/edit-location-card/` |
| `edit-entity-dialog/cards/rte-section-card/` | `.../extensions/edit-rte-card/` |
| `edit-entity-dialog/cards/action-select-tree-section-card/` | `.../extensions/edit-action-tree-card/` |
| `edit-entity-dialog/fields/edit-entity-rte-field/` | `.../extensions/edit-rte-field/` adapté en composant `control` |
| `display-dialog/display-dialog-media-tab/` | `.../extensions/display-media-tab/` |
| `display-dialog/display-dialog-photo-gallery/` | `.../extensions/display-photo-gallery/` |
| `display-dialog/display-dialog-location-card/` | `.../extensions/display-location-card/` |

Dans ce tableau, les sources sont sous `apps/webapp/src/app/_components/` et les destinations sous `apps/webapp/src/app/`. Les classes et sélecteurs des extensions sont conservés ; seuls leurs imports du moteur changent. Pas de réexport depuis les anciens dossiers supprimés.

## Migration et validation

Livrer d’abord les packages dans L et une démo autonome. Valider leurs archives npm dans un consommateur temporaire sans alias vers les sources. Intégrer ensuite sésiO : sections, consultation, édition. Les consommateurs existants restent sur l’ancienne implémentation jusqu’à la bascule complète de leur lot ; ne pas livrer deux moteurs concurrents du même lot.

Pour chaque lot sésiO :

1. Recenser imports statiques, imports dynamiques, sélecteurs, déclarations NgModule, composants personnalisés et modèles de génération.
2. Migrer les usages du lot et les intégrations correspondantes dans le même changement.
3. Conserver les extensions métier et les contrôles anciens encore utilisés hors du moteur. Leur présence n’est pas une raison de copier leur moteur de dialog.
4. Supprimer uniquement les fichiers dont l’absence de consommateurs est démontrée ; aucun ancien barrel de compatibilité.
5. Vérifier TypeScript, templates Angular et tests ciblés, puis les parcours réels autorisés.

Les tests doivent couvrir comportement et contrats, pas uniquement les exports. Les specs de régression existantes sur valeurs par défaut, actions de labels et `single-card` sont transférées et conservées. Les cas supplémentaires sont détaillés dans chaque spec.

La validation navigateur sésiO utilise Chrome DevTools, `list_pages`, sélection de l’origine exacte `http://localhost:4200`, puis conservation de cette page. La démo L utilise une page existante sur `http://localhost:4242` seulement après identification explicite ; ne jamais la substituer à sésiO ou ouvrir un onglet sans nécessité. Ne pas modifier de données métier réelles pour une simple vérification : utiliser un fixture ou un environnement de test convenu.

## Critères de livraison

- Chaque package se construit et s’utilise depuis son archive npm sans source sésiO ou source d’une autre bibliothèque.
- La démo couvre sections, consultation, création/édition et composants personnalisés avec de fausses données.
- Le handler est optionnel ; aucun Router ou service sésiO n’est nécessaire pour rendre les composants.
- Les contrôles configurables sont intégrés au moteur d’édition et préservent les valeurs, validations et états conditionnels.
- Dans sésiO, URL, permissions, Noos, médias, résultat de fermeture et rafraîchissement des appelants restent fonctionnels.
- Les docs publiques décrivent exactement les signatures exportées ; les anciens README sésiO sont remplacés par des liens vers les packages et une documentation locale des intégrations.
- Les vérifications exécutées et les limitations sont rapportées séparément. Une spec écrite n’est pas une preuve que les tests d’implémentation passent.

## Limites d’exécution

L’utilisateur a autorisé les deux branches/worktrees dédiés et l’implémentation par subagents après validation documentaire. Il n’a autorisé ni commit, ni push, ni merge, ni rebase, ni publication, ni déploiement. Préserver les modifications non liées dans les checkouts d’origine.
