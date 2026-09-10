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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
