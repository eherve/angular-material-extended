# Validation de l’extraction sésiO

Statut au 16 octobre 2026 : **les trois packages 22.0.0 sont publiés sur npm ; la migration sésiO est fusionnée localement dans edge au commit 60a87666c**. Le correctif Angular signals est inclus et tous les constats bloquants de code sont clos. Les dépendances exactes et leurs intégrités sont enregistrées dans le manifeste/lockfile de S ; les vérifications TypeScript, Angular et le build du consommateur isolé réussissent après téléchargement npm. Les parcours métier restent partiels et Karma S non exécuté. Les sections précédant la publication conservent les preuves historiques.

## T8 et T9

Les rapports T1 à T8 consignent les tests et builds de chaque tâche. La suite complète édition a atteint 114/114 ; après les correctifs T8, les specs touchées ont passé 40/40 et le build production de la bibliothèque édition a réussi. Les archives de bibliothèques n’ont pas changé après ces builds : le correctif date de T8 concernait uniquement le clonage dans la démo.

Pour T9, les vérifications TypeScript et `ngc` de l’application ont réussi. **19 specs** Karma ont été compilées, mais leur lancement a été bloqué par `EPERM`; elles ne sont pas exécutées. Les 8 contrôles Node d’URL et les 6 contrôles Node de permissions ont réussi. Le build de démo et ses deux tests ont réussi. Ces contrôles restent distincts des tests consommateur npm et des tests UI sésiO.

Références : [rapport T8](../../.superpowers/sdd/2026-10-16-sesio-extraction/task-8-report.md), [rapport T9](../../.superpowers/sdd/2026-10-16-sesio-extraction/task-9-report.md).

## T10 — sections et consultation sésiO

T10 est approuvé. Les 111 références historiques sur 72 chemins ont été classées ; les imports runtime utilisent les noms npm publics. Les 30 configurations de consultation concernées passent par l’intégration, les options de contexte et le binding `equipmentFailureId` y sont conservés. Les trois extensions de consultation ont été déplacées vers `display-media-tab`, `display-photo-gallery` et `display-location-card`. La card métrique déclare maintenant son input public, et les fichiers média/photo/localisation déplacés conservent leurs HTML/SCSS.

Les anciennes implémentations runtime sections et consultation ont été supprimées après recherche des importeurs. Les README locaux redirigent vers les contrats publics. Le moteur d’édition a été conservé localement pour T11 à ce stade, puis supprimé par T11.

Vérifications réellement consignées : `tsc` app, `ngc` app, compilation ciblée des specs, comparaison AST de 51 corps source, vérification des six assets HTML/SCSS, génération du fixture d’entité et recherches d’imports/ancien sélecteur ; toutes réussies. Aucune suite Karma ni aucun navigateur sésiO n’ont été exécutés. Les preuves AST et compilation vérifient le source et les contrats ciblés, pas une équivalence runtime complète.

Référence : [rapport T10](../../.superpowers/sdd/2026-10-16-sesio-extraction/task-10-report.md).

## T11 — édition sésiO

T11 est **approuvé** après le correctif 2 limité aux tests ; la revue indépendante n’a relevé aucun constat restant. Les sources de production n’ont pas changé depuis les passes `tsc` et `ngc`.

Le rapport T11 recense 98 fichiers consommateurs TypeScript adaptés, 79 producteurs de configurations, 90 configurations passant par la factory d’accès et l’intégration, et 88 ouvertures effectives auditées jusqu’au builder décoré. Les cinq extensions d’édition sont localisées sous `_integrations/angular-material-extended/extensions/`; les 19 champs RTE utilisent `kind: 'control'` avec le FormControl du moteur. Le moteur local a été supprimé ; les contrôles partagés `form-control-*` et la mobileapp restent en place. Les callbacks métier, options de contexte/URL, métadonnées des champs RTE, actions et résultats ont passé les comparaisons ciblées consignées au rapport.

Les vérifications rapportées sont réussies : `tsc` app, `ngc` app, compilation de **13 specs** (8 initiales + 5 du correctif 1), recompilation seule de BillingMatrix après le correctif test-only 2, fixture réelle du générateur, harnais Node de quatre scénarios, vérifications source et audit des 88 ouvertures. Les specs ont été **compilées seulement**, jamais exécutées. Aucun lancement Karma, retry ou escalade n’a été fait après `EPERM`. Aucun build global sésiO ni navigateur sésiO n’a été exécuté. Les harnais utilisent des doubles et ne valident pas les comportements DOM ou une mutation métier réelle.

