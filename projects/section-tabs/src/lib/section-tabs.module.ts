import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SectionTabComponent } from "./section-tab.component";
import { SectionTabsComponent } from "./section-tabs.component";
import { SectionTabsDisplayComponent } from "./section-tabs-display/section-tabs-display.component";
import { SectionTabContentDirective } from "./directives/section-tab-content.directive";
import { SectionTabLabelDirective } from "./directives/section-tab-label.directive";
import { SectionTabsDisplayResponsiveGridDirective } from "./directives/section-tabs-display-responsive-grid.directive";
import { SectionTabsFooterDirective } from "./directives/section-tabs-footer.directive";
import { SectionTabsMenuHeaderDirective } from "./directives/section-tabs-menu-header.directive";

const declarations = [
  SectionTabsComponent,
  SectionTabComponent,
  SectionTabsDisplayComponent,
  SectionTabLabelDirective,
  SectionTabContentDirective,
  SectionTabsMenuHeaderDirective,
  SectionTabsFooterDirective,
  SectionTabsDisplayResponsiveGridDirective,
];

@NgModule({
  declarations,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatRippleModule, MatSlideToggleModule, MatTooltipModule],
  exports: [
    SectionTabsComponent,
    SectionTabComponent,
    SectionTabsDisplayComponent,
    SectionTabLabelDirective,
    SectionTabContentDirective,
    SectionTabsMenuHeaderDirective,
    SectionTabsFooterDirective,
  ],
})
export class SectionTabsModule {}
