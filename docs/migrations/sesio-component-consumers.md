# Inventaire des consommateurs sésiO

État initial d’exécution, basé sur le worktree S au commit `4535edd9f`. Les lignes ci-dessous sont des candidats déterminés par imports/références et sélecteurs ; les références documentaires ne sont pas des imports exécutables. Le statut sera mis à jour après validation de chaque bascule.

Les composants métier restent dans S sous `_integrations/angular-material-extended/extensions/`. Les `form-control-*` utilisés hors du moteur sont conservés. Pour les fichiers mêlant moteur et extensions, classifier chaque import avant remplacement ; ne pas faire un remplacement de répertoire global aveugle.

| Chemin S | Famille | Référence | Lot et destination | Statut | Note |
|---|---|---|---|---|---|
| `apps/webapp/tsconfig.favorites.spec.json` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/AGENTS.md` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/AGENTS.md` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-7-simple-edit-dialog-services.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-7-tabbed-edit-dialog-services.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-8-dialog-callbacks.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-8-embedded-contracts.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-7-custom-edit-dialog-services.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-6-edit-dialog-services.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-8-specialized-editors.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/appointment-dialog/appointment.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/organizational-unit-kind-dialog/organizational-unit-kind.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/organizational-unit-kind-dialog/organizational-unit-kind.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/organizational-unit-kind-dialog/organizational-unit-kind.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/vehicle-dialog/vehicle.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/vehicle-fleet-dialog/vehicle-fleet.edit.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/customer-contract-dialog/customer-contract.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/customer-contract-dialog/customer-contract.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/customer-contract-dialog/customer-contract.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/customer-contract-dialog/customer-contract-reminders-tab/customer-contract-reminders-tab.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/customer-contract-dialog/customer-contract-calendar-tab/customer-contract-calendar-tab.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/customer-contract-dialog/customer-contract-calendar-tab/customer-contract-calendar-tab.component.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/customer-contract-dialog/customer-contract-billing-dates-tab/customer-contract-billing-dates-tab.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-zone-dialog/equipment-zone.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-zone-dialog/equipment-zone.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/ticket-dialog/ticket.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/customer-account-dialog/customer-account.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/customer-account-dialog/customer-account.edit.dialog.service.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/customer-account-dialog/customer-account.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/customer-account-dialog/customer-account.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/customer-account-dialog/customer-account-event-trigger-definitions-tab/customer-account-event-trigger-definitions-tab.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/criticity-option-dialog/criticity-option.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/calendar-view-dialog/calendar-view.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/rate-card-dialog/rate-card.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/rate-card-dialog/rate-card.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/rate-card-dialog/rate-card.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/rate-card-dialog/rate-card-time-slots-field/rate-card-time-slots-field.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/billing-matrix-dialog/billing-matrix.edit.dialog.service.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/billing-matrix-dialog/billing-matrix.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/billing-matrix-dialog/billing-matrix-options-tab/billing-matrix-options-tab.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/billing-matrix-dialog/billing-matrix-options-tab/billing-matrix-options-tab.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/billing-matrix-dialog/billing-matrix-options-tab/billing-matrix-options-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/transmitter-dialog/transmitter.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/commercial-proposal-dialog/commercial-proposal.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/organization-dialog/organization.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/organization-dialog/organization.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/organization-dialog/organization.edit.dialog.service.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/organization-dialog/organization.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/organization-dialog/organization-holidays-tab/organization-holidays-tab.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/event-dialog/event.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/event-dialog/event.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/field-checkpoint-dialog/field-checkpoint.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/maintenance-plan-dialog/maintenance-plan.edit.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/appointment-kind-dialog/appointment-kind.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/sesio-node-dialog/sesio-node.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/sector-map-dialog/sector-map.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/sector-map-dialog/sector-map-sectors/sector-map-sectors.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/product-dialog/product.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/product-dialog/product.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/product-dialog/product.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/product-dialog/product-operation-graph/product-operation-graph.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/supplier-order-dialog/supplier-order.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-failure-dialog/equipment-failure.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/document-dialog/document.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/document-dialog/document.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/invoice-dialog/invoice.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/invoice-dialog/invoice.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/invoice-dialog/invoice.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/organizational-unit-dialog/organizational-unit.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/organizational-unit-dialog/organizational-unit.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/organizational-unit-dialog/organizational-unit.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-kind-dialog/equipment-kind.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/absence-kind-dialog/absence-kind.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/absence-kind-dialog/absence-kind.edit.dialog.service.spec.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/kanban-dialog/kanban.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/catalog-item-dialog/catalog-item.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/catalog-item-dialog/catalog-item.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/catalog-item-dialog/catalog-item.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/safety-point-dialog/safety-point.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-field-checkpoint-dialog/equipment-field-checkpoint.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/sector-dialog/sector.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-dialog/task.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/task-dialog/task.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/task-dialog/task.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-dialog/task-time-edit-tab/task-time-edit-tab.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/supplier-dialog/supplier.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/team-dialog/team.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/team-dialog/team.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/team-dialog/team.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/billing-index-dialog/billing-index.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention-in-progress-transition-dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 | Extension paths need per-import classification: media-tab |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention-kind-fields.helper.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention-status-transition-dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention-finalization-summary-field/intervention-finalization-summary-field.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention-finalization-actions-field/intervention-finalization-actions-field.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention-blocked-user-field/intervention-blocked-user-field.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention-required-actions-field/intervention-required-actions-field.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention-billing-tab/intervention-billing-tab.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/real-estate-structure-kind-dialog/real-estate-structure-kind.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/real-estate-structure-kind-dialog/real-estate-structure-kind.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/real-estate-structure-kind-dialog/real-estate-structure-kind.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-kind-dialog/intervention-kind.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/prospect-dialog/prospect.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/user-profile-dialog/user-profile.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/task-kind-dialog/task-kind.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/elevator-failure-declaration-dialog/elevator-failure-declaration.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/billing-option-definition-dialog/billing-option-definition.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/media-dialog-tab/media-dialog-tab.component.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/media-dialog-tab/media-dialog-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/media-dialog-tab/media-dialog-tab.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/media-dialog-tab/media-dialog-tab.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/media-dialog-tab/document-analysis-display-card/document-analysis-display-card.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/user-dialog/user.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/user-dialog/user.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/user-dialog/user.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/revision-formula-dialog/revision-formula.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/field-definition-dialog/field-definition.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/gateway-dialog/gateway.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-checkpoint-dialog/equipment-checkpoint.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-checkpoint-dialog/equipment-checkpoint.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/field-checkpoint-tag-dialog/field-checkpoint-tag.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/business-opportunity-dialog/business-opportunity.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-dialog/elevator-equipment.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/parking-door-equipment.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.generic-display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.generic-display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-dialog/parking-door-equipment.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/elevator-equipment.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-dialog/elevator-equipment.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment-contracts/equipment-contracts.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment-product-parts-installation/equipment-product-parts-installation.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/elevator-technical-dialog-tab/elevator-technical-dialog-tab.component.html` | edit-entity-dialog | app-edit-entity-component | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/elevator-technical-dialog-tab/elevator-technical-dialog-tab.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment-event-triggers-card/equipment-event-triggers-card.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment-event-triggers-card/event-actions-panel/event-action-edit-dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/elevator-floors-card/elevator-floors-card.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/signature-risk-simulation-dialog/elevator-signature-risk-simulation.display-dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment-display/elevator-technical-display.sections.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment-display/equipment-display-select-options.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment-maintenances/equipment-maintenances.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment-event-commutations-card/equipment-event-commutations-card.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/sesio-node-capabilities-card/sesio-node-capabilities-card.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/elevator-doors-card/elevator-doors-card.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/equipment-dialog/elevator-cabin-calls-card/elevator-cabin-calls-card.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/real-estate-structure-dialog/real-estate-structure.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/real-estate-structure-dialog/real-estate-structure.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/real-estate-structure-dialog/real-estate-structure.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/maintenance-dialog/maintenance.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/maintenance-dialog/maintenance.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/maintenance-dialog/maintenance.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/customer-account-position-dialog/customer-account-position.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/customer-account-position-dialog/customer-account-position.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/customer-account-position-dialog/customer-account-position.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 | Extension paths need per-import classification: rte-section-card |
| `apps/webapp/src/app/_dialogs/quote-stem-dialog/quote-stem.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/location-stock-dialog/location-stock.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/location-stock-dialog/location-stock.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/location-stock-dialog/location-stock.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/invoice-stem-dialog/invoice-stem.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/quote-dialog/quote.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/quote-dialog/quote.display.dialog.service.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/quote-dialog/quote.display.dialog.service.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_dialogs/intervention-schedule-dialog/intervention-schedule.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/intervention-schedule-dialog/intervention-schedule-slots-field/intervention-schedule-slots-field.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/meter-dialog/meter.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_dialogs/works-kind-dialog/works-kind.edit.dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/workspaces/ebio/energy/boiler-room/boiler-room.dialog.html` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/workspaces/ebio/energy/boiler-room/boiler-room.dialog.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/workspaces/ebio/elevator/elevator-page-statistics/elevator-page-statistics.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/workspaces/ebio/elevator/elevator-page-statistics/elevator-page-statistics.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/workspaces/ebio/elevator/elevator-page-statistics/elevator-page-statistics.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/workspaces/axio/kameo/kameo-search-bar/kameo-search-bar.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_components/elevator-behavioral-analysis-campaign/elevator-behavioral-analysis-campaign.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_components/elevator-info/signature-tab/elevator-info-signature-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/signature-tab/elevator-info-signature-tab.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/signature-tab/elevator-info-signature-tab.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/media-tab/elevator-info-media-tab.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/media-tab/elevator-info-media-tab.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/media-tab/elevator-info-media-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/summary-tab/elevator-info-summary-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/summary-tab/elevator-info-summary-tab.component.html` | section-tabs | app-section-tabs-display | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/summary-tab/reliability-indicators-card/elevator-reliability-indicators-card.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/statistics-tab/elevator-info-statistics-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/statistics-tab/elevator-info-statistics-tab.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/statistics-tab/elevator-info-statistics-tab.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/traffic-chart-card/elevator-summary-traffic-chart-card.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/technical-info-tab/elevator-info-technical-info-tab.component.html` | section-tabs | app-section-tabs-display | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/elevator-info/technical-info-tab/elevator-info-technical-info-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/display-dialog/display-dialog.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | supprimé · T10 | Ancien moteur sans consommateur ; API npm |
| `apps/webapp/src/app/_components/display-dialog/README.md` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/display-dialog/README.md` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/display-dialog/display-dialog.component.html` | section-tabs | app-section-tabs-display | T10 · @eherve/angular-material-section-tabs | supprimé · T10 | Ancien moteur sans consommateur ; API npm |
| `apps/webapp/src/app/_components/display-dialog/display-dialog.module.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | supprimé · T10 | Ancien moteur sans consommateur ; API npm |
| `apps/webapp/src/app/_components/display-dialog/display-dialog-media-tab/display-dialog-media-tab.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | déplacé · T10 | `apps/webapp/src/app/_integrations/angular-material-extended/extensions/display-media-tab/display-dialog-media-tab.component.html` ; sélecteur et assets conservés |
| `apps/webapp/src/app/_components/display-dialog/display-dialog-media-tab/display-dialog-media-tab.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | déplacé · T10 | `apps/webapp/src/app/_integrations/angular-material-extended/extensions/display-media-tab/display-dialog-media-tab.component.html` ; sélecteur et assets conservés |
| `apps/webapp/src/app/_components/display-dialog/display-dialog-media-tab/display-dialog-media-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | déplacé · T10 | `apps/webapp/src/app/_integrations/angular-material-extended/extensions/display-media-tab/display-dialog-media-tab.component.ts` ; sélecteur et assets conservés |
| `apps/webapp/src/app/_components/customer-account-position-tree/customer-account-position-tree.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_components/events-tab/events-tab.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/events-tab/events-tab.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/events-tab/events-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/section-tabs/section-tabs.component.html` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | supprimé · T10 | Ancien moteur sans consommateur ; API npm |
| `apps/webapp/src/app/_components/section-tabs/README.md` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/section-tabs/README.md` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/section-tabs/README.md` | section-tabs | app-section-tabs-display | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/section-tabs/section-tabs-display/section-tabs-display.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | supprimé · T10 | Ancien moteur sans consommateur ; API npm |
| `apps/webapp/src/app/_components/section-tabs/section-tabs-display/section-tabs-display.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | supprimé · T10 | Ancien moteur sans consommateur ; API npm |
| `apps/webapp/src/app/_components/edit-entity-dialog/edit-entity-dialog.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_components/edit-entity-dialog/README.md` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_components/edit-entity-dialog/index.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 | Extension paths need per-import classification: media-tab |
| `apps/webapp/src/app/_components/edit-entity-dialog/edit-entity-dialog.module.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 | Extension paths need per-import classification: location-section-card |
| `apps/webapp/src/app/_components/edit-entity-dialog/edit-entity-dialog.module.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/edit-entity-dialog/tabs/media-tab/media-tab.component.ts` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/edit-entity-dialog/tabs/media-tab/media-tab.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/edit-entity-dialog/tabs/media-tab/media-tab.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/edit-entity-dialog/tabs/media-tab/media-tab.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/edit-entity-dialog/tabs/media-tab/document-analysis-display-card/document-analysis-display-card.component.ts` | section-tabs | import/reference | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/edit-entity-dialog/components/edit-entity-dialog/edit-entity-dialog.component.html` | edit-entity-dialog | app-edit-entity-component | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_components/edit-entity-dialog/components/edit-entity-component/edit-entity-component.component.html` | section-tabs | app-section-tab | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_components/edit-entity-dialog/components/edit-entity-component/edit-entity-component.component.html` | section-tabs | app-section-tabs | T10 · @eherve/angular-material-section-tabs | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `apps/webapp/src/app/_datagrids/lists/action-list/action.edit.service.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_datagrids/lists/sensor-list/sensor-list.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `apps/webapp/src/app/_datagrids/lists/alert-trigger-list/alert-trigger-list.component.ts` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 |  |
| `.agents/skills/sesio-project-context/references/angular-dialogs.md` | display-dialog | import/reference | T10 · @eherve/angular-material-display-dialog | migré · T10 | Imports npm / sélecteur conservé ; docs ou configuration adaptées |
| `.agents/skills/sesio-project-context/references/angular-dialogs.md` | edit-entity-dialog | import/reference | T11 · @eherve/angular-material-edit-entity-dialog | migré · T11 | Extension paths need per-import classification: location-section-card |


