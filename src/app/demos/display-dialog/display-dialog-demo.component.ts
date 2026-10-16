import { Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DisplayDialogData, DisplayDialogSection, DisplayDialogService } from '@eherve/angular-material-display-dialog';
interface DemoRecord { name: string; version: number; }
@Component({selector:'app-display-dialog-demo-summary', template:'<p>{{record.name}} · version {{record.version}}</p>'})
export class DisplayDialogDemoSummary { @Input() record!: DemoRecord; }
@Component({selector:'app-display-dialog-demo',imports:[MatButtonModule],templateUrl:'./display-dialog-demo.component.html',styleUrl:'./display-dialog-demo.component.scss'})
export class DisplayDialogDemoComponent {
  private readonly dialogs = inject(DisplayDialogService);
  private readonly section: DisplayDialogSection<DemoRecord> = {id:'main',label:'Informations',cards:[{id:'identity',label:'Identité',fields:[{kind:'text',label:'Nom',path:'name'},{kind:'number',label:'Version',path:'version'}]}]};
  private config(): DisplayDialogData<DemoRecord> {
    return {record:{name:'Exemple',version:1},title:r=>r.name,showJsonDataButton:true,displayOptions:{section:this.section},actions:[{label:'Actualiser',icon:'refresh',handle:({record,setRecord})=>setRecord({...record,version:record.version+1})},{label:'Ouvrir une fiche imbriquée',handle:()=>{this.dialogs.open({record:{name:'Fiche imbriquée',version:1},displayOptions:{section:this.section}});}}]};
  }
  openDirect(): void {this.dialogs.open(this.config());}
  openLoader(): void {const {record,...options}=this.config();this.dialogs.open({...options,loadRecord:()=>new Promise<DemoRecord>(resolve=>setTimeout(()=>resolve({name:'Fiche chargée',version:1}),700))});}
  openComponent(): void {this.dialogs.open({...this.config(),displayOptions:{component:DisplayDialogDemoSummary}});}
  openTabs(): void {this.dialogs.open({...this.config(),displayOptions:{tabs:[{label:'Informations',displayOptions:{section:this.section}},{label:'Résumé',displayOptions:{component:DisplayDialogDemoSummary}}]}});}
  openSections(): void {this.dialogs.open({...this.config(),displayOptions:{sections:[this.section,{...this.section,id:'details',label:'Détails'}]}});}
}
