import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  Type,
} from "@angular/core";
import { NgComponentOutlet } from "@angular/common";
import { Subscription } from "rxjs";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import { EditEntityRecord } from "../../edit-entity-dialog.types";
import { ControlFormField } from "../edit-entity-field.types";
import { EditEntityConditionalStateService } from "../../services/edit-entity-conditional-state.service";
import { EditEntityRenderService } from "../../services/edit-entity-render.service";
@Component({
  selector: "app-edit-entity-control-field",
  standalone: true,
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container
    *ngComponentOutlet="field.component; inputs: inputs"
  ></ng-container>`,
})
export class EditEntityControlFieldComponent<
    TRecord extends EditEntityRecord = EditEntityRecord,
  >
  implements OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!: ControlFormField<TRecord>;
  inputs: Record<string, unknown> = {};
  private sub?: Subscription;
  private readonly renderer = new EditEntityRenderService(
    new EditEntityConditionalStateService<TRecord>(),
  );
  constructor(private readonly cdr: ChangeDetectorRef) {}
  ngOnChanges(): void {
    this.sub?.unsubscribe();
    this.refreshInputs();
    if (this.field.fields)
      this.sub = this.formGroup.valueChanges.subscribe(() =>
        this.refreshInputs(),
      );
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  private refreshInputs(): void {
    const mapped: Record<string, unknown> = {};
    for (const [input, path] of Object.entries(this.field.fields ?? {}))
      mapped[input] = this.formGroup.get(path)?.value;
    const automatic = {
      label: this.field.label,
      control: this.formGroup.getControl(this.field.name),
      formGroup: this.formGroup,
      record: this.record,
    };
    const declared = this.renderer.filterDeclaredComponentInputs(
      (this.field.component as Type<unknown> | null) ?? undefined,
      { ...automatic, ...(this.field.inputs ?? {}), ...mapped },
    );
    this.inputs = declared;
    this.cdr.markForCheck();
  }
}
