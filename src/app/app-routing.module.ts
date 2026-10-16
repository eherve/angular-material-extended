/** @format */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'edit-entity-dialog', loadComponent: () => import('./demos/edit-entity-dialog/edit-entity-dialog-demo.component').then(m => m.EditEntityDialogDemoComponent) },
  { path: 'display-dialog', loadComponent: () => import('./demos/display-dialog/display-dialog-demo.component').then(m => m.DisplayDialogDemoComponent) },
  { path: 'sections', loadComponent: () => import('./demos/section-tabs/section-tabs-demo.component').then(m => m.SectionTabsDemoComponent) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