## Frontière métier T9 — inventaire détaillé (16 octobre 2026)

Relevé du checkout S autorisé, avant toute bascule. Les propriétés métier ci-dessous ne doivent pas être conservées dans les configs npm. Les usages non génériques de `access` (capabilities) et les contextes visuels privés hors moteurs sont exclus.

| Référence S | Propriété | Destination | Statut |
|---|---|---|---|
| `apps/webapp/src/app/_datagrids/lists/action-list/action.edit.service.ts:121` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_datagrids/lists/sensor-list/sensor-list.component.ts:462` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/appointment-dialog/appointment.edit.dialog.service.ts:123` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/customer-account-dialog/customer-account.display.dialog.service.ts:67` | `visualContext` | T10/T11 · decorate(..., {visualContext}) | Migré T10 · options locales de decorate |
| `apps/webapp/src/app/_dialogs/customer-account-dialog/customer-account.edit.dialog.service.ts:72` | `visualContext` | T10/T11 · decorate(..., {visualContext}) | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/customer-account-position-dialog/customer-account-position.edit.dialog.service.ts:186` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/customer-contract-dialog/customer-contract-calendar-tab/customer-contract-calendar-tab.component.ts:548` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/customer-contract-dialog/customer-contract-reminders-tab/customer-contract-reminders-tab.component.ts:221` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment-event-triggers-card/event-actions-panel/event-action-edit-dialog.service.ts:181` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.edit.dialog.service.ts:108` | `queryParameter` | T10/T11 · decorate(..., {queryParameter}) + binding par ouverture | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.edit.dialog.service.ts:109` | `visualContext` | T10/T11 · decorate(..., {visualContext}) | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.edit.dialog.service.ts:312` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.edit.dialog.service.ts:876` | `access` | T11 · createSesioEditAccess + visible combiné | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.edit.dialog.service.ts:896` | `access` | T11 · createSesioEditAccess + visible combiné | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.edit.dialog.service.ts:915` | `access` | T11 · createSesioEditAccess + visible combiné | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.edit.dialog.service.ts:934` | `access` | T11 · createSesioEditAccess + visible combiné | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/equipment-dialog/equipment.generic-display.dialog.service.ts:64` | `visualContext` | T10/T11 · decorate(..., {visualContext}) | Migré T10 · options locales de decorate |
| `apps/webapp/src/app/_dialogs/equipment-failure-dialog/equipment-failure.display.dialog.service.ts:126` | `visualContext` | T10/T11 · decorate(..., {visualContext}) | Migré T10 · options locales de decorate |
| `apps/webapp/src/app/_dialogs/equipment-failure-dialog/equipment-failure.display.dialog.service.ts:133` | `queryParameter` | T10/T11 · decorate(..., {queryParameter}) + binding par ouverture | Migré T10 · options locales de decorate |
| `apps/webapp/src/app/_dialogs/gateway-dialog/gateway.edit.dialog.service.ts:178` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention-kind-fields.helper.ts:333` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention.display.dialog.service.ts:217` | `visualContext` | T10/T11 · decorate(..., {visualContext}) | Migré T10 · options locales de decorate |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention.edit.dialog.service.ts:269` | `visualContext` | T10/T11 · decorate(..., {visualContext}) | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/intervention-dialog/intervention.edit.dialog.service.ts:952` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/invoice-dialog/invoice.edit.dialog.service.ts:231` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/invoice-dialog/invoice.edit.dialog.service.ts:253` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/maintenance-plan-dialog/maintenance-plan.edit.service.ts:141` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/meter-dialog/meter.edit.dialog.service.ts:158` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/quote-dialog/quote.edit.dialog.service.ts:287` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/real-estate-structure-dialog/real-estate-structure.edit.dialog.service.ts:180` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/task-dialog/task.edit.dialog.service.ts:445` | `queryParameter` | T10/T11 · decorate(..., {queryParameter}) + binding par ouverture | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/task-dialog/task.edit.dialog.service.ts:614` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/task-dialog/task.edit.dialog.service.ts:1007` | `lockedProperty` | T11 · canToggleSesioDateLock(record, permission existante) | Migré T11 · intégration locale |
| `apps/webapp/src/app/_dialogs/ticket-dialog/ticket.display.dialog.service.ts:79` | `visualContext` | T10/T11 · decorate(..., {visualContext}) | Migré T10 · options locales de decorate |
| `apps/webapp/src/app/_dialogs/user-profile-dialog/user-profile.edit.dialog.service.ts:137` | `kind: rte` | T11 · extension control RTE locale | Migré T11 · intégration locale |