Parcours encore à vérifier sur sésiO migré : Quill/upload réel, dates et verrou, autocomplete/pagination, réordonnancement, médias/analyse et Noos. La fixture de génération exerce le service et les callbacks, mais ne prouve pas un nouveau parcours d’entité complet.

Références : [rapport T11](../../.superpowers/sdd/2026-10-16-sesio-extraction/task-11-report.md), [fichiers T11](../../.superpowers/sdd/2026-10-16-sesio-extraction/task-11-modified-files.json).

## T12 — archives npm et contrat des packages

Les trois archives fournies lors de la validation initiale ont été consommées ensemble dans une fixture Angular 22 isolée, sans `paths` TypeScript ni lien symbolique vers L ou S. Les deux premières archives restent celles de la passe initiale, validées par T2/T3. Le digest édition initial reste consigné comme historique ; sa nouvelle preuve finale après corrections figure plus bas :

| Package | Archive | SHA-512 base64 |
| --- | --- | --- |
| `@eherve/angular-material-section-tabs@22.0.0` | `eherve-angular-material-section-tabs-22.0.0.tgz` | `OYrIPu6fMx51ERO6HGl6YWl16AIJ0BNCmEMgBmMQ7rMkE8u0lPpycfSeCXWvNlxE0og3jRiyIbN281zyx23eLA==` |
| `@eherve/angular-material-display-dialog@22.0.0` | `eherve-angular-material-display-dialog-22.0.0.tgz` | `ZricPhob/lWV2ML7jxzlbclh16ngjpkd57PgRNzdqpyX8diCFXN5u6OLo0DNz63Pex0TJ9seTMkJ4ZxKVB2XxA==` |
| `@eherve/angular-material-edit-entity-dialog@22.0.0` | `eherve-angular-material-edit-entity-dialog-22.0.0.tgz` | `JAO8drm4rUIDOpBU/jvyAdki4rQo4dsswcOF++OKwY/GdyCdc4aV5kDnrWOeBXcAhS6v4sWNAB6I7r34RaZoig==` |

`diff -qr` entre chaque archive extraite et le `dist` courant n’a signalé aucune différence. Les trois archives contiennent manifeste, README, bundles FESM, déclarations TypeScript et source maps ; les dialogs contiennent aussi `styles.css`. L’inspection des exports de `dist` trouve zéro cible manquante : `section-tabs` exporte son point d’entrée public et son manifeste ; `display-dialog` et `edit-entity-dialog` exportent aussi `./styles.css`. Les dialogs déclarent `section-tabs` comme peer ; aucun import ne relie l’un à l’autre. Les imports TypeScript entre projets L passent par `@eherve/angular-material-section-tabs`, pas par des chemins `projects/...`.

Les peers et dépendances correspondent aux contrats : Angular/Material/CDK 22 et RxJS 7.8 ; `section-tabs` a `tslib` en dépendance ; `display-dialog` ajoute `section-tabs` comme peer ; `edit-entity-dialog` ajoute les peers Forms, Moment, Day.js, adaptateurs Material/Ng-Matero et `@ng-matero/extensions`, plus `lodash-es` et `subsink` en dépendances. Les manifestes des archives n’ont pas de `file:` ni de chemin absolu. Les source maps embarquent le source des bibliothèques extraites avec des chemins relatifs `../../../projects/...`, sans chemin absolu ni source de S. Le README édition mentionne Noos pour délimiter le contrat, et le bundle contient un sélecteur CSS historique `app-quill-editor`; aucune dépendance ni implémentation Quill n’est fournie par le package.

Dans S, la recherche ciblée des références TypeScript/JavaScript aux anciens chemins de moteurs `_components/{section-tabs,display-dialog,edit-entity-dialog}` ou `projects/{section-tabs,display-dialog,edit-entity-dialog}` n’a trouvé aucun résultat dans `apps/webapp`, `entity-generator` et `scripts`. `package.json` et `package-lock.json` ne contiennent aucune résolution `file:` ou locale vers `/private/tmp`/L ; le parse du lockfile compte zéro entrée `resolved` locale. Les trois nouveaux packages ne figurent pas dans les dépendances racine enregistrées de S ; le datatable déjà existant reste référencé. Les archives installées localement pour les compilations ne remplacent pas les dépendances publiées et verrouillées.

