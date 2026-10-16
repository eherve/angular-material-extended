# Extraction sésiO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The user selected subagent execution for a later phase; do not start implementation while preparing these documents.

**Goal:** Livrer trois packages Angular génériques et migrer leurs consommateurs sésiO sans perte des comportements existants.

**Architecture:** Sections fournit navigation locale et rendu déclaratif, avec un handler injectable pour les sélections externes. Les deux dialogs dépendent de sections ; l’édition intègre ses contrôles configurables. L’application sésiO conserve navigation, droits, Noos, RTE, médias et localisation grâce à des connexions par instance et composants personnalisés.

**Tech Stack:** Angular/Material/CDK 22, TypeScript 6, RxJS 7.8, ng-packagr, Jasmine/Karma, SCSS ; adaptateurs Moment/Ng-Matero pour les champs concernés.

**Spec:** [Cadrage commun](../specs/2026-10-16-sesio-extraction-design.md), [sections](../specs/2026-10-16-section-tabs-design.md), [consultation](../specs/2026-10-16-display-dialog-design.md), [édition](../specs/2026-10-16-edit-entity-dialog-design.md).

## Global Constraints

- Les chemins `L/` et `S/` désignent les racines des deux dépôts définies dans la spec commune.
- Packages `@eherve/angular-material-section-tabs`, `@eherve/angular-material-display-dialog`, `@eherve/angular-material-edit-entity-dialog` ; version initiale proposée `22.0.0`.
- Projets `NgxMatSectionTabs`, `NgxMatDisplayDialog`, `NgxMatEditEntityDialog` ; sortie `dist/section-tabs`, `dist/display-dialog`, `dist/edit-entity-dialog`.
- Peer dependencies Angular/Material/CDK nécessaires `^22.0.0`, RxJS `^7.8.0`, sections pour les dialogs `^22.0.0` ; `tslib ^2.3.0` en dependency. Les dépendances additionnelles d’édition sont limitées à la liste de la spec commune et aux usages conservés.
- Aucune dépendance à S, au Router, à AWS, à Noos, à Quill, à Mapbox ou à model-mapper dans les packages.
- Aucun import entre les deux packages de dialogs ; aucun package supplémentaire core/controls.
- Conserver classes, sélecteurs publics, contrats de résultats et unités de valeur source, sauf changements explicités dans les specs.
- Build production partiel ; imports consommateurs par noms npm ; contrôles privés, contrats publics typés.
- Noos, droits, URL des dialogs, RTE et médias sont intégrés dans S et restent fonctionnels.
- Pas de commit, push, merge, rebase, publication, déploiement, création de branche ou worktree sans autorisation explicite. Aucun agent ne peut déléguer ces autorisations à un autre.
- Préserver les modifications non liées de S. Ne pas migrer la mobileapp ni les anciennes utilisations externes des contrôles sans nécessité démontrée.
- La source actuelle prévaut sur l’inventaire historique ; une divergence touchant un contrat remonte à l’orchestrateur avant modification de ce contrat.

## Review Focus

1. Navigation tardive, clés multiples et fermeture pendant une écriture : aucune boucle, aucun paramètre perdu ou ressuscité. Tests T1 et T9.
2. Réponses asynchrones arrivant dans le désordre : dernier chargement/recherche accepté uniquement, sans perdre une sélection existante. Tests T3 et T6.
3. Formulaire contenant des sections jamais visitées, des defaults et des valeurs falsy : validation eager, pas de dirty artificiel, payload exact. Tests T4, T5, T8.
4. Permissions déplacées et composants métier : pas d’accès élargi, contexte Noos correctement libéré, RTE et médias toujours branchés. Tests T7, T9, T10, T11.
5. Package réel hors du monorepo : exports, peer dependencies, styles d’overlay et absence de source sésiO. Vérification T12.

## Préparation avant exécution

