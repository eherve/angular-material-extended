import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { FormControlNumberComponent } from "./number.component";
import { FormControlTextComponent } from "../text/text.component";
import { FormControlTextareaComponent } from "../textarea/textarea.component";
import { FormControlSelectComponent } from "../select/select.component";
import { EDIT_ENTITY_DIALOG_HOST } from "../../edit-entity-dialog-host";
import { EditEntityDialogIntl } from "../../edit-entity-dialog.intl";

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormControlNumberComponent,
    FormControlTextComponent,
    FormControlTextareaComponent,
    FormControlSelectComponent,
  ],
  template: `<app-form-control-number
      [control]="form.controls.amount"
      label="Amount"
      [required]="true"
      [min]="1"
      [max]="10"
      [isInteger]="true"
      [hasCopyBtn]="true"
    ></app-form-control-number
    ><app-form-control-text
      [control]="form.controls.name"
      label="Name"
      [type]="password ? 'password' : 'email'"
      [max]="5"
      [hasCopyBtn]="true"
    ></app-form-control-text
    ><app-form-control-textarea
      [control]="form.controls.notes"
      label="Notes"
      [required]="true"
    ></app-form-control-textarea
    ><app-form-control-select
      [control]="form.controls.choice"
      [options]="[]"
      label="Choice"
      [required]="true"
    ></app-form-control-select>`,
})
class FormControlHost {
  readonly form = new FormGroup({
    amount: new FormControl<number | null>(null, Validators.required),
    name: new FormControl<string | null>(null, Validators.email),
    notes: new FormControl<string | null>(null, Validators.required),
    choice: new FormControl<string | null>(null, Validators.required),
  });
  password = false;
}