### Fixture consommateur

Répertoire isolé : `/private/tmp/t12-angular22-consumer-20261016`. La CLI locale 22.2.2 a généré le scaffold avec `--skip-git --skip-install --defaults`; son option `--directory` a été résolue relativement au cwd, puis le dossier généré a été déplacé dans `/private/tmp` avant installation. La fixture consomme les trois archives avec des données mémoire, importe les trois modules et les styles d’overlay par les exports npm et appelle les services display/edit.

Les archives se sont installées ensemble avec les peers requis : Angular/Material/CDK 22.2.3, RxJS 7.8.2, Ng-Matero 22.1.1, Moment 2.31.0 et Day.js 1.11.23. L’installation `--no-save --package-lock=false` n’a pas créé de lockfile ni modifié le manifeste du fixture.

Vérifications de build de cette fixture : `ng build --configuration development` a réussi. Le premier `ng build` production a généré le bundle de 1,72 MB puis échoué sur le budget initial par défaut de 1 MB du scaffold. Dans la fixture seulement, ce budget a été relevé à 2 MB warning / 3 MB error ; le budget `anyComponentStyle` est resté à 4/8 kB. Le second build production a réussi à 1,72 MB, avec les avertissements CommonJS de Moment et Day.js. Ces résultats prouvent la compilation des archives installées ; ils ne valident pas les dépendances de registre ou le lockfile de S.

### Distribution après la première vague finale — historique

Après la vague de corrections finales, le package édition a été repackagé. Le SHA-512 base64 du tarball final `@eherve/angular-material-edit-entity-dialog@22.0.0` est `xO8Y35JHFzzgzNoqxgY69cX930RwXray3DDhXmDnIWaM0oPkaCo2bNZKW7/FMv7MP5Ru1FSysuZbdkrmQLLdqg==` ; son SHA-1 est `2013839a8ca8ab125fd00b2292bc996cb3bc3cc9`. L’archive contient 6 fichiers et 170604 octets. `diff -qr` archive extraite / `dist/edit-entity-dialog` final est code 0. Le bundle FESM SHA-256 `d479498ae1d1ec3012f217dc311d59d1b40974d228bbfca120d17d01b7fe14b3` est identique dans l’archive, le `dist` et l’installation S.

Les trois archives ont ensuite été installées ensemble dans S avec `--no-save --package-lock=true` : commande code 0, 2068 versions verrouillées auditées, zéro mismatch ; `git diff` sur `package.json` et `package-lock.json` reste vide. Cette validation locale confirme l’installation des tarballs mais ne publie pas les packages et ne remplace pas une résolution de registre.

La fixture consommateur isolée a réinstallé les trois tarballs et peers puis réussi son build production, code 0, bundle initial 1,73 MB. Une première tentative d’installation de cette réinstallation a échoué `ERESOLVE` à cause de la version Ng-Matero demandée (22.1.1) ; après correction à la version réelle 22.0.0 déjà installée, l’installation finale a réussi sans `--force`/`--legacy-peer-deps`, puis le build a réussi. Warnings CommonJS Moment/Day.js présents. La démo L a également été reconstruite en production après la vague finale, code 0 ; warnings de budget et CommonJS consignés dans `/private/tmp/final-fix-demo-production.log`. Les détails fonctionnels et tests de cette vague sont dans le [rapport des corrections finales](../../.superpowers/sdd/2026-10-16-sesio-extraction/final-fix-report.md).

## Vérification Chrome de la démo L

La démo de bibliothèque sur `localhost:4242` a été vérifiée avec Chrome DevTools, onglet de cette origine. Les onglets sésiO `localhost:4200` et mobile `localhost:4201` n’ont pas été utilisés pour cette validation.