- [x] Documents relus et validés par l’utilisateur le 16 octobre 2026. L’exécution par subagents est choisie ; ne pas redemander ce choix.
- [ ] Vérifier branches, status, worktrees et instructions AGENTS des deux dépôts. Proposer `codex/extract-generic-dialog-libraries` dans L et `codex/consume-generic-dialog-libraries` dans S. Ne créer ni basculer sans accord de l’utilisateur ; les noms restent des propositions.
- [ ] Vérifier l’accès en écriture à S ou à son worktree avant de lui assigner un agent. Le workspace initial de cette conversation autorise l’écriture dans L, pas dans S.
- [ ] Vérifier l’existence des node_modules et le runtime Node requis par les manifestes installés. L’orchestrateur gère les installations nécessaires ; ne lancer ni mise à jour globale ni publication.
- [ ] Dans S, charger `sesio-patch-delivery` si le workflow applicable est disponible et requis ; s’il est explicitement requis mais introuvable, le signaler avant livraison. Lire les README complets des dialogs avant leurs migrations.
- [ ] Produire l’inventaire de migration à `L/docs/migrations/sesio-component-consumers.md` : chemin, symbole/sélecteur, package ou extension cible, lot, statut. Chercher imports statiques et dynamiques dans `S/apps/`, puis usages des sélecteurs et templates de génération dans `S/.agents/` et `S/scripts/` ; élargir seulement sur référence concrète.

## Ordre et ownership des agents

```text
T1 sections navigation → T2 sections rendu
                           ├── T3 display
                           └── T4 édition contrats/formulaire
                                  ├── T5 contrôles simples
                                  ├── T6 recherche/liste
                                  └── T7 dates/durée
                               T5 + T6 + T7 → T8 édition orchestration
T3 + T8 → T9 intégrations S → T10 bascule sections/display → T11 bascule édition
T10 + T11 → T12 validation distribution et livraison
```

Les packages sont d’abord testables dans L. La bascule de S est séquentielle pour limiter la coexistence temporaire de composants portant les mêmes sélecteurs. Ne jamais importer l’ancien et le nouveau module de sections dans le même scope Angular ; T10 remplace aussi les imports de sections de l’ancien moteur d’édition avant sa propre extraction.

L’orchestrateur possède exclusivement `L/angular.json`, `L/package.json`, les lockfiles, les tsconfigs racine, `L/src/app/app.module.ts`, le routing et les autres fichiers communs de la démo. Les agents lui remettent leurs besoins structurés ; il applique ces changements en série. Dans S, un seul agent écrit à la fois pendant la migration.

Modèles proposés parmi ceux exposés par l’outil de cette session :

| Travail | Modèle | Effort |
|---|---|---|
| T2, T5, T7 : extraction bornée avec contrats et tests fixés | `gpt-6-luna` | `high` |
| T1, T3, T4, T6, T8, T9, T10, T11 : état asynchrone, contrats ou intégration | `gpt-6.1-sol` | `medium` |
| T12 : emballage, documentation et vérifications prescrites | `gpt-6-luna` | `high` |
| Revue indépendante d’un lot | `gpt-6.1-sol` | `high` |

Ce routage est une proposition de répartition, pas un benchmark ni une estimation de prix. Vérifier l’allowlist au lancement. Toujours passer modèle **et** effort avec `fork_turns: "none"`, un contexte limité et des chemins explicites. La [documentation officielle des subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) décrit leur configuration ; les capacités exposées par l’outil de la session font foi pour l’exécution.

Limiter à deux implémenteurs simultanés pour garder un slot de revue avec l’orchestrateur. Réutiliser l’agent auteur pour les corrections. Après deux tentatives sans progrès sur la même erreur, arrêter les essais et faire analyser le blocage par l’orchestrateur ; ne pas modifier silencieusement l’API ou augmenter tous les modèles.

Chaque tâche reçoit une revue de conformité et de qualité avant que ses dépendants commencent. Une même revue ciblée peut couvrir ces deux aspects si le workflow applicable le permet. La revue finale contrôle les frontières entre packages et S.

## Commandes et conventions de validation

L’orchestrateur ajoute, au moment de créer chaque bibliothèque :

