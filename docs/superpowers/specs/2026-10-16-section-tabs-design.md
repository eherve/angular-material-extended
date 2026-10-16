# Spécification de Section Tabs

Statut : spécification validée par l’utilisateur le 16 octobre 2026 ; implémentation autorisée et en cours. Les [contraintes communes](2026-10-16-sesio-extraction-design.md) font partie de cette spécification.

## Périmètre et sources

Source : `S/apps/webapp/src/app/_components/section-tabs/`.
Destination : `L/projects/section-tabs/src/lib/`, avec les mêmes sous-dossiers pour les directives et `section-tabs-display`.

Inclure `SectionTabsComponent`, `SectionTabComponent`, `SectionTabsDisplayComponent`, leurs directives publiques, leurs types de configuration, la grille responsive, les templates et styles. Préserver le rendu déclaratif complet, y compris les cards, actions, composants personnalisés, champs vides et le mode `single-card`.

Sortir `NavigationService`, `Router`, `NavigationEnd`, les pipes sésiO `SafePipe` et `IsNilPipe`. Pour les deux pipes, intégrer seulement les fonctions nécessaires au rendu, sans importer de module de pipes applicatif. Le HTML ordinaire reste sanitizé par Angular ; une valeur déjà typée `SafeHtml` peut être fournie volontairement par l’hôte. Ne pas recopier une désactivation globale de la sanitization.

## API publique

Conserver les noms et sélecteurs actuels :

- `SectionTabsModule`, `SectionTabsComponent` (`app-section-tabs`), `SectionTabComponent` (`app-section-tab`), `SectionTabsDisplayComponent` (`app-section-tabs-display`).
- `SectionTabLabelDirective`, `SectionTabContentDirective`, `SectionTabsMenuHeaderDirective`, `SectionTabsFooterDirective` et leurs sélecteurs existants.
- Les types `SectionTabType`, `SectionTabCounter` et les types `SectionTabsDisplay*` utilisés dans les configurations et callbacks.
- `selectedIndex`, `selectedIndexChange`, `queryParamKey`, `queryParamValue`, les compteurs et les templates projetés.

`queryParamKey` et `queryParamValue` sont conservés pour réduire la migration. Dans la bibliothèque ils représentent uniquement une clé de groupe et une valeur stable transmises au handler ; leur nom n’autorise aucune dépendance au Router.

Ajouter dans `section-selection-handler.ts` :

```ts
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface SectionSelectionHandler {
  observe(key: string): Observable<string | null>;
  select(key: string, value: string): void | Promise<void>;
}

export const SECTION_SELECTION_HANDLER =
  new InjectionToken<SectionSelectionHandler>('SECTION_SELECTION_HANDLER');
```

Injection optionnelle avec `inject(SECTION_SELECTION_HANDLER, { optional: true })`. Aucun provider global par défaut, aucun Router requis. Un provider à la racine de l’application couvre les usages ordinaires ; un injector plus proche peut fournir un autre handler. Ne pas ajouter un input de handler en parallèle pour cette première version.

Le flux `observe(key)` émet l’état initial à la souscription puis ses changements. `null` signifie qu’aucune sélection externe n’est demandée. Le handler n’a pas de méthode de destruction globale : le composant se désabonne de son flux, sans désactiver les autres groupes.

## Règles de sélection

1. Sans handler, ou sans clé non vide, aucun abonnement externe ni appel `select` : sélectionner localement.
2. La sélection locale initiale utilise `selectedIndex` si cet index désigne une section active ; sinon la première section active. S’il n’y en a aucune, afficher zéro panneau, sans événement de sélection inventé.
3. Un clic sur une section active applique immédiatement sa sélection locale. Émettre `selectedIndexChange` seulement si la sélection change. Appeler `select` seulement avec une valeur stable définie et différente de la dernière valeur externe connue.
4. Un clic sur une section désactivée ou un séparateur ne fait rien. Un séparateur n’a pas d’index sélectionnable.
5. Une valeur externe connue et active sélectionne sa section et émet `selectedIndexChange` si nécessaire, comme actuellement. Ne jamais rappeler `select` pour cette origine externe.
6. Une valeur externe inconnue ou désactivée conserve une sélection locale sûre et reste mémorisée. Ne pas la corriger ni l’effacer chez l’hôte. Réessayer lorsque la projection ou l’état des sections change.
7. Une émission externe `null` conserve la sélection locale sûre ; elle ne force pas le premier onglet.
8. Un changement de `queryParamKey` libère l’ancien abonnement, oublie l’ancienne demande externe et s’abonne au nouveau groupe. Les anciennes émissions tardives ne doivent pas modifier la nouvelle sélection.
9. La destruction libère les abonnements du handler et des sections projetées. Les identifiants ARIA restent uniques entre instances.
10. Une exception synchrone ou un rejet de `select`, ou une erreur du flux externe, est envoyé à `ErrorHandler`. La sélection locale reste utilisable ; aucun rollback implicite ni rejet non traité. Un flux en erreur peut rester désabonné jusqu’à une nouvelle clé ou une nouvelle instance.

