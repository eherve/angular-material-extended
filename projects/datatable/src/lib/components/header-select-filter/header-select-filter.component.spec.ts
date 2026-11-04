import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HeaderSelectFilterComponent } from './header-select-filter.component';

describe('HeaderSelectFilterComponent', () => {
  let component: HeaderSelectFilterComponent<any>;
  let fixture: ComponentFixture<HeaderSelectFilterComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderSelectFilterComponent],
      providers: [{ provide: NgControl, useValue: { control: new FormControl() } }, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderSelectFilterComponent<any>);
    component = fixture.componentInstance;
    component.column = { type: 'select', columnDef: 'status', header: 'Status', property: 'status', searchable: true, options: [] } as any;
    fixture.detectChanges();
  });

  it('refreshes the option collection when options arrive after a restored value', () => {
    component.writeValue({ value: 'stopped' });
    const initialOptions = component.options;
    const options = [{ value: 'stopped', name: 'À l’arrêt' }];
    Reflect.get(component, 'buildOptions').call(component, options);
    expect(component.options).not.toBe(initialOptions);
    expect(component.options).toEqual(options);
    expect(component.selectControl.value).toBe('stopped');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