| Script | Commande |
|---|---|
| `build:section-tabs` | `ng build NgxMatSectionTabs` |
| `test:section-tabs` | `ng test NgxMatSectionTabs --watch=false --browsers=ChromeHeadless` |
| `build:display-dialog` | `ng build NgxMatDisplayDialog` |
| `test:display-dialog` | `ng test NgxMatDisplayDialog --watch=false --browsers=ChromeHeadless` |
| `build:edit-entity-dialog` | `ng build NgxMatEditEntityDialog` |
| `test:edit-entity-dialog` | `ng test NgxMatEditEntityDialog --watch=false --browsers=ChromeHeadless` |

Pour une tâche qui ajoute une seule spec, ajouter `-- --include='projects/<package>/src/lib/<fichier>.spec.ts'` au script npm correspondant. Pour plusieurs specs, fournir plusieurs `--include`, ou le glob de leur répertoire commun. Une sortie avec zéro test n’est pas un succès.

Écrire les tests comportementaux avant le code de L et constater l’échec attendu ; l’échec d’import initial prouve seulement l’absence de l’API, pas la validité du scénario. Une fois le composant présent, les assertions doivent exercer le comportement. Les agents exécutent leurs tests ciblés ; l’orchestrateur lance le build du package après intégration du lot, sans répéter une vérification inchangée.

Pour S, suivre la phase finale de validation prescrite par ses AGENTS : `npx tsc --noEmit -p apps/webapp/tsconfig.app.json`, puis `npx ngc -p apps/webapp/tsconfig.app.json --noEmit` et les specs ciblées `npx ng test sesio --watch=false --browsers=ChromeHeadless --include='<chemin-spec>'` quand le runner est disponible. Si Karma ne peut pas ouvrir son port pour une raison d’environnement, ne pas escalader ni déclarer les tests passés ; rapporter les contrôles de compilation et les limites.

## T1 — Bibliothèque sections et handler

**Dépendances :** préparation. **Ownership :** `L/projects/section-tabs/`, hors renderer déclaratif traité en T2.

**Files :** créer les manifestes/configurations de bibliothèque décrits dans la spec commune, `src/public-api.ts`, `src/lib/section-selection-handler.ts`, `section-tabs.component.{ts,html,scss}`, `section-tab.component.ts`, `section-tabs.module.ts`, les directives de projection et `section-tabs.component.spec.ts`. L’orchestrateur configure les scripts et le mapping npm → `dist/section-tabs` dans `L/tsconfig.json`.

**Interfaces :** produit `SectionSelectionHandler.observe(key): Observable<string|null>`, `select(key,value): void|Promise<void>`, `SECTION_SELECTION_HANDLER` et les composants/directives publics conservés. Consomme Angular/Material/RxJS uniquement.

- [ ] Écrire `rendersWithoutRouter`, `selectsExternalValueWithoutWriting`, `emitsOneUserSelection`, `retriesUnavailableExternalSection`, `unsubscribesOnKeyChange`, `keepsGroupsIndependent`, `reportsHandlerFailure` : assertions exactes de la table de la spec sections.
- [ ] Exécuter les tests ciblés et conserver la cause attendue de l’échec.
- [ ] Extraire navigation locale et projection ; remplacer les injections sésiO/Router par le token optionnel. Préserver styles et ARIA.
- [ ] Exécuter les tests, puis `npm run build:section-tabs` après intégration de la configuration racine. Attendu : specs réellement exécutées et build sans import S/Router.
- [ ] Fournir README minimal d’installation et handler, puis passer la revue avant T2. Aucun commit automatique.

## T2 — Rendu déclaratif des sections et démo

**Files :** `L/projects/section-tabs/src/lib/section-tabs-display/section-tabs-display.component.{ts,html,scss,spec.ts}`, `section-tabs-display.types.ts`, `directives/section-tabs-display-responsive-grid.directive.ts`, helpers privés nécessaires, `section-tabs.intl.ts`, module/API/README du package ; créer `L/src/app/demos/section-tabs/section-tabs-demo.component.{ts,html,scss}`.