`createSesioEditAccess(userAccess, scope, context$, visible?)` compose booléen, fonction et Observable de visibilité avec les droits actuels. `context$` émet `{record, formGroup}` à l’ouverture et après chaque remplacement du record. L’absence de record garde la section masquée. Pour un verrou, composer `canToggleSesioDateLock(record, permissionExistante)` avec la condition de champ ; ne jamais remplacer une permission serveur par `true`.

| Source extension S (fichiers TS/HTML/SCSS associés) | Destination S prévue | Lot |
|---|---|---|
| `_components/display-dialog/display-dialog-media-tab/` | `_integrations/angular-material-extended/extensions/display-media-tab/` | T10 |
| `_components/display-dialog/display-dialog-photo-gallery/` | `_integrations/angular-material-extended/extensions/display-photo-gallery/` | T10 |
| `_components/display-dialog/display-dialog-location-card/` | `_integrations/angular-material-extended/extensions/display-location-card/` | T10 |
| `_components/edit-entity-dialog/tabs/media-tab/` et `document-analysis-display-card/` | `_integrations/angular-material-extended/extensions/edit-media-tab/` (avec sous-card) | T11 |
| `_components/edit-entity-dialog/cards/location-section-card/` | `_integrations/angular-material-extended/extensions/edit-location-card/` | T11 |
| `_components/edit-entity-dialog/cards/rte-section-card/` | `_integrations/angular-material-extended/extensions/edit-rte-card/` | T11 |
| `_components/edit-entity-dialog/cards/action-select-tree-section-card/` | `_integrations/angular-material-extended/extensions/edit-action-tree-card/` | T11 |
| `_components/edit-entity-dialog/fields/edit-entity-rte-field/` | `_integrations/angular-material-extended/extensions/edit-rte-field/`, champ `control` | T11 |
| `_components/noos-context-action/` | Réutilisé par `extensions/noos-dialog-action/` ; composant d’origine conservé pour ses autres usages | T9 |

