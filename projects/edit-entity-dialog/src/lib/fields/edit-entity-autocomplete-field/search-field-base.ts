import {
  ChangeDetectorRef,
  Directive,
  inject,
  Input,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { EditEntityFormGroup } from "../../classes/edit-entity-form-group";
import {
  AutocompleteFormField,
  SortableListFormField,
} from "../edit-entity-field.types";
import { SearchControlService } from "../../controls/autocomplete/search-control-base";
@Directive()
export abstract class SearchFieldBase<TRecord extends { _id?: string }>
  implements OnChanges, OnDestroy
{
  @Input() record?: TRecord;
  @Input({ required: true }) formGroup!: EditEntityFormGroup;
  @Input({ required: true }) field!:
    | AutocompleteFormField<TRecord>
    | SortableListFormField<TRecord>;
  service!: SearchControlService;
  hint?: string;
  tooltip?: string;
  private subscriptions = new Subscription();
  private cdr = inject(ChangeDetectorRef);
  get multiple(): boolean {
    return this.field.kind === "sortable-list" || this.field.multiple === true;
  }
  ngOnChanges(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    if (!this.field || !this.formGroup) return;
    this.service = {
      display: (value) => this.field.service.display(value),
      search: (limit, skip, search, selected) =>
        this.field.service.search(
          limit,
          skip,
          search,
          this.record,
          this.formGroup,
          selected,
        ),
      group: this.field.service.group,
      open: this.field.service.open
        ? (value) => this.field.service.open?.(value)
        : undefined,
    };
    for (const key of ["hint", "tooltip"] as const) {
      const source = this.field[key];
      this[key] = undefined;
      if (source instanceof Observable)
        this.subscriptions.add(
          source.subscribe((value) => {
            this[key] = value;
            this.cdr.markForCheck();
          }),
        );
      else if (typeof source === "function") {
        const refresh = () => {
          this[key] = source(this.record, this.formGroup);
          this.cdr.markForCheck();
        };
        refresh();
        this.subscriptions.add(this.formGroup.valueChanges.subscribe(refresh));
      } else this[key] = source;
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
