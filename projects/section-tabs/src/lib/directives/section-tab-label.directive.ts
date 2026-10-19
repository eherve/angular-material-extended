import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "ng-template[appSectionTabLabel]",
  standalone: false,
})
export class SectionTabLabelDirective {
  constructor(public readonly templateRef: TemplateRef<unknown>) {}
}