Les contrôles `form-control-*` utilisés ailleurs restent dans leurs dossiers actuels. Aucune extension ni aucun consommateur n’a été déplacé en T9 ; les trois extensions de consultation ont ensuite été déplacées en T10. Bootstrap réel : `apps/webapp/src/app/app.module.ts` ; tokens npm enregistrés avec `useExisting`. Styles de panel importés via les deux exports npm `styles.css`, variables thématiques mappées dans `styles.scss`. Aucun alias source ou chemin temporaire n’est livré.

### Recette T11 : options d’accès privées à chaque ouverture

Le contrat npm conserve `displayOptions` statique. Un Observable de visibilité attaché à une configuration finale unique ne peut pas représenter simultanément les records de deux dialogs. Réutiliser uniquement la configuration de base ; appeler la factory sésiO à chaque `open` :

```ts
// baseOptions reste réutilisable ; chaque section peut porter son access local.
const optionsForThisOpening = createSesioEditAccessOptions(baseOptions, userAccess);
const decorated = editIntegration.decorate(optionsForThisOpening, integration);
editDialog.open(decorated);
```

Signature finale : `createSesioEditAccessOptions<TRecord extends EditEntityRecord>(template: SesioEditAccessOptions<TRecord>, userAccess: UserAccessService): EditEntityComponentOptions<TRecord>`. La factory copie le chemin des onglets/sections, enlève `access` de chaque section et compose sa visibilité existante avec `createSesioEditAccess`. Elle possède un `BehaviorSubject` privé et ne modifie pas la base. `connect.recordChanged` émet le nouveau record ; `prepareFormGroup` et `ready` conservent les callbacks existants, branchent le vrai formulaire et émettent après ces callbacks. `valueChanges` et `statusChanges` réévaluent aussi les fonctions de visibilité. Lors d’un rebuild, les abonnements de l’ancien formulaire sont retirés avant branchement du suivant. `destroy` est idempotent, débranche le formulaire, termine les Observables de visibilité et appelle le cleanup préexistant une fois.