Les parcours rapportés comprennent : sélection de sections en mode local et handler mémoire ; consultation directe, loader, onglets, sections, composant personnalisé et dialog imbriqué ; création/édition, validation obligatoire, autocomplete, liste triée par glisser-déposer, durée, contrôle personnalisé, card paresseuse, rejet suivi d’une nouvelle tentative, confirmation de fermeture et deux dialogs d’édition réels imbriqués. Dans le cas imbriqué, Échap ferme l’enfant seul puis un second Échap ferme le parent. Après correction du clonage de Moment, la date du 16/10/2026 survit à la création, à la réouverture et à l’édition ; la valeur enregistrée est copiée sans perte de son type ou de son timestamp. Après rechargement HMR, le parcours date ne produit plus d’erreur console ; le complément Chrome rapporte la fermeture imbriquée sans erreur/warning. Aucune requête réseau échouée n’a été observée.

La démo production a été reconstruite après cette correction : [log](/private/tmp/sesio-extraction-demo-final-build.log), build complet dans `L/dist/angular-material-extended`. Après les corrections finales, Chrome a aussi vérifié sur `localhost:4242` l’archivage puis le désarchivage : `Archiver`→`Désarchiver`→`Archiver`, notification de désarchivage et métadonnées mémoire `isArchived: false` cohérentes, sans erreur/warning console. Le libellé générique de confirmation reste « Archiver » lors du désarchivage. Le build production final est dans `/private/tmp/final-fix-demo-production.log` ; avertissements budget/CommonJS présents. Ces parcours valident la démo L uniquement, pas l’application sésiO migrée. Les tests ciblés de la vague finale sont détaillés dans le rapport final ; les parcours Chrome de S 4202 sont décrits dans la section suivante.

Référence : [rapport des parcours Chrome](../../.superpowers/sdd/2026-10-16-sesio-extraction/browser-demo-report.md).

## Corrections finales T12

La première vague finale a corrigé I1 (reprises asynchrones obsolètes), I3 (préfixes HTML/autocomplete), M1 (ARIA required), M2 (archive mémoire) et la visibilité initiale sûre d’I2. Sa relecture a laissé ouvert le déclenchement automatique du rendu OnPush ; le correctif signals ci-dessous clôt ce dernier point. Les preuves de cette étape restent historiques : édition 137/137, démo 3/3, harnais S 7/7, tsc/ngc et specs compilées. Aucun test DOM automatisé S n’a été exécuté sous Karma. [Rapport historique](../../.superpowers/sdd/2026-10-16-sesio-extraction/final-fix-report.md).

## Vérification partielle de sésiO sur 4202

Le serveur de développement de la worktree a démarré sur le slot 1 (API 3002, web 4202), avec compilations API/web réussies. Chrome page 35 a réutilisé la session existante. Avant actualisation de l’archive finale, le compte et ses sections Identification, Facturation, Applications et Utilisateurs ont été ouverts ; champs, localisation métier et carte sont apparus. Aucune sauvegarde métier n’a été faite. La visite Applications a ensuite montré Mettre à jour/Annuler sans saisie volontaire ; origine préexistante ou régression non établie. Le clic de confirmation « quitter sans enregistrer » a été refusé par auto-review et n’a pas été exécuté. Au démarrage, AppMenu a émis NG0100 (template ligne 179), avec avertissements Three.js/sanitisation et Mapbox de localisation consignés séparément.

Après installation de l’archive édition finale (SHA-512 indiqué ci-dessus) et rechargement, un équipement existant s’ouvre dans le moteur npm : champs requis/désactivés, sections et onglets ; sélection de section de l’onglet technique affiche le contenu attendu. Les préfixes Secteur/Bâtiment des extensions métier sont visibles ; cela ne valide pas le contrôle autocomplete générique. Un dialog consultation imbriqué s’ouvre depuis le compte ; Échap ferme l’enfant seul en conservant le parent et `equipmentId`. Quill rend le texte et sa toolbar ; les médias/documents existants sont visibles. Aucun upload, saisie, mutation, sauvegarde, déplacement, suppression, analyse ou téléchargement n’a été demandé. La fermeture du parent retire le dialog et `equipmentId`. Après ces parcours, la console ne montre plus d’erreur et conserve seulement l’avertissement Three.js ; aucune requête XHR/fetch échouée observée.

Cela reste une validation partielle : pas de test du scénario de consultation à sections synchronisées par query parameters, dates/verrou, pagination autocomplete générique, réordonnancement, upload réel, analyse média, Noos, rôle moins privilégié ou confirmation de quitter sans sauvegarder. Ces parcours précèdent le correctif signals ; sa preuve de rendu automatique provient des tests DOM zoneless décrits ci-dessous. Référence : [rapport Chrome sésiO](../../.superpowers/sdd/2026-10-16-sesio-extraction/browser-sesio-report.md).

