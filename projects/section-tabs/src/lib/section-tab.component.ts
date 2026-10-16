/** @format */

import {
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnDestroy,
  booleanAttribute,
  ChangeDetectionStrategy,
} from "@angular/core";
import { Subject } from "rxjs";
import { SectionTabContentDirective } from "./directives/section-tab-content.directive";
import { SectionTabLabelDirective } from "./directives/section-tab-label.directive";

export type SectionTabCounter = number | string | null | undefined;
export type SectionTabType = "button" | "separator";

@Component({
  selector: "app-section-tab",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SectionTabComponent implements OnChanges, OnDestroy {
  @Input() type: SectionTabType = "button";
  @Input() queryParamValue?: string;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() done: SectionTabCounter;
  @Input() total: SectionTabCounter;
  @Input() totalMax: SectionTabCounter;
  @Input() progress = true;
  @Input() statusColor? = "#607286";
  @Input() statusColorDone?: string;
  @Input() statusColorTotal?: string;

  @ContentChild(SectionTabLabelDirective)
  labelDirective?: SectionTabLabelDirective;

  @ContentChild(SectionTabContentDirective)
  contentDirective?: SectionTabContentDirective;

  readonly stateChanges = new Subject<void>();

  ngOnChanges(): void {
    this.stateChanges.next();
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
  }
}
