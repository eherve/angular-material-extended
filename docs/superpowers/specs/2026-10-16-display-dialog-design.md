# Spécification de Display Dialog

Statut : spécification validée par l’utilisateur le 16 octobre 2026 ; implémentation autorisée et en cours. Les [contraintes communes](2026-10-16-sesio-extraction-design.md) et la [spec sections](2026-10-16-section-tabs-design.md) s’appliquent.

## Périmètre

Source principale : `S/apps/webapp/src/app/_components/display-dialog/display-dialog.component.ts`, `.html`, `.scss`, `display-dialog.service.ts`, `display-dialog.module.ts` et `README.md`.

Destination : `L/projects/display-dialog/src/lib/`. Déplacer les types publics vers `display-dialog.types.ts`. Les composants de galerie, médias et localisation restent dans S aux destinations du document commun.

Conserver `DisplayDialogService`, `DisplayDialogModule`, `DisplayDialog`, leur intégration MatDialog et la possibilité actuelle de rendu embarqué. Le package dépend de sections, jamais du moteur d’édition.

## API conservée

- `DisplayDialogService.open<TRecord extends object>(data: DisplayDialogData<TRecord>, config?: DisplayDialogOpenConfig<TRecord>): MatDialogRef<DisplayDialog<TRecord>, unknown>`.
- Union exclusive `record` ou `loadRecord`. Le loader accepte Promise ou Observable conformément au type source ; la première valeur d’un Observable fournit le record.
- Les modes racine `section`, `sections`, `tabs`, `component`, les cards/fields et composants personnalisés.
- Actions globales `handle`, actions de card `handler` et `menuHandler` : ne pas uniformiser ces noms pendant l’extraction.
- `context.setRecord(record)` et `context.close(result)` ; résultat `unknown` inchangé à la fermeture.
- Dimensions, `nested`, `DEFAULT_NESTED_OPTIONS`, priorité des dimensions explicites et classes de panel du service existant.
- Les labels, `showCloseButton`, `showJsonDataButton` et les toggles de champs vides.

Retirer de l’API npm `visualContext` et `queryParameter` : ces options appartiennent aux factories d’intégration sésiO. Leur comportement est reconstruit via la connexion ci-dessous, sans dépendance Router dans le package.

## Connexion à l’application

Nouveaux contrats dans `display-dialog.types.ts` :

```ts
export interface DisplayDialogConnection<TRecord extends object> {
  actions?: readonly DisplayDialogAction<TRecord>[];
  recordChanged?(record: TRecord): void;
  destroy?(): void;
}

// Ajouter à DisplayDialogDataCommon<TRecord> :
// connect?: () => DisplayDialogConnection<TRecord>;

export interface DisplayDialogActionComponent<TRecord extends object> {
  component: Type<unknown>;
  position?: DisplayDialogActionPosition;
  input?: Record<string, unknown> |
    ((context: { record: TRecord; data: DisplayDialogData<TRecord> }) => Record<string, unknown>);
}

export type DisplayDialogAction<TRecord extends object> =
  | DisplayDialogActionButton<TRecord>
  | DisplayDialogActionComponent<TRecord>;
```

Changer `actions` en `DisplayDialogAction<TRecord>[]`. Distinguer les actions composant par `component`, comme dans l’édition ; les actions bouton existantes conservent leur API.

- Appeler `connect` une fois au début de chaque initialisation du jeu de données, avant le chargement ; garder la connexion dans l’instance, jamais dans un singleton.
- Après chaque chargement accepté et chaque `setRecord`, actualiser le record, appeler `recordChanged`, puis recalculer le rendu et les inputs d’actions. Ne pas appeler pour un chargement obsolète, absent ou en erreur.
- Afficher les actions de configuration suivies des actions de la connexion, dans leurs positions respectives, sans muter la configuration d’origine. Les actions de connexion appartiennent à cette instance ; réutiliser une même configuration pour deux ouvertures ne partage pas leur état.
- Sur changement de données, détruire la connexion précédente avant d’en créer une nouvelle. À la destruction, appeler `destroy` exactement une fois, y compris après un loader en erreur.
- Une connexion ne change pas le résultat de fermeture. Les erreurs de ses callbacks passent par `ErrorHandler` sans interrompre la libération des ressources.
- Les inputs des actions composant sont recalculés sur changement de record et filtrés sur les inputs déclarés, comme pour les composants de contenu. Une action Noos sésiO peut ainsi être composée sans import applicatif dans le template générique.

