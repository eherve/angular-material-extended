import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  signal,
} from "@angular/core";
import {
  EditEntityCard,
  EditEntityFormControl,
  EditEntityFormField,
  EditEntityFormGroup,
} from "@eherve/angular-material-forms/core";
import { FormFieldComponent } from "@eherve/angular-material-forms/fields";
import { FormCardComponent } from "../src/lib/form-card.component";

/** Template composition example: the caller owns every control and the single form. */
@Component({
  selector: "ame-standalone-form-composition-demo",
  imports: [FormFieldComponent, FormCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="form-composition-demo">
    <h2>Shared form composition</h2>
    <ame-field-card
      [card]="identityCard"
      [formGroup]="form"
      [record]="record"
    />
    <ame-field-card [card]="addressCard" [formGroup]="form" [record]="record" />
    <ame-field [field]="emailField" [formGroup]="form" [record]="record" />
    <p role="status">{{ status() }}</p>
  </div>`,
  styles: [
    `
      .form-composition-demo {
        display: grid;
        gap: 16px;
        padding: 24px;
        max-width: 900px;
        margin: auto;
      }
      h2 {
        margin: 0;
      }
    `,
  ],
})
export class StandaloneFormCompositionDemo implements OnDestroy {
  readonly record = {
    _id: "composition-demo",
    name: "Ada",
    city: "Paris",
    email: "ada@example.com",
  };
  readonly form = new EditEntityFormGroup({
    name: new EditEntityFormControl(this.record.name),
    city: new EditEntityFormControl(this.record.city),
    email: new EditEntityFormControl(this.record.email),
  });
  readonly identityCard: EditEntityCard<typeof this.record> = {
    id: "identity",
    label: "Identity",
    fields: [{ kind: "text", name: "name", label: "Name" }],
  };
  readonly addressCard: EditEntityCard<typeof this.record> = {
    id: "address",
    label: "Address",
    expandable: true,
    fields: [{ kind: "text", name: "city", label: "City" }],
  };
  readonly emailField: EditEntityFormField<typeof this.record> = {
    kind: "text",
    name: "email",
    label: "Email",
  };
  readonly status = signal("All three fields share one caller-owned form");
  private readonly changes = this.form.valueChanges.subscribe(() =>
    this.status.set(JSON.stringify(this.form.getRawValue())),
  );
  ngOnDestroy(): void {
    this.changes.unsubscribe();
    this.form.destroy();
  }
}
