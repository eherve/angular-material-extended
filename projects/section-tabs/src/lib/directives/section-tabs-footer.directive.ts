import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "ng-template[appSectionTabsFooter]",
  standalone: false,
})
export class SectionTabsFooterDirective {
  constructor(public readonly templateRef: TemplateRef<unknown>) {}
}
