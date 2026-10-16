import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { SectionTabsDisplayComponent } from './section-tabs-display.component';
import { SectionTabsDisplayOptions } from './section-tabs-display.types';
import { SectionTabsModule } from '../section-tabs.module';
import { SectionTabsComponent } from '../section-tabs.component';
import { SectionTabComponent } from '../section-tab.component';

@Component({ standalone: true, imports: [SectionTabsModule], template: '<app-section-tabs-display [options]="options" [queryParamKey]="selectionKey"></app-section-tabs-display>' })
class DisplayTestHostComponent {
  options: SectionTabsDisplayOptions = { data: {}, sections: [] };
  selectionKey = 'test-group';
}

@Component({ standalone: true, template: '<span>{{ custom }}</span>' })
class NarrowInputFieldComponent {
  @Input() custom?: string;
}

function createComponent(options: SectionTabsDisplayOptions): SectionTabsDisplayComponent {
  const intl = { messages: { showEmptyFields: 'Afficher les champs vides' }, changes: new Subject<void>() } as any;
  const destroyRef = { onDestroy: (_callback: () => void) => {} } as any;
  const component = new SectionTabsDisplayComponent('fr-FR', intl, { markForCheck: () => {} } as any, destroyRef);
  component.options = options;
  component.ngOnChanges();
  return component;
}

