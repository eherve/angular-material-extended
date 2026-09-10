import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HeaderCheckboxFilterComponent } from './header-checkbox-filter.component';

describe('HeaderCheckboxFilterComponent', () => {
  let component: HeaderCheckboxFilterComponent<any>;
  let fixture: ComponentFixture<HeaderCheckboxFilterComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderCheckboxFilterComponent],
      providers: [{ provide: NgControl, useValue: { control: new FormControl() } }, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderCheckboxFilterComponent<any>);
    component = fixture.componentInstance;
    component.column = { type: 'checkbox', columnDef: 'active', header: 'Active', property: 'active', searchable: true } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