**Interfaces :** consomme T1 ; produit tous les types de configuration `SectionTabsDisplay*` et le composant déclaratif utilisés par T3 et T8. Extraire les types actuels sans modification de signatures autre que retrait d’un import applicatif.

- [ ] Transférer les trois tests source (label action, single-card, mode standard), ajouter `rendersFalsyValues`, `rendersCustomCardInputs` et `forwardsSelectionKey`.
- [ ] Vérifier leur échec sur le renderer absent, puis adapter source, pipes, CSS et Intl selon la spec.
- [ ] Créer les scénarios démo local et handler mémoire ; l’orchestrateur les raccorde à la navigation de démo existante.
- [ ] Exécuter `npm run test:section-tabs`, `npm run build:section-tabs`. Inspecter les déclarations publiques pour absence de chemins applicatifs.
- [ ] Faire relire les types et styles avant de démarrer T3/T4 ; ces contrats deviennent la référence commune.

## T3 — Bibliothèque de consultation

**Files :** créer `L/projects/display-dialog/` avec sa configuration ; `src/lib/display-dialog.{component.ts,component.html,component.scss,module.ts,service.ts,types.ts}`, `display-dialog-host.ts`, `display-dialog.intl.ts`, `internal/confirmation-dialog/`, `internal/json-dialog/`, `styles.css`, `display-dialog.component.spec.ts`, `display-dialog.service.spec.ts`, API/README ; créer `L/src/app/demos/display-dialog/display-dialog-demo.component.{ts,html,scss}`.

**Interfaces :** consomme les exports sections T2 ; produit `DisplayDialogService.open`, `DisplayDialogData`, `DisplayDialogConnection`, union d’actions composant/bouton et `DISPLAY_DIALOG_HOST`, exactement selon la spec consultation.

- [ ] Écrire `ignoresStaleLoader`, `doesNotNotifyAfterDestroy`, `refreshesRecordAndActions`, `cleansEachConnectionOnce`, `cancelsConfirmedAction`, `recoversFromRejectedAction`, `preservesCloseResult` et `prefersExplicitNestedDimensions`.
- [ ] Constater l’échec ciblé, puis extraire le moteur sans médias, session, URL ni Noos. Ajouter connexion, action composant et host par défaut. Reporter les valeurs de dimensions source dans les assertions numériques/chaînes de la spec du service.
- [ ] Ajouter les styles d’overlay distribués, les messages Intl et les scénarios de démo. Vérifier qu’un provider host sésiO reste optionnel.
- [ ] Exécuter `npm run test:display-dialog`, `npm run build:display-dialog` après build sections si ses exports ont changé.
- [ ] Relire la compatibilité de `open`, des actions et du résultat ; autoriser T9 seulement après T8 également.

## T4 — Contrats et cœur du formulaire d’édition

**Files :** créer `L/projects/edit-entity-dialog/` et sa configuration ; `src/lib/edit-entity-dialog.types.ts`, `fields/edit-entity-field.types.ts`, `fields/edit-form-base-field.ts`, `classes/edit-entity-form-group.ts`, `services/edit-entity-{form-builder,conditional-state,submit-value,render}.service.ts` et specs correspondantes ; API publique initiale pour les contrats.

**Interfaces :** consomme types sections T2 si utilisés ; produit les types de champs, `EditEntityFormGroup`, les services internes et contrats connexion/host utilisés par T5–T8. Ne pas exporter les services internes par commodité. Ajouter `edit-entity-dialog-host.ts` avec le token et les interfaces ; son implémentation par défaut vient de T8.