describe('SectionTabsDisplayComponent', () => {
  it('carries a field label action into its render model', () => {
    const action = { active: true, disabled: true, ariaLabel: 'Favori', onClick: jasmine.createSpy('toggle') };
    const component = createComponent({ data: { value: 'Test' }, sections: [{ id: 'main', label: 'Main', cards: [{ id: 'card', label: 'Card', fields: [{ kind: 'text', label: 'Champ', path: 'value', labelAction: action }] }] }] });
    const field = (component.viewModel.sections[0].items[0] as any).items[0];
    expect(field.labelAction).toBe(action);
  });

  it('exposes single-card section mode with the visible card count', () => {
    const component = createComponent({ data: {}, sections: [{ id: 'main', label: 'Main', sectionMode: 'single-card', cards: [{ id: 'first', label: 'First', fields: [] }, { id: 'hidden', label: 'Hidden', visible: () => false, fields: [] }] }] });
    expect(component.viewModel.sections[0].sectionMode).toBe('single-card');
    expect(component.viewModel.sections[0].cardCount).toBe(1);
  });

  it('defaults sections to the standard mode', () => {
    const component = createComponent({ data: {}, sections: [{ id: 'main', label: 'Main', cards: [{ id: 'first', label: 'First', fields: [] }] }] });
    expect(component.viewModel.sections[0].sectionMode).toBe('default');
    expect(component.viewModel.sections[0].cardCount).toBe(1);
  });

  it('renders falsy field values as filled', () => {
    const component = createComponent({ data: { zero: 0, no: false, empty: '' }, showEmptyFields: true, sections: [{ id: 'main', label: 'Main', cards: [{ id: 'card', label: 'Card', fields: [{ kind: 'text', label: 'Zero', path: 'zero' }, { kind: 'text', label: 'False', path: 'no' }, { kind: 'text', label: 'Empty', path: 'empty' }] }] }] });
    const fields = (component.viewModel.sections[0].items[0] as any).items;
    expect(fields.map((field: any) => field.filled)).toEqual([true, true, false]);
    expect(fields.map((field: any) => field.displayValue)).toEqual(['0', 'false', '—']);
  });

  it('passes custom card inputs through the card context', () => {
    @Component({ standalone: true, template: '' })
    class CustomCard { @Input() custom?: string; }
    const data = { name: 'Record' };
    const component = createComponent({ data, sections: [{ id: 'main', label: 'Main', cards: [{ id: 'card', label: 'Card', kind: 'component', component: CustomCard, componentInputs: { custom: 'provided' } }] }] });
    const card = component.viewModel.sections[0].items[0] as any;
    expect(card.componentInputs).toEqual({ custom: 'provided' });
  });

  it('forwards the selection key and stable values to the actual tabs child', async () => {
    TestBed.configureTestingModule({ imports: [DisplayTestHostComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(DisplayTestHostComponent);
    fixture.componentInstance.selectionKey = 'equipment';
    fixture.componentInstance.options = { data: {}, sections: [{ id: 'main', queryParamValue: 'overview', label: 'Main', cards: [] }, { id: 'history', queryParamValue: 'events-v2', label: 'History', cards: [] }] };
    fixture.detectChanges();
    await fixture.whenStable();
    const tabs = fixture.debugElement.query(By.directive(SectionTabsComponent)).componentInstance as SectionTabsComponent;
    const tabValues = tabs.tabItems.map(item => item.tab.queryParamValue);
    expect(tabs.queryParamKey).toBe('equipment');
    expect(tabValues).toEqual(['overview', 'events-v2']);
  });

  it('filters field component inputs to declared inputs when rendering the component', async () => {
    TestBed.configureTestingModule({ imports: [DisplayTestHostComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(DisplayTestHostComponent);
    fixture.componentInstance.options = { data: { title: 'Record' }, sections: [{ id: 'main', label: 'Main', cards: [{ id: 'card', label: 'Card', fields: [{ kind: 'component', label: 'Custom', path: 'title', component: NarrowInputFieldComponent, componentInputs: { custom: 'provided' } }] }] }] };
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.section-tabs-display__field-cell').textContent).toContain('provided');
  });

  it('refreshes the derived empty-fields label when Intl changes', () => {
    TestBed.configureTestingModule({ imports: [DisplayTestHostComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(DisplayTestHostComponent);
    fixture.componentInstance.options = { data: {}, showEmptyFieldsToggle: true, sections: [{ id: 'main', label: 'Main', cards: [] }] };
    fixture.detectChanges();
    const display = fixture.debugElement.query(By.directive(SectionTabsDisplayComponent)).componentInstance as SectionTabsDisplayComponent;
    display.intl.messages = { ...display.intl.messages, showEmptyFields: 'Show empty values' };
    display.intl.changes.next();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Show empty values');
  });

  it('preserves host SafeHtml and lets Angular sanitize ordinary HTML strings', async () => {
    TestBed.configureTestingModule({ imports: [DisplayTestHostComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(DisplayTestHostComponent);
    const sanitizer = TestBed.inject(DomSanitizer);
    fixture.componentInstance.options = { data: { trusted: sanitizer.bypassSecurityTrustHtml('<a href="javascript:alert(1)">Trusted</a>'), ordinary: '<img onerror="alert(1)">' }, showEmptyFields: true, sections: [{ id: 'main', label: 'Main', cards: [{ id: 'card', label: 'Card', fields: [{ kind: 'text', label: 'Trusted', path: 'trusted' }, { kind: 'text', label: 'Ordinary', path: 'ordinary' }] }] }] };
    fixture.detectChanges();
    await fixture.whenStable();
    const cells = fixture.nativeElement.querySelectorAll('.section-tabs-display__field-cell');
    expect(cells[0].querySelector('a')?.textContent).toBe('Trusted');
    expect(cells[0].querySelector('a')?.getAttribute('href')).toBe('javascript:alert(1)');
    expect(cells[1].querySelector('img')?.hasAttribute('onerror')).toBeFalse();
  });

  it('renders two scrollable cards in single-card mode', async () => {
    TestBed.configureTestingModule({ imports: [DisplayTestHostComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(DisplayTestHostComponent);
    fixture.componentInstance.options = { data: { value: 'Long content' }, sections: [{ id: 'main', label: 'Main', sectionMode: 'single-card', cards: [{ id: 'first', label: 'First', fields: [{ kind: 'text', label: 'Value', path: 'value' }] }, { id: 'second', label: 'Second', fields: [{ kind: 'text', label: 'Value', path: 'value' }] }] }] };
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.section-tabs-display__section--single-card > .section-tabs-display__card').length).toBe(2);
    const grids = fixture.nativeElement.querySelectorAll('.section-tabs-display__section--single-card .section-tabs-display__field-grid');
    expect(getComputedStyle(grids[0]).overflow).toBe('auto');
    expect(getComputedStyle(grids[1]).overflow).toBe('auto');
  });
});
