import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HeaderDateFilterComponent } from './header-date-filter.component';

describe('HeaderDateFilterComponent', () => {
  let component: HeaderDateFilterComponent<any>;
  let fixture: ComponentFixture<HeaderDateFilterComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderDateFilterComponent],
      providers: [{ provide: NgControl, useValue: { control: new FormControl() } }, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderDateFilterComponent<any>);
    component = fixture.componentInstance;
    component.column = { type: 'date', columnDef: 'date', header: 'Date', property: 'date', searchable: true } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate date changes without a local debounce', () => {
    const onChange = jasmine.createSpy('onChange');
    component.registerOnChange(onChange);

    component.selectControl.setValue(new Date('2026-09-10T00:00:00.000Z'));

    expect(onChange).toHaveBeenCalled();
  });
});