Deux appels à cette factory depuis la même base produisent deux flux et deux formulaires indépendants ; le test couvre des records/droits distincts, le remplacement du record, le changement du formulaire, un rebuild, les callbacks et le nettoyage. Les configurations finales portant les flux d’accès sont propres à leur ouverture. En revanche `SesioEditDialogIntegrationService.decorate` et son équivalent display restent réutilisables pour Noos/URL : chaque appel de leur `connect` crée une registration et un binding privés.

La configuration d’entrée de la factory utilise le type **local** `SesioEditAccessOptions<T>` (avec `SesioEditSection<T>` et `SesioEditTabDisplayOptions<T>`). Le type d’entrée autorise explicitement `section.access`, y compris sous `tabs`/`sections`. Son résultat est le type npm `EditEntityComponentOptions<T>`, dont les sections ne contiennent plus ce champ. Exemple typé également présent dans la spec sésiO :

```ts
type RecordType = EditEntityRecord & { customerAccountId: string };
const baseOptions: SesioEditAccessOptions<RecordType> = {
  displayOptions: {
    section: {
      id: 'details', label: 'Détails', cards: [],
      access: { workspace: Workspace.AXIO, module: WorkspaceModule.AXIO_CLIENT },
      visible: (record, formGroup) => !!record && formGroup.valid,
    },
  },
};
const npmOptions: EditEntityComponentOptions<RecordType> =
  createSesioEditAccessOptions(baseOptions, userAccess);
```