Le handler doit ordonner ses écritures asynchrones pour que des clics rapides aboutissent à la dernière sélection. Le composant n’attend pas la fin de la navigation pour afficher la section.

Les valeurs stables sont uniques dans un groupe ; les doublons constituent une erreur de configuration documentée. La synchronisation ne doit jamais sélectionner un index calculé depuis une traduction ou un label.

## Implémentation sésiO

`SesioSectionSelectionHandler` implémente le contrat dans `S/apps/webapp/src/app/_integrations/angular-material-extended/sesio-section-selection-handler.service.ts`.

- `observe(key)` construit un flux froid : lecture initiale via `NavigationService.getQueryParameter(key)`, puis lecture après chaque `NavigationEnd` du Router, avec `distinctUntilChanged()`.
- `select(key, value)` délègue à `NavigationService.updateQueryParameters({ [key]: value }, 'merge', true)` et convertit le résultat en `Promise<void>`.
- Sérialiser les écritures de toutes les clés dans cette instance du service pour éviter qu’un groupe n’écrase la modification concurrente d’un autre. Après un échec, la file accepte encore les prochaines sélections.
- Aucun `ActivatedRoute` local : un dialog doit lire l’URL réelle de l’application.
- Enregistrer `{ provide: SECTION_SELECTION_HANDLER, useExisting: SesioSectionSelectionHandler }` dans le provider racine existant de la webapp.

Le même contrat sert dans la démo avec un handler en mémoire. Aucun provider Router ne doit être ajouté uniquement pour satisfaire les sections.

## Rendu, styles et API déclarative

- Les options `SectionTabsDisplayOptions` et leurs types imbriqués restent dans `section-tabs-display/section-tabs-display.types.ts`, séparés de l’implémentation du composant. Leurs noms et signatures existants sont conservés.
- Exporter ces types depuis `src/public-api.ts`, ainsi que les directives réellement exportées par le NgModule. La directive de grille interne reste privée sauf si son usage externe est démontré.
- `SectionTabsDisplayComponent` transmet `queryParamKey` au composant de navigation ; une section utilise `queryParamValue ?? id`.
- Garder les layouts `columns`, `gap`, `minColumnWidth`, spans et breaks, les compteurs, les actions de label et les inputs filtrés des composants personnalisés.
- Conserver les animations actuelles et déclarer la peer dependency animations. Documenter le provider d’animations nécessaire dans l’application hôte ; les tests peuvent utiliser le mode sans animations.
- Les styles restent limités aux sélecteurs de la bibliothèque malgré l’encapsulation actuelle `None`. Toute règle globale non préfixée doit être rattachée à ces sélecteurs.

## Tests d’acceptation

Dans `section-tabs.component.spec.ts`, tester un hôte avec templates projetés et handler factice contrôlable :

| Cas | Assertion |
|---|---|
| Aucun provider | Le composant se crée sans Router et sélectionne la première section active |
| Sélection locale | L’index et le contenu changent, avec un seul événement |
| Handler initial | `observe('groupA')` émet `details` : bonne section, zéro appel `select` |
| Clic avec handler | `select('groupA', 'history')` appelé une seule fois |
| Retour du handler | L’écho `history` ne provoque aucune nouvelle écriture |
| Deux groupes | Les clés et sélections restent indépendantes |
| Valeur inconnue | Aucune correction externe ; ajout tardif de sa section puis sélection |
| Section désactivée | Aucun clic accepté ; une demande externe est réappliquée après activation |
| Toutes désactivées / séparateurs seuls | Aucun panneau actif, aucune erreur |
| Changement de clé et destruction | Les émissions de l’ancien flux n’ont aucun effet |
| Échec de synchronisation | `ErrorHandler` reçoit l’erreur ; la navigation locale continue |

Dans `section-tabs-display.component.spec.ts`, transférer les trois tests existants (action de label, `single-card`, mode standard) et couvrir le rendu d’une valeur `0`, `false`, vide, d’une card composant et de deux cards `single-card` scrollables.

Dans S, `sesio-section-selection-handler.service.spec.ts` couvre lecture initiale, NavigationEnd, fusion, `replaceUrl: true`, fragment conservé, clics rapides et deux groupes modifiés simultanément.

## Livrable autonome

Le package, son README et `L/src/app/demos/section-tabs/section-tabs-demo.component.{ts,html,scss}` doivent montrer une version locale et une version synchronisée en mémoire. Les imports de la démo utilisent exclusivement le nom npm. Le lot est terminé après test ciblé, build production et installation de son archive dans un consommateur isolé, avant toute suppression dans S.
