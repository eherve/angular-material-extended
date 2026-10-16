import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "ng-template[appSectionTabsMenuHeader]",
  standalone: false,
})
export class SectionTabsMenuHeaderDirective {
  constructor(public readonly templateRef: TemplateRef<unknown>) {}
}
