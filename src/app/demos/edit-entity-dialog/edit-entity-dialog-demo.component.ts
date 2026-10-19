import { cloneDeep } from "lodash-es";
import { Component, Input, inject, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import {
  EditEntityComponentOptions,
  EditEntityDialogService,
  EditEntityField,
  EditEntityFormGroup,
  EditEntityDialogResult,
} from "@eherve/angular-material-edit-entity-dialog";
interface DemoRecord {
  _id?: string;
  name: string;
  notes?: string;
  count?: number;
  active?: boolean;
  minutes?: number;
  __archived?: { isArchived: boolean; at?: string };
}
@Component({
  selector: "app-edit-demo-control",
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `<mat-form-field appearance="outline"
    ><mat-label>{{ label }}</mat-label
    ><input matInput [formControl]="control"
  /></mat-form-field>`,
})
export class EditDemoControlComponent {
  @Input() label = "Valeur personnalisée";
  @Input() control!: FormControl;
}
@Component({
  selector: "app-edit-demo-card",
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `<p>
      Cette card réutilise le contrôle créé avant son premier affichage.
    </p>
    <mat-form-field appearance="outline"
      ><mat-label>Commentaire de card</mat-label
      ><input matInput [formControl]="formGroup.requireFormControl('cardNote')"
    /></mat-form-field>`,
})
export class EditDemoCardComponent {
  @Input() formGroup!: EditEntityFormGroup;
}
@Component({
  selector: "app-edit-entity-dialog-demo",
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: "./edit-entity-dialog-demo.component.html",
  styleUrl: "./edit-entity-dialog-demo.component.scss",
})
export class EditEntityDialogDemoComponent {
  private readonly dialogs = inject(EditEntityDialogService);
  readonly lastResult = signal("Aucune fermeture");
  readonly connectionEvents = signal<string[]>([]);
  private record: DemoRecord = {
    _id: "demo-1",
    name: "Projet exemple",
    notes: "Données en mémoire",
    count: 2,
    active: false,
    minutes: 90,
  };
  private failNext = false;
  openCreate(): void {
    this.open(undefined);
  }
  openEdit(): void {
    this.open(cloneDeep(this.record));
  }
  openFailure(): void {
    this.failNext = true;
    this.openEdit();
  }
  private open(record: DemoRecord | undefined): void {
    this.dialogs
      .open(this.options(record))
      .afterClosed()
      .subscribe((result) =>
        this.lastResult.set(JSON.stringify(result, null, 2)),
      );
  }
  private options(record?: DemoRecord): EditEntityComponentOptions<DemoRecord> {
    const choices = [
      { name: "Premier", value: 0 },
      { name: "Deuxième", value: 1 },
    ];
    const search = {
      display: (value: unknown) => ({
        name:
          typeof value === "object" && value !== null && "name" in value
            ? String(value.name)
            : String(value),
      }),
      search: async (_limit: number, _skip: number, text: string) => {
        const data = [
          { _id: "a", name: "Alpha" },
          { _id: "b", name: "Beta" },
        ].filter((value) =>
          value.name.toLowerCase().includes(text.toLowerCase()),
        );
        return { data, matchCount: data.length };
      },
    };
    const fields: EditEntityField<DemoRecord>[] = [
      { kind: "text", name: "name", label: "Nom", required: true },
      { kind: "textarea", name: "notes", label: "Notes" },
      {
        kind: "number",
        name: "count",
        label: "Nombre entier",
        isInteger: true,
        min: 0,
        max: 100,
      },
      { kind: "checkbox", name: "active", label: "Actif", defaultValue: false },
      {
        kind: "select",
        name: "choice",
        label: "Choix",
        options: choices,
        defaultValue: 0,
      },
      { kind: "radio", name: "radio", label: "Radio", options: choices },
      {
        kind: "chips",
        name: "tags",
        label: "Étiquettes",
        multiple: true,
        options: choices,
      },
      { kind: "slider", name: "score", label: "Score", min: 0, max: 10 },
      {
        kind: "duration",
        name: "minutes",
        label: "Durée (minutes)",
        quickOptions: [30, 90, 120],
        defaultValue: 90,
      },
      {
        kind: "autocomplete",
        name: "search",
        label: "Recherche",
        service: search,
      },
      {
        kind: "sortable-list",
        name: "ordered",
        label: "Liste ordonnée",
        service: search,
      },
      { kind: "date", name: "date", label: "Date" },
      { kind: "date-range", name: "dates", label: "Période" },
      { kind: "datetime", name: "datetime", label: "Date et heure" },
      { kind: "datetime-range", name: "datetimes", label: "Période horodatée" },
      { kind: "time", name: "time", label: "Heure" },
      { kind: "time-range", name: "times", label: "Plage horaire" },
      { kind: "separator", label: "Extension locale" },
      {
        kind: "control",
        name: "custom",
        label: "Contrôle local",
        component: EditDemoControlComponent,
      },
      {
        kind: "metadata",
        name: "context",
        defaultValue: "Jamais envoyé au service",
      },
      {
        kind: "display",
        name: "_id",
        label: "Identifiant",
        display: (value) => String(value ?? "Création"),
      },
    ];
    return {
      record,
      title: (context) =>
        context.record?._id ? "Modifier un projet" : "Créer un projet",
      subtitle: "Mémoire locale · aucune API",
      showJsonDataButton: true,
      validateOnEnter: true,
      defaultValues: { name: "Nouveau projet", active: false },
      displayOptions: {
        tabs: [
          {
            label: "Champs",
            displayOptions: {
              section: {
                id: "main",
                label: "Champs",
                grid: { columns: 1 },
                cards: [
                  {
                    id: "fields",
                    label: "Familles de champs",
                    grid: { columns: 2, minColumnWidth: "260px" },
                    fields,
                  },
                ],
              },
            },
          },
          {
            label: "Card personnalisée",
            displayOptions: {
              section: {
                id: "custom",
                label: "Extension",
                cards: [
                  {
                    id: "card",
                    label: "Card locale",
                    kind: "component",
                    component: EditDemoCardComponent,
                    fields: [
                      {
                        kind: "control",
                        name: "cardNote",
                        label: "Commentaire",
                        required: true,
                        defaultValue: "Prêt avant rendu",
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
      service: {
        create: async (value) => {
          this.maybeFail();
          this.record = cloneDeep({
            ...value,
            _id: "demo-" + Date.now(),
          }) as unknown as DemoRecord;
          return cloneDeep(this.record);
        },
        update: async (id, value) => {
          this.maybeFail();
          this.record = cloneDeep({ ...this.record, ...value, _id: id });
          return cloneDeep(this.record);
        },
        remove: async () => true,
        isRemovable: true,
        archive: async () => {
          this.record.__archived = {
            ...this.record.__archived,
            isArchived: !this.record.__archived?.isArchived,
            at: new Date().toISOString(),
          };
          return cloneDeep(this.record.__archived);
        },
      },
      actions: [
        {
          label: "Ouvrir un dialog imbriqué",
          position: "top",
          handle: () => {
            this.open({ ...this.record, name: "Projet imbriqué" });
          },
        },
      ],
      connect: () => ({
        recordChanged: (value) =>
          this.connectionEvents.update((events) => [
            ...events,
            `Record : ${value?._id ?? "création"}`,
          ]),
        destroy: () =>
          this.connectionEvents.update((events) => [
            ...events,
            "Connexion libérée",
          ]),
      }),
    };
  }
  private maybeFail(): void {
    if (this.failNext) {
      this.failNext = false;
      throw new Error("Échec simulé pour la démonstration");
    }
  }
}
