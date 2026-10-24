import { NgModule } from '@angular/core';
import { OrganigramComponent } from './organigram.component';
import { OrganigramGraphComponent } from './graph/organigram-graph.component';

@NgModule({
  imports: [OrganigramComponent, OrganigramGraphComponent],
  exports: [OrganigramComponent, OrganigramGraphComponent],
})
export class OrganigramModule {}