Dans S, `SesioDisplayDialogIntegrationService.decorate<TRecord extends object>(data: DisplayDialogData<TRecord>, options: SesioDisplayDialogIntegrationOptions<TRecord>): DisplayDialogData<TRecord>` retourne une nouvelle configuration et compose une factory de connexion. Son type d’options reste dans S : `visualContext` reprend la forme actuelle de `DisplayDialogVisualContext<TRecord>` ; `queryParameter` reprend `{ name: string; restoreOnClose?: boolean }`.

La factory crée un binding URL et une inscription VisualContext propres à l’instance. Préserver toute connexion déjà fournie : concaténer ses actions, relayer les événements et nettoyer les deux connexions. Calculer les droits JSON côté application. Ajouter l’action composant Noos dans les `actions` de la connexion et calculer ses inputs depuis la registration propre à cette connexion, sans figer une permission dans le package.

## Services d’interface

Dans `display-dialog-host.ts` :

```ts
export interface DisplayDialogJsonSource {
  label: string;
  value: unknown;
}
export interface DisplayDialogHost {
  confirm(options: DisplayDialogConfirmOptions): Promise<boolean>;
  showJson(title: string, sources: readonly DisplayDialogJsonSource[]): void;
}
export const DISPLAY_DIALOG_HOST =
  new InjectionToken<DisplayDialogHost>('DISPLAY_DIALOG_HOST');
```

Une implémentation privée fournie par défaut utilise MatDialog pour la confirmation et une vue JSON textuelle échappée. Elle doit fonctionner sans sésiO. Un provider sésiO remplace ce host et traduit les arguments vers `ConfirmDialogService` et `JsonDataDialogService`. Les textes par défaut viennent de `DisplayDialogIntl`.

Une confirmation annulée ou une action rejetée ne ferme pas le dialog et ne remplace pas le record. Réinitialiser l’état de traitement dans `finally` ; exposer l’échec dans la zone d’erreur du dialog et le signaler à `ErrorHandler` sans afficher de données techniques à l’utilisateur. Les callbacks d’actions restent propriétaires des écritures métier.

## Comportements à préserver

- Protéger contre les résultats de chargement obsolètes lorsque les données changent pendant une Promise en cours.
- Afficher les états chargement, absence et erreur avec leurs libellés configurables.
- Conserver la distinction `section → cards → fields` et les quatre modes racine.
- `setRecord` actualise titre, sous-titre, visibilité/état des actions, inputs, rendu et connexion hôte.
- Les actions conditionnelles sont évaluées sur le record courant ; un bouton désactivé ne déclenche ni confirmation ni handler.
- Le composant générique n’ajoute pas un bouton Modifier. Une action métier déjà présente dans un service sésiO demeure gérée par ce service et n’est pas supprimée dans cette migration.
- Les composants de médias et localisation consomment les types publics npm après déplacement dans S ; aucun modèle `EntityDocument` ou pipe AWS ne doit apparaître dans le package.
- Les labels et champs HTML conservent la sanitization Angular ; la vue JSON est toujours du texte.

## Tests d’acceptation

| Test | Résultat attendu |
|---|---|
| Record direct | Rendu immédiat et un événement `recordChanged` |
| Loader Promise / Observable | Chargement puis record ; première valeur Observable uniquement |
| Loader vide / rejeté | Label adapté, aucune action sur un record absent |
| Deux initialisations en concurrence | Seul le résultat le plus récent est rendu/notifié |
| Fermeture avant résolution | Aucun rendu ni callback de record après destruction |
| `setRecord` | Titre, actions, composants et connexion reçoivent le nouveau record |
| Actions bouton et composant | Les deux s’affichent ; seuls les inputs déclarés sont transmis |
| Confirmation annulée | Handler métier non appelé |
| Handler rejeté | Dialog ouvert, état de traitement réinitialisé, erreur présentée |
| Connexions de deux dialogs | États distincts, chaque cleanup exactement une fois |
| Configuration imbriquée | Valeurs sources préservées ; dimensions explicites prioritaires |
| Résultat de fermeture | Le même objet est reçu par `afterClosed()` |

Ajouter des fixtures pour chaque mode racine et transférer les tests de rendu sections déjà couverts par le package sections sans les dupliquer ici. Tester dans S la restauration d’URL, le contexte Noos, les droits JSON et l’absence d’écriture après fermeture avec le binding commun.

## Livrable autonome

`L/src/app/demos/display-dialog/display-dialog-demo.component.{ts,html,scss}` ouvre des dialogs avec record direct, chargement simulé, action de rafraîchissement, composant personnalisé et dialog imbriqué. Le README fournit installation, providers, styles, modes, callbacks, connexion et résultats. Validation par tests ciblés, build production et archive npm installée sans alias source.
