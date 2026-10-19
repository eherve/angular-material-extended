import { ApplicationRef, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DisplayDialogService } from './display-dialog.service';
import { DisplayDialog } from './display-dialog.component';
import { DisplayDialogIntl } from './display-dialog.intl';
import { DisplayDialogModule } from './display-dialog.module';
import { DisplayDialogData, DisplayDialogRuntimeActionButton } from './display-dialog.types';
import { DISPLAY_DIALOG_HOST } from './display-dialog-host';
const data: DisplayDialogData<{name:string}> = {record:{name:'record'}, displayOptions:{section:{id:'main',label:'Main',cards:[]}}};
describe('DisplayDialogService configuration', () => {
  let captured: MatDialogConfig;
  let service: DisplayDialogService;
  let parent: HTMLElement;
  beforeEach(() => {
    TestBed.configureTestingModule({providers:[{provide:MatDialog,useValue:{open:(_component:unknown, config:MatDialogConfig) => {captured=config; return {} as MatDialogRef<DisplayDialog<{name:string}>>;}}}]});
    service = TestBed.inject(DisplayDialogService);
    const doc = TestBed.inject(DOCUMENT);
    spyOnProperty(doc.documentElement,'clientWidth','get').and.returnValue(1200);
    spyOnProperty(doc.documentElement,'clientHeight','get').and.returnValue(800);
    parent = doc.createElement('div'); parent.className='mat-mdc-dialog-surface'; doc.body.appendChild(parent);
    spyOn(parent,'getClientRects').and.returnValue([{}] as unknown as DOMRectList);
    spyOn(parent,'getBoundingClientRect').and.returnValue({width:1000,height:700} as DOMRect);
  });
  afterEach(() => parent.remove());
  it('preservesSourceNestedDimensions', () => {service.open(data); expect(captured).toEqual(jasmine.objectContaining({width:'936px',height:'636px',maxWidth:'1168px',maxHeight:'768px',autoFocus:false,restoreFocus:false,panelClass:'display-dialog-panel',data}));});
  it('prefersExplicitNestedDimensions', () => {service.open(data,{width:'900px',height:'600px',maxWidth:'95vw',maxHeight:'92vh'}); expect(captured).toEqual(jasmine.objectContaining({width:'900px',height:'600px',maxWidth:'95vw',maxHeight:'92vh'}));});
  it('allowsIndividualNestedOverrides', () => {service.open(data,{nested:{inset:48,minHeight:680},width:'900px'});expect(captured).toEqual(jasmine.objectContaining({width:'900px',height:'680px',maxWidth:'1168px',maxHeight:'768px'}));});
  it('usesMinimumAndViewportBoundaries', () => {(parent.getBoundingClientRect as jasmine.Spy).and.returnValue({width:100,height:100} as DOMRect);service.open(data);expect(captured).toEqual(jasmine.objectContaining({width:'640px',height:'480px'}));service.open(data,{nested:{minWidth:2000,minHeight:2000}});expect(captured).toEqual(jasmine.objectContaining({width:'1168px',height:'768px'}));});
  it('usesSourceDefaultDimensionsWithoutParent', () => {parent.remove(); service.open(data); expect(captured).toEqual(jasmine.objectContaining({width:'90vw',height:'90vh',maxWidth:'90vw',maxHeight:'90vh'}));});
  it('disablesNestedSizingWithNull', () => {service.open(data,{nested:null}); expect(captured).toEqual(jasmine.objectContaining({width:'90vw',height:'90vh',maxWidth:'90vw',maxHeight:'90vh'})); expect('nested' in captured).toBeFalse();});
});
describe('DisplayDialogService with Material dialogs and default host', () => {
  beforeEach(() => TestBed.configureTestingModule({imports:[DisplayDialogModule,NoopAnimationsModule]}));
  afterEach(() => TestBed.inject(MatDialog).closeAll());
  it('preservesCloseResult', async () => {
    const result = {selected:{id:42}};
    const ref = TestBed.inject(DisplayDialogService).open({...data, actions:[{label:'Select',handle:c=>c.close(result)}]});
    TestBed.inject(ApplicationRef).tick();
    let actual:unknown; ref.afterClosed().subscribe(value=>actual=value);
    await ref.componentInstance.handleAction(ref.componentInstance.getActions('bottom')[0] as DisplayDialogRuntimeActionButton<{name:string}>);
    await new Promise(resolve=>setTimeout(resolve,0)); expect(actual).toBe(result);
  });
  it('preservesHandlerReturnResult', async () => {
    const result = {selected:true}; const ref=TestBed.inject(DisplayDialogService).open({...data,actions:[{label:'Select',closeOnHandle:true,handle:()=>result}]}); TestBed.inject(ApplicationRef).tick(); let actual:unknown; ref.afterClosed().subscribe(value=>actual=value);
    await ref.componentInstance.handleAction(ref.componentInstance.getActions('bottom')[0] as DisplayDialogRuntimeActionButton<{name:string}>); await new Promise(resolve=>setTimeout(resolve,0)); expect(actual).toBe(result);
  });
  it('worksWithoutApplicationHostProviderAndEscapesJson', async () => {
    const host=TestBed.inject(DISPLAY_DIALOG_HOST); host.showJson('Record',[{label:'Data',value:{html:'<img src=x onerror=alert(1)>'}}]);
    await new Promise(resolve=>setTimeout(resolve,0)); const element=document.querySelector('ngx-mat-display-json')!;
    expect(element.textContent).toContain('<img src=x onerror=alert(1)>'); expect(element.querySelector('img')).toBeNull();
  });
  it('defaultHostConfirmationReturnsFalseWhenCanceled', async () => {
    const confirmation=TestBed.inject(DISPLAY_DIALOG_HOST).confirm({message:'Continue?'}); const dialogs=TestBed.inject(MatDialog).openDialogs; expect(dialogs.length).toBe(1); dialogs[0].close(false); expect(await confirmation).toBeFalse();
  });
  it('refreshesDefaultHostLabelsWhileOpenAndPreservesExplicitConfirmationLabels', async () => {
    const intl=TestBed.inject(DisplayDialogIntl);const host=TestBed.inject(DISPLAY_DIALOG_HOST);
    const confirmation=host.confirm({message:'Continue?'});TestBed.inject(ApplicationRef).tick();
    intl.messages={...intl.messages,confirmTitle:'Confirm now',confirmOk:'Accept now',confirmCancel:'Cancel now'};intl.changes.next();TestBed.inject(ApplicationRef).tick();
    let element=document.querySelector('ngx-mat-display-confirmation')!;expect(element.textContent).toContain('Confirm now');expect(element.textContent).toContain('Accept now');expect(element.textContent).toContain('Cancel now');TestBed.inject(MatDialog).openDialogs[0].close(false);await confirmation;
    const explicit=host.confirm({title:'Custom title',message:'Continue?',ok:'Custom ok',cancel:'Custom cancel'});TestBed.inject(ApplicationRef).tick();intl.changes.next();TestBed.inject(ApplicationRef).tick();element=document.querySelector('ngx-mat-display-confirmation')!;expect(element.textContent).toContain('Custom title');expect(element.textContent).toContain('Custom ok');expect(element.textContent).toContain('Custom cancel');TestBed.inject(MatDialog).openDialogs[0].close(false);await explicit;
    host.showJson('Data',[]);TestBed.inject(ApplicationRef).tick();intl.messages={...intl.messages,closeLabel:'Dismiss now'};intl.changes.next();TestBed.inject(ApplicationRef).tick();expect(document.querySelector('ngx-mat-display-json')!.textContent).toContain('Dismiss now');
  });

});
