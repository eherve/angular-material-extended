import { NgModule } from "@angular/core";
import { EditEntityComponent } from "./components/edit-entity-component/edit-entity-component.component";
import { EditEntityDialog } from "./components/edit-entity-dialog/edit-entity-dialog.component";
@NgModule({
  imports: [EditEntityComponent, EditEntityDialog],
  exports: [EditEntityComponent, EditEntityDialog],
})
export class EditEntityDialogModule {}