La signature finale de la factory est donc `createSesioEditAccessOptions<TRecord extends EditEntityRecord>(template: SesioEditAccessOptions<TRecord>, userAccess: UserAccessService): EditEntityComponentOptions<TRecord>` ; les types locaux sont définis dans `sesio-edit-access.ts`. Aucun changement du contrat npm n’est requis.

## Bascule T10 — 16 octobre 2026

111 références historiques de sections/consultation sur 72 chemins ont été traitées dans
le tableau : imports migrés, sélecteurs conservés, anciens moteurs supprimés, README
redirigés. La recherche du code courant, incluant imports internes de l’ancien edit et
modèles de génération, fait autorité. 51 fichiers TypeScript ont été adaptés (dont 3
extensions déplacées), 30 configurations de consultation passent par `decorate`.
Les callbacks, loaders, actions métier, résultats, rafraîchissements et valeurs des
options URL/contexte ont été comparés structurellement avec la source avant migration.
Cette comparaison est une preuve de conservation source, pas une exécution des parcours.

Complément trouvé hors inventaire historique :

| Chemin S | Famille | Destination / résultat | Statut |
|---|---|---|---|
| `entity-generator/templates/apps/webapp/src/app/_dialogs/{{KEBAB_NAME}}-dialog/{{KEBAB_NAME}}.display.dialog.service.ts.tpl` | sections + display | noms npm et `SesioDisplayDialogIntegrationService.decorate` | migré T10 ; fixture réelle générée |
| `apps/webapp/src/app/_integrations/angular-material-extended/extensions/display-photo-gallery/` | extension display | ancienne galerie omise du mapping T9, TS/HTML/SCSS conservés | déplacé T10 |
| `apps/webapp/src/app/_integrations/angular-material-extended/README.md` | documentation | recettes locales et liens README des packages installés | créé T10 |

