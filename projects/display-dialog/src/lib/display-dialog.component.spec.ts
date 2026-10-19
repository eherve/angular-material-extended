import { Component, ErrorHandler, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY, Subject } from 'rxjs';
import { DisplayDialog } from './display-dialog.component';
import { DisplayDialogIntl } from './display-dialog.intl';
import { DisplayDialogModule } from './display-dialog.module';
import { DisplayDialogData, DisplayDialogRuntimeActionButton } from './display-dialog.types';
import { DISPLAY_DIALOG_HOST } from './display-dialog-host';
@Component({selector: 'test-custom', template: '<span class="custom">{{record.name}} {{caption}}</span>'})
class Custom { @Input() record!: {name: string}; @Input() caption = ''; }
type R = {name: string};
const section = {id: 'main', label: 'Main', cards: [{id: 'identity', label: 'Identity', fields: [{kind: 'text', label: 'Name', path: 'name'}]}]};
const direct = (name: string): DisplayDialogData<R> => ({record: {name}, title: r => r.name, displayOptions: {section}});
const deferred = <T>() => {let resolve!: (value: T) => void; const promise = new Promise<T>(r => resolve = r); return {promise, resolve};};
describe('DisplayDialog lifecycle and actions', () => {
  let fixture: ComponentFixture<DisplayDialog<R>>;
  let errors: unknown[];
  let confirmed: boolean;
  beforeEach(async () => {
    errors = []; confirmed = true;
    await TestBed.configureTestingModule({imports: [DisplayDialogModule, NoopAnimationsModule, Custom], providers: [
      {provide: ErrorHandler, useValue: {handleError: (e: unknown) => errors.push(e)}},
      {provide: DISPLAY_DIALOG_HOST, useValue: {confirm: async () => confirmed, showJson: () => {}}}
    ]}).compileComponents();
    fixture = TestBed.createComponent(DisplayDialog<R>);
  });
  const settle = async () => {await fixture.whenStable(); fixture.detectChanges();};
  const button = () => fixture.componentInstance.getActions('bottom')[0] as DisplayDialogRuntimeActionButton<R>;
  it('ignoresStaleLoader', async () => {
    const old = deferred<R>(); const records: string[] = [];
    fixture.componentRef.setInput('data', {...direct('unused'), record: undefined, loadRecord: () => old.promise, connect: () => ({recordChanged: (r: R) => records.push(r.name)})});
    fixture.detectChanges();
    fixture.componentRef.setInput('data', {...direct('new'), connect: () => ({recordChanged: (r: R) => records.push(r.name)})});
    fixture.detectChanges(); await settle(); old.resolve({name: 'old'}); await settle();
    expect(fixture.nativeElement.textContent).toContain('new'); expect(records).toEqual(['new']);
  });
  it('doesNotNotifyAfterDestroy', async () => {
    const pending = deferred<R>(); const records: R[] = [];
    fixture.componentRef.setInput('data', {loadRecord: () => pending.promise, displayOptions: {section}, connect: () => ({recordChanged: (r: R) => records.push(r)})});
    fixture.detectChanges(); fixture.destroy(); pending.resolve({name:'late'}); await pending.promise; await Promise.resolve();
    expect(records).toEqual([]); expect(errors).toEqual([]); expect(fixture.componentInstance.title).toBe('');
  });
  it('refreshesRecordAndActions', async () => {
    const records: string[] = [];
    fixture.componentRef.setInput('data', {...direct('first'), displayOptions: {component: Custom, input: ({record}: {record:R}) => ({caption: record.name, undeclared: 42})}, connect: () => ({recordChanged: (r: R) => records.push(r.name), actions: [{component: Custom, position: 'top', input: ({record}: {record:R}) => ({caption: record.name, undeclared: 42})}]}), actions: [{label:'Refresh', handle: (c: {setRecord: (r:R) => void}) => c.setRecord({name:'second'})}, {label:'Conditional', visible: ({record}: {record:R}) => record.name === 'second', handle: () => {}}]});
    fixture.detectChanges(); await settle(); await fixture.componentInstance.handleAction(button()); await settle();
    expect(fixture.componentInstance.title).toBe('second'); expect(records).toEqual(['first','second']);
    expect(fixture.componentInstance.getActions('bottom').length).toBe(2);
    const children = fixture.debugElement.queryAll(By.directive(Custom));
    expect(children.length).toBe(2); expect(children.map(c => c.componentInstance.caption)).toEqual(['second','second']);
    expect(children.every(c => !('undeclared' in c.componentInstance))).toBeTrue();
  });
  it('cleansEachConnectionOnce', async () => {
    const cleanup: number[] = []; let id = 0;
    const data = {...direct('one'), connect: () => {const instance = ++id; return {destroy: () => cleanup.push(instance)};}};
    fixture.componentRef.setInput('data', data); fixture.detectChanges(); await settle();
    const other = TestBed.createComponent(DisplayDialog<R>); other.componentRef.setInput('data', data); other.detectChanges(); await other.whenStable();
    fixture.componentRef.setInput('data', {...data}); fixture.detectChanges(); await settle();
    fixture.destroy(); other.destroy(); expect(cleanup).toEqual([1,3,2]); expect(data.actions).toBeUndefined();
  });
  it('cancelsConfirmedAction', async () => {
    confirmed = false; let writes = 0;
    fixture.componentRef.setInput('data', {...direct('one'), actions:[{label:'Run', confirm:'Sure?', handle:()=>writes++}]}); fixture.detectChanges(); await settle();
    await fixture.componentInstance.handleAction(button()); expect(writes).toBe(0); expect(fixture.componentInstance.handlingAction).toBeFalse();
  });
  it('recoversFromRejectedAction', async () => {
    const failure = new Error('private detail');
    fixture.componentRef.setInput('data', {...direct('one'), actions:[{label:'Run', closeOnHandle:true, handle:()=>Promise.reject(failure)}]}); fixture.detectChanges(); await settle();
    await fixture.componentInstance.handleAction(button()); await settle();
    expect(fixture.componentInstance.handlingAction).toBeFalse(); expect(fixture.nativeElement.textContent).toContain('Impossible'); expect(fixture.nativeElement.textContent).not.toContain('private detail'); expect(errors).toEqual([failure]); expect(fixture.componentInstance.title).toBe('one');
  });
  it('usesFirstObservableValue', async () => {
    const source = new Subject<R>(); const records: string[]=[];
    fixture.componentRef.setInput('data', {loadRecord:()=>source, displayOptions:{section}, connect:()=>({recordChanged:(r:R)=>records.push(r.name)})}); fixture.detectChanges();
    source.next({name:'first'}); source.next({name:'second'}); await settle(); expect(records).toEqual(['first']); expect(source.observed).toBeFalse();
  });
  it('showsEmptyObservableWithoutRecordCallbacks', async () => {
    const records: R[]=[];
    fixture.componentRef.setInput('data', {loadRecord:()=>EMPTY, emptyLabel:'No record', displayOptions:{section}, connect:()=>({recordChanged:(r:R)=>records.push(r)})}); fixture.detectChanges(); await settle(); expect(fixture.nativeElement.textContent).toContain('No record'); expect(records).toEqual([]);
  });
  for (const [kind, options] of Object.entries({section:{section}, sections:{sections:[section]}, tabs:{tabs:[{label:'Overview',displayOptions:{section}}]}, component:{component:Custom}})) {
    it(`renders ${kind} root`, async () => {fixture.componentRef.setInput('data',{...direct('Visible record'), displayOptions:options}); fixture.detectChanges(); await settle(); expect(fixture.nativeElement.textContent).toContain('Visible record');});
  }
  it('reportsConnectionErrorsAndStillCleansUp', async () => {
    let destroyed = 0; const failure = new Error('connection');
    fixture.componentRef.setInput('data', {...direct('one'), connect:()=>({recordChanged:()=>{throw failure;}, destroy:()=>{destroyed++; throw failure;}})}); fixture.detectChanges(); await settle(); fixture.destroy(); expect(destroyed).toBe(1); expect(errors).toEqual([failure,failure]);
  });
  it('cleansConnectionAfterRejectedLoader', async () => {
    let destroyed = 0; const failure = new Error('backend'); const order: string[]=[];
    fixture.componentRef.setInput('data',{loadRecord:()=>{order.push('load');return Promise.reject(failure);},errorLabel:'Unavailable',displayOptions:{section},connect:()=>{order.push('connect');return {recordChanged:()=>order.push('record'),destroy:()=>destroyed++};}});
    fixture.detectChanges(); await settle(); expect(order).toEqual(['connect','load']); expect(fixture.nativeElement.textContent).toContain('Unavailable'); expect(errors).toEqual([failure]); fixture.destroy(); expect(destroyed).toBe(1);
  });
  it('doesNotConfirmDisabledAction', async () => {
    let confirmations=0; let writes=0;
    TestBed.inject(DISPLAY_DIALOG_HOST).confirm = async () => {confirmations++;return true;};
    fixture.componentRef.setInput('data',{...direct('one'),actions:[{label:'Disabled',disabled:true,confirm:'Continue?',handle:()=>writes++}]});fixture.detectChanges();await settle();await fixture.componentInstance.handleAction(button());expect(confirmations).toBe(0);expect(writes).toBe(0);
  });
  it('ignoresRetainedContextAfterDestroy', async () => {
    let context!: {setRecord:(r:R)=>void}; const records:string[]=[];
    fixture.componentRef.setInput('data',{...direct('one'),connect:()=>({recordChanged:(r:R)=>records.push(r.name)}),actions:[{label:'Capture',handle:(c: {setRecord:(r:R)=>void})=>{context=c;}}]});fixture.detectChanges();await settle();await fixture.componentInstance.handleAction(button());fixture.destroy();context.setRecord({name:'late'});expect(records).toEqual(['one']);
  });
  it('unsubscribesPendingObservableOnDestroy', async () => {
    const source = new Subject<R>();fixture.componentRef.setInput('data',{loadRecord:()=>source,displayOptions:{section}});fixture.detectChanges();expect(source.observed).toBeTrue();fixture.destroy();expect(source.observed).toBeFalse();
  });
  it('keepsConnectionActionStatePerOpening', async () => {
    let id=0;
    const config={...direct('one'),actions:[{label:'Configured',handle:()=>{}}],connect:()=>{const instance=++id;return {actions:[{component:Custom,position:'bottom' as const,input:{caption:'connection '+instance}}]};}};
    fixture.componentRef.setInput('data',config);fixture.detectChanges();await settle();
    const other=TestBed.createComponent(DisplayDialog<R>);other.componentRef.setInput('data',config);other.detectChanges();await other.whenStable();other.detectChanges();
    expect(fixture.debugElement.query(By.directive(Custom)).componentInstance.caption).toBe('connection 1');expect(other.debugElement.query(By.directive(Custom)).componentInstance.caption).toBe('connection 2');expect(config.actions.length).toBe(1);expect(fixture.componentInstance.getActions('bottom').length).toBe(2);other.destroy();
  });

  it('refreshesActiveDefaultLabelsWhenLanguageChanges', async () => {
    const pending=deferred<R>();const intl=TestBed.inject(DisplayDialogIntl);
    fixture.componentRef.setInput('data',{loadRecord:()=>pending.promise,displayOptions:{section}});fixture.detectChanges();
    intl.messages={...intl.messages,loadingLabel:'Loading now',closeLabel:'Close now'};intl.changes.next();fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading now');
    pending.resolve({name:'record'});await settle();fixture.componentRef.setInput('data',{...direct('record'),showCloseButton:true});fixture.detectChanges();await settle();
    intl.messages={...intl.messages,closeLabel:'Close translated'};intl.changes.next();fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Close translated"]')).not.toBeNull();
    fixture.destroy();expect(intl.changes.observed).toBeFalse();
  });
  it('refreshesEmptyAndErrorLabelsAndKeepsExplicitOverrides', async () => {
    const intl=TestBed.inject(DisplayDialogIntl);
    fixture.componentRef.setInput('data',{loadRecord:()=>EMPTY,displayOptions:{section}});fixture.detectChanges();await settle();
    intl.messages={...intl.messages,emptyLabel:'No data now'};intl.changes.next();fixture.detectChanges();expect(fixture.nativeElement.textContent).toContain('No data now');
    fixture.componentRef.setInput('data',{loadRecord:()=>Promise.reject(new Error('load')),displayOptions:{section}});fixture.detectChanges();await settle();
    intl.messages={...intl.messages,errorLabel:'Loading failed now'};intl.changes.next();fixture.detectChanges();expect(fixture.nativeElement.textContent).toContain('Loading failed now');
    const pending=deferred<R>();fixture.componentRef.setInput('data',{loadRecord:()=>pending.promise,loadingLabel:'Custom loading',emptyLabel:'Custom empty',closeLabel:'Custom close',displayOptions:{section}});fixture.detectChanges();
    intl.messages={...intl.messages,loadingLabel:'Other loading',emptyLabel:'Other empty',closeLabel:'Other close'};intl.changes.next();fixture.detectChanges();expect(fixture.nativeElement.textContent).toContain('Custom loading');expect(fixture.componentInstance.closeLabel).toBe('Custom close');
    pending.resolve(null as unknown as R);await settle();intl.changes.next();fixture.detectChanges();expect(fixture.nativeElement.textContent).toContain('Custom empty');
  });
  it('refreshesRenderedActionFailureTranslation', async () => {
    const intl=TestBed.inject(DisplayDialogIntl);fixture.componentRef.setInput('data',{...direct('one'),actions:[{label:'Run',handle:()=>Promise.reject(new Error('action'))}]});fixture.detectChanges();await settle();await fixture.componentInstance.handleAction(button());
    intl.messages={...intl.messages,actionErrorLabel:'Action failed now'};intl.changes.next();fixture.detectChanges();expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toBe('Action failed now');
  });
  it('usesInheritedPublicThemeVariables', async () => {
    const host=fixture.nativeElement as HTMLElement;
    const values={primary:'#112233',background:'#223344',text:'#334455',muted:'#445566',border:'#556677','header-background':'#667788','header-text':'#778899'};
    for(const [name,value] of Object.entries(values))host.style.setProperty('--ngx-mat-display-dialog-'+name,value);
    fixture.componentRef.setInput('data',{...direct('themed'),subtitle:'Subtitle'});fixture.detectChanges();await settle();
    expect(getComputedStyle(host).color).toBe('rgb(51, 68, 85)');
    const header=host.querySelector('.display-dialog-title')!;
    expect(getComputedStyle(header).backgroundColor).toBe('rgb(102, 119, 136)');expect(getComputedStyle(header).color).toBe('rgb(119, 136, 153)');expect(getComputedStyle(header).borderBottomColor).toBe('rgb(85, 102, 119)');
    expect(getComputedStyle(host.querySelector('.display-dialog-content')!).backgroundColor).toBe('rgb(34, 51, 68)');
    fixture.componentRef.setInput('data',{loadRecord:()=>EMPTY,displayOptions:{section}});fixture.detectChanges();await settle();
    expect(getComputedStyle(host.querySelector('.display-dialog-empty-state')!).color).toBe('rgb(68, 85, 102)');expect(getComputedStyle(host.querySelector('.display-dialog-empty-state mat-icon')!).color).toBe('rgb(17, 34, 51)');
  });

});