## Correctif Angular signals — validation courante

Le 16 octobre 2026, après demande explicite de l’utilisateur, `EditEntityComponent.renderState` et `.actions` sont devenus des signals Angular. Le template lit `renderState()` et `getActions()` lit `actions()` pendant le rendu ; les callbacks publient leurs mises à jour avec `.set(...)`. Les configurations, services, callbacks métier et objets renderState imbriqués gardent leur contrat. Les lectures directes des deux membres d’instance sont désormais appelables ; aucun consommateur S n’a nécessité d’adaptation.

Huit tests ont échoué avant correction (28 réussis), puis la suite édition complète a réussi **144/144**. Le DOM est vérifié après `whenStable()` sans `detectChanges()` forcé après émission : sections, onglets, cards et actions visibles/désactivées. TypeScript et build production du package réussis. La relecture indépendante est approuvée, sans nouveau constat : **I2 est levé**. [Rapport du correctif](../../.superpowers/sdd/2026-10-16-sesio-extraction/signal-render-fix-report.md).

Archive édition courante : SHA-512 `5VYpRfSa0K7agQWqFEO8IJt/NJgpvuYOUpuuMDx/o4kgzH1wcufOv5B2kNB6vG2Gu3FFfqOs8jnsBLtg12kRvQ==`, SHA-1 `b20327aba933cc4764ae2afc9b67d51036b8ca99`, 170824 octets, six fichiers. Tous les fichiers de l’archive sont identiques au dist et aux installations S/consommateur isolé. Les archives sections/display sont inchangées. Les 2068 versions installées verrouillées de S restent identiques ; aucun diff manifeste/lock. [Preuve de distribution](../../.superpowers/sdd/2026-10-16-sesio-extraction/signal-render-distribution-proof.json).

Après réinstallation : compilation Angular sésiO `ngc --noEmit` et compilation des specs d’intégration ciblées réussies ; builds production consommateur isolé et démo L réussis. Logs `/private/tmp/signal-render-S-ngc.log`, `signal-render-S-spec.log`, `signal-render-consumer-build.log` et `signal-render-demo-build.log`. Les avertissements CommonJS/budget et NG0914 préexistants restent documentés ; aucun Karma S ni nouveau parcours Chrome n’est revendiqué pour ce correctif. Les builds ne prouvent pas une installation depuis le registre.

## Statut de livraison et fichiers T12

À la clôture initiale de T12, S gardait ses manifestes et son lockfile inchangés et la publication n’était pas autorisée. Cette situation historique est remplacée par la publication et l’installation depuis le registre décrites ci-dessous. Les limites Karma et recette métier partielle restent applicables.

T12 n’a modifié aucun package, API publique, manifeste, lockfile, inventaire ou source S. Ses seuls fichiers suivis prévus dans L sont :

- `docs/migrations/sesio-extraction-validation.md`
- `docs/migrations/sesio-extraction-release.md`
- `.superpowers/sdd/2026-10-16-sesio-extraction/task-12-report.md`

Les détails d’exécution et les chemins précis des changements S T10/T11 restent dans leurs rapports et leur inventaire, au lieu d’être recopiés ici.

Contrôles documentaires finaux : `git diff --check` a réussi dans L et dans S (code 0). Comme les documents T12 sont nouveaux/non suivis dans L, un contrôle séparé confirme zéro espace final et un saut de ligne final pour chacun des trois fichiers T12. Aucun test, build, installation ou parcours navigateur n’a été relancé pendant cette reprise.

## Publication npm et consommation depuis le registre

Le 16 octobre 2026, l’utilisateur a autorisé la publication et l’installation depuis npm dans le worktree. Les publications publiques ont réussi dans l’ordre `section-tabs`, `display-dialog`, `edit-entity-dialog`, toutes en **22.0.0** avec le tag `latest`. Après propagation, les trois tarballs du registre ont été téléchargés et comparés aux archives validées : égalité octet par octet et intégrités SHA-512 identiques, dont l’édition avec Angular signals. [Preuve registre](../../.superpowers/sdd/2026-10-16-sesio-extraction/sesio-npm-registry-proof.json).