- [ ] Transférer les tests builder/renderer existants et écrire `buildsUnvisitedComponentCardControls`, `computesNestedUpdateOnly`, `keepsDefaultsPristine`, `preservesZeroAndFalse`, `doesNotSubmitNonEditableFields`.
- [ ] Constater l’échec, puis extraire types et services ; supprimer modèles Archived, logger applicatif, access workspace/module. Déplacer les helpers de chemins nécessaires sans importer les gros helpers S.
- [ ] Définir `EditEntityArchiveState`, `canToggleLock`, connexion et types de recherche conformément à la spec ; retirer `rte` du kind intégré et `access`, `visualContext`, `queryParameter` du contrat npm.
- [ ] Exécuter les specs des services/classes ciblées et `npm run build:edit-entity-dialog` sur ce cœur exportable. Ne pas ajouter des composants fictifs pour faire croire au moteur complet.
- [ ] Revue des contrats avant T5/T6/T7. L’orchestrateur garantit que ces tâches n’éditent plus ce fichier de types commun.

## T5 — Contrôles simples

**Files :** `L/projects/edit-entity-dialog/src/lib/fields/edit-entity-{text,textarea,number,select,checkbox,radio,chips,slider,display,control}-field/`, `controls/{text,textarea,number,select}/` et specs au plus près des comportements. Les renderers metadata/separator appartiennent à T8.

**Interfaces :** consomme les types fixés en T4 et les inputs des fields source `record`, `formGroup`, `field` ; produit les composants privés correspondants pour le renderer T8. Les sélecteurs internes existants sont conservés ou adaptés dans le même sous-arbre, sans exposer de nouveaux exports publics.

- [ ] Écrire `writesWithoutFeedback`, `propagatesDisabledAndTouched`, `validatesRequiredAndBounds`, `updatesObservableOptions`, `keepsDisabledOptionsUnselectable`, `mapsDeclaredCustomInputs`.
- [ ] Reprendre les contrôles source nécessaires dans le package et retirer services, pipes et flex directives applicatifs. Utiliser Material et CSS local pour la disposition.
- [ ] Exécuter les specs de ces répertoires seulement ; rapporter le nombre de tests et les fichiers changés.
- [ ] Fournir à T8 la liste exacte des composants privés à déclarer/importer, sans modifier son module, son renderer ou les types communs.

## T6 — Autocomplete et liste triable

**Files :** `L/projects/edit-entity-dialog/src/lib/fields/edit-entity-{autocomplete,sortable-list}-field/`, `controls/{autocomplete,sortable-list}/`, `internal/search/` et specs.

**Interfaces :** consomme `AutocompleteFormFieldService<TRecord,TValue>` défini en T4 ; produit les deux fields et leurs contrôles privés. Le backend, la recherche d’entités et les permissions restent des callbacks fournis par S.

- [ ] Écrire `keepsNewestSearchResults` avec deux Promises résolues à l’envers, `loadsNextPageWithoutLosingSelection`, `recoversAfterSearchFailure`, `deduplicatesEqualEntityIds`, `persistsReorderedValue`, `doesNotReorderDisabledControl`.
- [ ] Extraire les comportements actuels de recherche, sélection, groupes et pagination. Ajouter l’invalidation des réponses obsolètes et le nettoyage de l’observateur sans dépendance à S.
- [ ] Tester avec objets de même `_id` mais références différentes ; affirmer une seule occurrence dans la valeur. Tester ordre final `[c,a,b]` après déplacement du dernier élément en premier.
- [ ] Exécuter les specs ciblées. Fournir à T8 imports et composants ; aucune modification de package.json ou des contrats par cet agent.

## T7 — Durée, dates et heures

**Files :** `L/projects/edit-entity-dialog/src/lib/fields/edit-entity-{duration,date,date-range,datetime,datetime-range,time,time-range}-field/`, `controls/duration/`, `internal/date/` et specs.

**Interfaces :** consomme contrats T4, notamment `canToggleLock`. Produit les fields génériques, sans SessionData. Les providers de locale/adaptateurs sont configurés par l’application hôte.