Les 30 fichiers des anciens moteurs/anciennes copies d’extensions ont été supprimés ;
les README des anciens dossiers restent des liens, sans code ni barrel de compatibilité.
La base interne non publique `SectionTabsDisplayCardComponent` avait un seul consommateur
exécutable : sa card métrique déclare maintenant son seul input utilisé `value`, typé.
Le module d’édition local et ses deux extensions d’analyse média consomment les sections
npm ; leurs autres comportements restent du ressort de T11.

Vérifications T10 : tsc app, ngc app et compilation des quatre specs favorites PASS ;
contrôle structurel des 51 corps, des six assets déplacés et d’une fixture générée PASS.
Aucun import exécutable vers les anciens dossiers sections/display et aucune déclaration locale des
sélecteurs génériques ne subsistent. Aucun test navigateur n’a été exécuté pour T10.
La vérification UI sésiO attend un serveur du worktree migré, coordonné par l’orchestrateur.
Les manifestes et le lockfile sont volontairement inchangés jusqu’à T12/publication ;
le succès des compilateurs utilise les archives npm déjà installées et ne prouve pas
une installation CI reproductible. Voir le rapport T10 pour les commandes et limites.

## Bascule T11 — 16 octobre 2026

Les consommateurs d’édition importent l’API npm publique. Les 90 configurations produites
par 79 fichiers passent par `createSesioEditAccessOptions` puis `decorate`, même sans
options URL/contexte ; 88 appels `open` ont été suivis jusqu’à leur builder décoré.
Les règles `access` des sections d’équipement utilisent les types locaux avant conversion.
Le champ `task.dueDate` fournit la permission explicite `canToggleSesioDateLock`.

Les cinq extensions sont déplacées dans les chemins `edit-*` autoritatifs ci-dessus,
avec la sous-card d’analyse documentaire. Les 19 champs `rte` deviennent des contrôles
locaux branchés sur le contrôle du moteur. Module, placeholder et hauteurs sont transmis
via `inputs`. L’ancienne propriété `filePathPrefix`, déclarée mais jamais transmise à
Quill et sans consommateur dans le dépôt, n’est pas reconduite comme input sans effet.
L’upload réel reste dans Quill et `RteFileService.processS3Files(html, path)` appelé par
les services métier. Les trois anciennes configurations textarea `rows` sont traduites
vers `minRows` public ; les valeurs métier de 3/4 lignes sont conservées.

Le moteur local est supprimé, seul son README de redirection reste. Les contrôles
externes `form-control-autocomplete`, `form-control-duration`, `form-control-number`,
`form-control-select`, `form-control-sortable-list`, `form-control-text` et
`form-control-textarea` restent explicitement hors périmètre de suppression, avec leurs
consommateurs hors moteur. `JsonDataDialogModule` est désormais importé au bootstrap,
sa portée étant auparavant apportée par l’ancien module d’édition.

Le template réel `entity-generator/templates/.../*.edit.dialog.service.ts.tpl` produit
la même intégration par ouverture. Les callbacks métier (399), résultats et options
des appelants ont été comparés à l’état avant T11 ; aucune mutation métier réelle ni
validation UI sésiO n’a été effectuée. Les manifestes/locks restent inchangés : les
compilations utilisent les archives 22.0.0 préinstallées et ne prouvent pas une installation CI.
Voir le rapport T11 pour commandes, preuves et limites. La maintenance de contexte
sésiO (`npm run codex:context-maintenance`) est à envisager après intégration ; elle
n’est pas exécutée automatiquement.
