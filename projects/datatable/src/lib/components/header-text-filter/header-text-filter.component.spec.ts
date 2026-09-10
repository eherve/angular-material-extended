import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HeaderTextFilterComponent } from './header-text-filter.component';

describe('HeaderTextFilterComponent', () => {
  let component: HeaderTextFilterComponent<any>;
  let fixture: ComponentFixture<HeaderTextFilterComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderTextFilterComponent],
      providers: [{ provide: NgControl, useValue: { control: new FormControl() } }, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderTextFilterComponent<any>);
    component = fixture.componentInstance;
    component.column = { type: 'text', columnDef: 'name', header: 'Name', property: 'name', searchable: true } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
