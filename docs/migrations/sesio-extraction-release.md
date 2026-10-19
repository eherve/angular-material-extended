# Livraison des packages sésiO extraits

Statut au 16 octobre 2026 : **les trois packages sont publiés sur npm en 22.0.0, installés depuis le registre et verrouillés dans le worktree sésiO**. La publication a été explicitement demandée par l’utilisateur, puis authentifiée dans npm. Le correctif Angular signals est inclus. La migration sésiO est désormais commitée (`b3cd78606`) et fusionnée localement dans `edge` (`60a87666c`) sur autorisation de l’utilisateur. Aucun push ni déploiement.

## Packages publiés

| Package | Version | Tag |
| --- | --- | --- |
| [@eherve/angular-material-section-tabs](https://www.npmjs.com/package/@eherve/angular-material-section-tabs) | 22.0.0 | latest |
| [@eherve/angular-material-display-dialog](https://www.npmjs.com/package/@eherve/angular-material-display-dialog) | 22.0.0 | latest |
| [@eherve/angular-material-edit-entity-dialog](https://www.npmjs.com/package/@eherve/angular-material-edit-entity-dialog) | 22.0.0 | latest |

Publication publique des archives préalablement validées, dans l’ordre sections, display, édition. Après le délai de traitement npm, les trois archives téléchargées ont été comparées octet par octet aux archives validées ; leurs intégrités SHA-512 correspondent au registre. Ne pas republier ces versions immuables.

## Consommation dans sésiO

Dans `/private/tmp/codex-sesio-generic-dialog-libraries`, `package.json` enregistre les trois dépendances exactes `22.0.0`. `package-lock.json` ajoute uniquement leurs trois entrées et les trois déclarations racine ; les résolutions pointent vers `https://registry.npmjs.org/`. Les 2068 versions installées préexistantes et toutes les anciennes entrées du lockfile restent inchangées. Aucun alias TypeScript ni lien symbolique ne remplace ces packages.

La première installation a enregistré les dépendances. Les trois anciens répertoires installés ont ensuite été mis de côté, puis npm les a téléchargés à nouveau avec un cache dédié : trois réponses HTTP 200 « cache miss » dans S et dans le consommateur isolé. Les 17 fichiers distribués correspondent aux archives dans les deux installations. Les anciennes archives locales ne sont plus nécessaires pour résoudre ces dépendances. Une installation CI complète n’a pas été exécutée.

## Vérifications après installation npm

- sésiO : `tsc --noEmit -p apps/webapp/tsconfig.app.json --rootDir .` réussi.
- sésiO : `ngc --noEmit -p apps/webapp/tsconfig.app.json --rootDir .` réussi.
- Specs d’intégration ciblées : compilation TypeScript réussie, sans exécution Karma.
- Consommateur Angular 22 isolé : build production réussi, avec les trois modules et les deux exports CSS. Bundle initial 1,73 MB ; budget de fixture déjà réglé à 2/3 MB. Avertissements CommonJS Moment/Day.js conservés.

Les preuves et limites détaillées sont dans [le rapport de validation](sesio-extraction-validation.md#publication-npm-et-consommation-depuis-le-registre).

## Limites de recette

Les parcours sésiO sur 4202 restent partiels et précèdent la réinstallation depuis npm. Karma sésiO reste non exécuté après la restriction de port documentée. Dates/verrou, pagination autocomplete générique, réordonnancement, upload réel, analyse média, Noos, rôle réduit et confirmation de sortie restent à vérifier. Les constats bloquants de code sont clos ; cela ne constitue pas une recette métier complète ni un déploiement de sésiO.

## Fusion locale dans edge

Le 16 octobre 2026, la migration a été fusionnée dans `edge` au commit `60a87666c` (parents `e8befd69c` et `b3cd78606`). L’arbre fusionné correspond exactement au résultat préparatoire validé. Les trois packages npm 22.0.0 sont aussi installés dans le checkout principal. TypeScript et le compilateur Angular ont réussi sur ce checkout après fusion.

Le stash ciblé des deux fichiers de dépendances a été autorisé par l’utilisateur. Les deux conflits à la restauration ont été résolus en conservant les packages publiés et la mise à jour locale model-mapper 6.3.4 ; cette dernière reste non commitée. Les autres fichiers locaux sont identiques octet par octet à leur état initial. Le stash restauré a été supprimé ; les worktrees sont conservés. Aucun push, déploiement ni nouveau parcours navigateur.