describe("Material field control accessors", () => {
  let fixture: ComponentFixture<FormControlHost>;
  const notify = jasmine.createSpy("notify");
  beforeEach(async () => {
    notify.calls.reset();
    await TestBed.configureTestingModule({
      imports: [
        FormControlHost,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
      ],
      providers: [{ provide: EDIT_ENTITY_DIALOG_HOST, useValue: { notify } }],
    }).compileComponents();
    fixture = TestBed.createComponent(FormControlHost);
    fixture.detectChanges();
  });

  it("keeps model and rendered values bound to the same engine control", () => {
    const host = fixture.componentInstance;
    const numberComponent = fixture.debugElement.query(
      By.directive(FormControlNumberComponent),
    ).componentInstance as FormControlNumberComponent;
    const values: Array<number | null> = [];
    host.form.controls.amount.valueChanges.subscribe((value) =>
      values.push(value),
    );
    host.form.controls.amount.setValue(0);
    fixture.detectChanges();
    expect(
      (
        fixture.nativeElement.querySelector(
          'input[type="number"]',
        ) as HTMLInputElement
      ).value,
    ).toBe("0");
    expect(values).toEqual([0]);
    expect(numberComponent.control).toBe(host.form.controls.amount);
  });

  it("reports user input and blur, and applies required and numeric bounds", () => {
    const input = fixture.nativeElement.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    input.value = "11";
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.amount.value).toBe(11);
    expect(fixture.componentInstance.form.controls.amount.touched).toBeTrue();
    const numberComponent = fixture.debugElement.query(
      By.directive(FormControlNumberComponent),
    ).componentInstance as FormControlNumberComponent;
    expect(numberComponent.control).toBe(
      fixture.componentInstance.form.controls.amount,
    );
    expect(numberComponent.control.valid).toBeFalse();
    expect(fixture.componentInstance.form.invalid).toBeTrue();
    fixture.componentInstance.form.controls.amount.setValue(null);
    fixture.detectChanges();
    expect(numberComponent.control.hasError("required")).toBeTrue();
  });

  it("applies textarea required validation to the engine control and reports user input", () => {
    const notes = fixture.componentInstance.form.controls.notes;
    expect(notes.hasError("required")).toBeTrue();
    expect(fixture.componentInstance.form.invalid).toBeTrue();
    const textarea = fixture.nativeElement.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "notes";
    textarea.dispatchEvent(new Event("input"));
    textarea.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(notes.value).toBe("notes");
    expect(notes.valid).toBeTrue();
    expect(notes.touched).toBeTrue();
  });

  it("clears textarea content and hides its action once empty", () => {
    const notes = fixture.componentInstance.form.controls.notes;
    notes.setValue("notes");
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector(
      "app-form-control-textarea",
    ) as HTMLElement;
    const clear = field.querySelector(
      '[aria-label="Effacer"]',
    ) as HTMLButtonElement;
    expect(clear).not.toBeNull();
    clear?.click();
    fixture.detectChanges();
    expect(notes.value).toBeNull();
    expect(notes.dirty).toBeTrue();
    expect(notes.touched).toBeTrue();
    expect(field.querySelector('[aria-label="Effacer"]')).toBeNull();
  });

  it("preserves pre-existing email and required validators across widget changes and destruction", () => {
    const { form } = fixture.componentInstance;
    const emailControl = form.controls.name;
    const amountControl = form.controls.amount;
    const notesControl = form.controls.notes;
    const choiceControl = form.controls.choice;
    const textWidget = fixture.debugElement.query(
      By.directive(FormControlTextComponent),
    ).componentInstance as FormControlTextComponent;
    const numberWidget = fixture.debugElement.query(
      By.directive(FormControlNumberComponent),
    ).componentInstance as FormControlNumberComponent;
    const textareaWidget = fixture.debugElement.query(
      By.directive(FormControlTextareaComponent),
    ).componentInstance as FormControlTextareaComponent;
    const selectWidget = fixture.debugElement.query(
      By.directive(FormControlSelectComponent),
    ).componentInstance as FormControlSelectComponent;

    expect(emailControl.hasValidator(Validators.email)).toBeTrue();
    textWidget.type = "text";
    expect(emailControl.hasValidator(Validators.email)).toBeTrue();
    numberWidget.required = false;
    textareaWidget.required = false;
    selectWidget.required = false;
    expect(amountControl.hasValidator(Validators.required)).toBeTrue();
    expect(notesControl.hasValidator(Validators.required)).toBeTrue();
    expect(choiceControl.hasValidator(Validators.required)).toBeTrue();

    fixture.destroy();
    expect(emailControl.hasValidator(Validators.email)).toBeTrue();
    expect(amountControl.hasValidator(Validators.required)).toBeTrue();
    expect(notesControl.hasValidator(Validators.required)).toBeTrue();
    expect(choiceControl.hasValidator(Validators.required)).toBeTrue();
    emailControl.setValue("not an email");
    amountControl.setValue(null);
    notesControl.setValue(null);
    choiceControl.setValue(null);
    expect(emailControl.hasError("email")).toBeTrue();
    expect(amountControl.hasError("required")).toBeTrue();
    expect(notesControl.hasError("required")).toBeTrue();
    expect(choiceControl.hasError("required")).toBeTrue();
  });

  it("propagates disabled state to the actual input", () => {
    fixture.componentInstance.form.controls.name.disable();
    fixture.detectChanges();
    expect(
      (
        fixture.nativeElement.querySelector(
          'input[type="email"]',
        ) as HTMLInputElement
      ).disabled,
    ).toBeTrue();
  });

  it("refreshes the required message when Intl changes", () => {
    const intl = TestBed.inject(EditEntityDialogIntl);
    const numberComponent = fixture.debugElement.query(
      By.directive(FormControlNumberComponent),
    ).componentInstance as FormControlNumberComponent;
    numberComponent.control.markAsTouched();
    numberComponent.control.updateValueAndValidity();
    intl.messages.required = "Required now";
    intl.changes.next();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Required now");
  });

  it("adds email and length validators to the engine control and renders custom unique errors", () => {
    const name = fixture.componentInstance.form.controls.name;
    name.setValue("not-an-email-long");
    fixture.detectChanges();
    expect(name.hasError("email")).toBeTrue();
    expect(name.hasError("maxlength")).toBeTrue();
    expect(fixture.componentInstance.form.invalid).toBeTrue();
    name.setErrors({ unique: true });
    name.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Existe déjà");
  });

  it("shows copy and password visibility actions with the package host", async () => {
    const writeText = jasmine.createSpy().and.resolveTo();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    fixture.componentInstance.form.controls.name.setValue("secret");
    fixture.detectChanges();
    const copy = fixture.nativeElement.querySelectorAll(
      '[aria-label="Copier"]',
    )[1] as HTMLButtonElement;
    copy.click();
    await fixture.whenStable();
    expect(writeText).toHaveBeenCalledWith("secret");
    expect(notify).toHaveBeenCalledWith("Copié");

    fixture.componentInstance.form.controls.amount.setValue(7);
    fixture.detectChanges();
    const numberCopy = fixture.nativeElement.querySelectorAll(
      '[aria-label="Copier"]',
    )[0] as HTMLButtonElement;
    numberCopy.click();
    await fixture.whenStable();
    expect(writeText).toHaveBeenCalledWith("7");

    fixture.componentInstance.password = true;
    fixture.detectChanges();
    const passwordInput = fixture.nativeElement.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    expect(passwordInput).not.toBeNull();
    const show = fixture.nativeElement.querySelector(
      '[aria-label="Afficher le mot de passe"]',
    ) as HTMLButtonElement;
    show.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('input[type="text"]'),
    ).not.toBeNull();
    const hide = fixture.nativeElement.querySelector(
      '[aria-label="Masquer le mot de passe"]',
    ) as HTMLButtonElement;
    hide.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('input[type="password"]'),
    ).not.toBeNull();
  });
});
