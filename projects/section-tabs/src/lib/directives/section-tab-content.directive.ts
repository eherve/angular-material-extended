import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "ng-template[appSectionTabContent]",
  standalone: false,
})
export class SectionTabContentDirective {
  constructor(public readonly templateRef: TemplateRef<unknown>) {}
}