- [ ] Écrire `keepsDurationInMinutes` (`90` en entrée/sortie), `clearsDurationToNull`, `updatesLinkedDateBounds`, `normalizesIncludedDate`, `deniesLockToggleByDefault`, `allowsExplicitLockPermission`.
- [ ] Adapter les widgets actuels et les fonctions de conversion nécessaires ; retirer les helpers sésiO et les appels directs à SessionData. Ne pas remplacer Ng-Matero ou changer les valeurs de date.
- [ ] Tester la valeur verrouillée avec permission fausse : champ désactivé, pas de bouton autorisé ; permission vraie : modification du booléen du formulaire sans recréer le contrôle.
- [ ] Exécuter les specs ciblées ; fournir les besoins en adaptateurs à l’orchestrateur et la liste de composants à T8.

## T8 — Moteur d’édition, dialog et démo

**Files :** `L/projects/edit-entity-dialog/src/lib/components/{edit-entity-component,edit-entity-dialog,edit-entity-field-renderer}/`, `edit-entity-dialog.{service.ts,module.ts}`, `edit-entity-dialog.intl.ts`, `directives/edit-entity-responsive-grid.directive.ts`, implémentation host privée, `styles.css`, API/README ; `L/src/app/demos/edit-entity-dialog/edit-entity-dialog-demo.component.{ts,html,scss}`.

**Interfaces :** assemble T4–T7, consomme T2 ; produit le moteur complet, `EditEntityDialogService.open`, `EditEntityComponent` embarqué, résultat et connexion de la spec. `open` reprend la signature source et son `EditEntityDialogOpenConfig`, sans refonte du service d’ouverture.

- [ ] Écrire `keepsDirtyOnFailedUpdate`, `acceptsUpdatedRecordFromServer`, `preservesArchiveMetadata`, `notifiesConnectionOnceAfterSave`, `preventsUnconfirmedClose`, `handlesKeysOnlyForTopDialog`, `doesNotSubmitWhenAutocompleteOwnsEnter`.
- [ ] Assembler les composants et les services, préserver les payloads et résultats. Remplacer les services applicatifs par host/connexion, rendre les messages et styles autonomes.
- [ ] Construire une démo complète en mémoire et deux extensions factices (`control` et card), sans Quill, média ou service sésiO.
- [ ] Exécuter `npm run test:edit-entity-dialog` puis `npm run build:edit-entity-dialog`. L’orchestrateur exécute `npm run test:demo` et `npm run build:demo` une fois les trois démos raccordées.
- [ ] Revue du résultat de fermeture, de la validation eager et de l’absence de couplage avant T9.

## T9 — Intégrations sésiO et préparation des extensions

**Files :** créer `S/apps/webapp/src/app/_integrations/angular-material-extended/`, les cinq fichiers/services et l’action Noos locale listés dans la spec commune, avec specs. Préparer le mapping des extensions ; leurs déplacements effectifs appartiennent à T10/T11 pour ne pas casser les anciens modules encore utilisés. Ajouter les providers au bootstrap/NgModule racine réel après inspection du fichier courant ; modifier `S/apps/webapp/src/styles.scss` pour le mapping des variables et les styles de panel.

**Interfaces :** consomme les trois packages construits ; produit `SesioSectionSelectionHandler`, `createSesioDialogQueryBinding`, `SesioDisplayDialogIntegrationService.decorate`, `SesioEditDialogIntegrationService.decorate` et l’action Noos locale. Les méthodes `decorate` ont les signatures et options des specs des dialogs.

- [ ] Dans l’inventaire de migration, relever les usages de `access`, `lockedProperty`, `visualContext`, `queryParameter`, `kind: 'rte'` et des extensions. Renseigner chaque destination avant suppression.
- [ ] Écrire les specs de handlers/binding : initialisation, deux groupes simultanés, erreur puis reprise, restauration conditionnelle, changement externe du paramètre, dialog imbriqué, fermeture pendant écriture asynchrone.
- [ ] Implémenter les integrations avec `NavigationService`, Router, VisualContext/Noos, confirmations, notifications et JSON existants. Le binding ne doit jamais partager son état entre instances.
- [ ] Écrire les specs de permission : création sans record, utilisateur propriétaire, autre utilisateur et combinaison avec une visibilité existante. Vérifier deux ouvertures utilisant la même configuration décorée : actions Noos, registrations et cleanup restent indépendants.
- [ ] Installer les archives de validation des packages dans le checkout S autorisé ; l’orchestrateur gère manifestes/lockfile, sans laisser de chemin temporaire dans un changement destiné à être livré.
- [ ] Effectuer la phase de compilation et tests ciblés S décrite plus haut ; examiner les erreurs préexistantes séparément. Revue de cette frontière métier avant les bascules.