Dans S, l’installation avec `--save-exact --package-lock=true --ignore-scripts` a ajouté les trois dépendances exactes et leurs trois entrées dans le lockfile : **3 lignes dans package.json et 61 lignes dans package-lock.json**, aucun changement des anciennes entrées ni des 2068 versions préexistantes installées. Les trois `resolved` ciblent le registre npm, sans `file:` ni source locale. [Preuve manifeste/lock](../../.superpowers/sdd/2026-10-16-sesio-extraction/sesio-npm-install-proof.json).

Pour exclure une simple réutilisation des installations locales de même version, leurs trois dossiers ont été déplacés vers une sauvegarde temporaire dédiée, puis réinstallés depuis le lockfile avec un cache dédié dans S et dans le consommateur Angular isolé. Les logs consignent trois téléchargements HTTP 200 « cache miss » pour chacun. Les 5 fichiers sections, 6 fichiers display et 6 fichiers édition installés sont identiques aux archives validées dans les deux consommateurs, sans liens symboliques. [Preuve fichiers](../../.superpowers/sdd/2026-10-16-sesio-extraction/npm-registry-installed-files-proof.json), [téléchargements S](../../.superpowers/sdd/2026-10-16-sesio-extraction/sesio-npm-registry-reinstall.log), [téléchargements consommateur](../../.superpowers/sdd/2026-10-16-sesio-extraction/consumer-npm-registry-reinstall.log).

Vérifications après cette réinstallation, toutes terminées avec code 0 :

- `tsc --noEmit -p apps/webapp/tsconfig.app.json --rootDir .` dans S.
- `ngc --noEmit -p apps/webapp/tsconfig.app.json --rootDir .` dans S.
- `tsc --noEmit -p ../task9-focused-tests.json` dans S : compilation seulement.
- `ng build --configuration production` dans `/private/tmp/t12-angular22-consumer-20261016` : trois modules et deux exports CSS consommés depuis npm, sans alias source ; bundle initial 1,73 MB, avertissements CommonJS Moment/Day.js. Budget fixture 2 MB warning / 3 MB error déjà documenté, inchangé.

Logs conservés dans le ledger sous `npm-registry-S-tsc.log`, `npm-registry-S-ngc.log`, `npm-registry-S-spec.log`, `npm-registry-consumer-build.log`. Aucun nouveau parcours navigateur ni test Karma S n’est revendiqué. Aucun `npm ci` global ni pipeline CI complet n’a été lancé. Aucun commit, push, merge ou déploiement sésiO. Le dépôt d’origine reste inchangé ; seule la consommation du worktree S est basculée vers les dépendances publiées.

## Fusion locale dans edge — validation finale

À la demande de l’utilisateur, le commit de migration `b3cd78606` a été fusionné avec `edge` (`e8befd69c`) dans le commit `60a87666c`. La combinaison a été préparée et validée dans le worktree avant la fusion finale ; les arbres sont identiques (`f0b20f3ceb579e59707f8fcadb968fd29d26a00b`). Les modifications récentes d’edge sont conservées, dont la suppression des imports clients et le rafraîchissement de cellule équipement.

Après accord explicite, seules les modifications locales des deux fichiers de dépendances ont été mises temporairement en stash. La restauration a causé deux conflits d’adjacence, résolus en conservant les trois packages npm et la mise à jour model-mapper 6.3.4 non commitée. Le contrôle JSON retrouve exactement l’état utilisateur initial après retrait des trois nouvelles dépendances ; les cinq autres fichiers locaux sont identiques octet par octet. Aucun conflit résiduel ni changement staged ; stash restauré supprimé.

Dans le checkout principal sur edge, npm a ajouté uniquement les trois packages sans modifier les manifestes, puis `tsc --noEmit -p apps/webapp/tsconfig.app.json --rootDir .` et `ngc --noEmit -p apps/webapp/tsconfig.app.json --rootDir .` ont terminé avec code 0. `git diff --check` a réussi. [Preuve fusion](../../.superpowers/sdd/2026-10-16-sesio-extraction/sesio-dialog-merge-proof.json). Les logs `sesio-edge-after-merge-{tsc,ngc}.log` et `sesio-edge-merged-npm-install.log` sont conservés dans le ledger. Aucun push, déploiement ni nouvelle recette navigateur ; les limites Karma et recette métier demeurent.