## T10 — Bascule des consommateurs sections et consultation

**Files :** lignes sections/display de `L/docs/migrations/sesio-component-consumers.md`, consommateurs correspondants dans `S/apps/webapp/src/app/`, anciens dossiers `_components/section-tabs/` et `_components/display-dialog/`, imports de sections dans `_components/edit-entity-dialog/`, documentation d’intégration S. Mettre à jour les templates de génération concernés par les mêmes imports.

**Interfaces :** consomme T9 ; produit des consommateurs qui utilisent exclusivement les API publiques sections/display et les extensions S déplacées. Préserver les signatures des services d’entités appelés par datagrids/pages.

- [ ] Déplacer les trois extensions display suivant la table de la spec commune et adapter leurs imports. Remplacer tous les imports de types/modules/composants sections/display par les noms npm ; les imports de composants métier vont vers `extensions/`.
- [ ] Pour chaque service de consultation utilisant URL ou contexte visuel, passer ses options métier à `decorate`. Préserver actions, résultats, rafraîchissements et ouverture depuis une URL.
- [ ] Mettre à jour l’ancien moteur d’édition pour qu’il consomme la nouvelle bibliothèque sections pendant cette étape. Vérifier qu’aucun scope ne déclare deux composants de même sélecteur.
- [ ] Supprimer les anciennes implémentations sections/display seulement après recherche des imports et des templates ; conserver les extensions déplacées. Ajouter les liens vers les README des packages et les recettes d’intégration.
- [ ] Vérifier tsc/ngc et les tests ciblés. Dans Chrome 4200, contrôler un écran à sections synchronisées, une consultation simple, une consultation média et un dialog imbriqué avec URL.
- [ ] Mettre l’inventaire à jour et faire relire l’absence de référence résiduelle avant T11.

## T11 — Bascule du moteur d’édition

**Files :** lignes édition/contrôles de l’inventaire, consommateurs de `_components/edit-entity-dialog/` dans S, services `_dialogs/`, NgModules, templates de génération et docs concernés ; ancien dossier de moteur à supprimer après migration.

**Interfaces :** consomme T8/T9/T10 ; produit des services d’entités utilisant l’API npm, les conditions de droits calculées dans S et les extensions métier locales. Préserve les résultats `updated/created/removed/archived/record` et leurs traitements par les appelants.

- [ ] Déplacer les extensions edit selon la table commune dans le même lot que leurs consommateurs. Adapter le composant RTE au contrat `control` en conservant sa configuration d’upload. Remplacer les imports et les `access` par les conditions calculées ; fournir `canToggleLock` à tous les champs anciennement soumis à la session ; migrer `rte` vers `control`.
- [ ] Passer URL/contexte à `SesioEditDialogIntegrationService.decorate`. Vérifier que `prepareFormGroup`, `ready`, les callbacks métier et les actions personnalisées sont conservés.
- [ ] Mettre à jour les cards et onglets métier déplacés. Rechercher les imports de types internes : les types utiles viennent de l’API npm ; ne pas contourner par un import source profond.
- [ ] Supprimer l’ancien moteur et ses declarations NgModule une fois tous ses consommateurs migrés. Conserver les `form-control-*` encore utilisés ailleurs et les inscrire explicitement dans l’inventaire comme hors périmètre de suppression.
- [ ] Vérifier tsc/ngc, tests ciblés du binding et des permissions et scénarios fixture création/update/annulation, dates verrouillées, autocomplete, réordonnancement, RTE, médias et Noos. Ne pas provoquer une mutation métier réelle sans cadre de test convenu.
- [ ] Revue de migration complète ; actualiser les docs d’architecture et recettes de génération réellement affectées. Mentionner la maintenance de contexte sésiO si nécessaire, sans l’exécuter automatiquement.

## T12 — Distribution, contrôle final et préparation de publication

**Files :** manifestes, exports/assets et README des trois packages ; `L/docs/migrations/sesio-component-consumers.md` ; créer `L/docs/migrations/sesio-extraction-validation.md` et `L/docs/migrations/sesio-extraction-release.md` pour les résultats réels et la procédure de livraison.

**Interfaces :** consomme les livrables validés de T10/T11 ; produit des archives npm utilisables, un rapport de vérification et une procédure publiable sur autorisation. Aucun package publié par cette tâche.

- [ ] Exécuter les builds nécessaires dans l’ordre sections, display, édition, uniquement si les sorties ont été invalidées depuis leurs validations précédentes.
- [ ] Créer un répertoire temporaire dédié et lancer `npm pack ./dist/section-tabs --pack-destination <temp>`, puis les deux autres. Examiner les tarballs (`tar -tf`) : JS, `.d.ts`, manifests, README, styles ; aucune source sésiO ni chemin absolu.
- [ ] Créer un consommateur Angular 22 temporaire avec la CLI locale (`node_modules/.bin/ng new ... --directory <temp-consumer> --skip-git --skip-install --defaults`) ; installer ensemble les trois archives et les peer dependencies requises. Lancer le build d’un composant consommant les trois modules et les styles, avec données en mémoire et sans tsconfig paths vers L/S. En cas de réseau indisponible, rapporter cette vérification non exécutée au lieu d’assimiler le build monorepo à un test du package.
- [ ] Contrôler les exports publics et les dépendances des tarballs, puis rechercher les imports résiduels des anciens moteurs dans S. Vérifier l’absence de chemins `file:/...temp...` dans les manifests/lockfiles destinés à la livraison.
- [ ] Consigner les tests et builds réellement exécutés, les limites, les parcours manuels et les fichiers modifiés. Exécuter `git diff --check` une fois sur chaque diff final.
- [ ] Faire la revue finale des frontières des trois packages, des intégrations et de la documentation. Préparer la séquence de publication : sections d’abord, dialogs ensuite, puis remplacement des archives par versions npm dans S et vérification du lockfile.
- [ ] Présenter les changements pour autorisation de commit/publication. Ne pas publier automatiquement ; sans publication autorisée, conserver la bascule sésiO comme travail non livré avec ses modalités locales de validation documentées, sans prétendre qu’un checkout dépendant de versions non publiées est prêt pour CI.

## Prompt de délégation à utiliser lors de l’exécution

```text
Implémente uniquement la tâche T<n> du plan docs/superpowers/plans/2026-10-16-sesio-extraction.md.
Racine L : <chemin réel>. Racine S : <chemin réel, lecture seule sauf tâche S explicitement attribuée>.
Lis les AGENTS applicables, les Global Constraints et la spec du package concerné.
Les prérequis validés sont : <tâches et signatures exactes>.
Tu possèdes uniquement : <liste de fichiers/répertoires de la tâche>.
Ne modifie pas les contrats publics partagés, les fichiers racine ou les fichiers d’un autre agent.
Pour un besoin hors ownership, envoie une demande précise à l’orchestrateur.
Préserve les modifications non liées. Pas de commit, changement de branche, publication ni délégation supplémentaire.
Écris et exécute les tests prescrits, implémente, puis demande une revue de ton diff.
Rapporte : fichiers modifiés, comportement obtenu, commandes et résultats réels, limites et besoins d’intégration.
```

## État de ce plan

Specs et plan validés par l’utilisateur le 16 octobre 2026. Toutes les cases d’implémentation restent ouvertes ; création des branches/worktrees en attente d’autorisation explicite. Seuls les documents de conception et de planification sont créés pendant cette phase. Les noms de modèles, les scripts et les fichiers cibles décrivent le travail futur ; ils ne prouvent ni exécution de tests, ni publication, ni migration de sésiO.
