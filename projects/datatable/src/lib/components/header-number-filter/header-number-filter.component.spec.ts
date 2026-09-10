import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HeaderNumberFilterComponent } from './header-number-filter.component';

describe('HeaderNumberFilterComponent', () => {
  let component: HeaderNumberFilterComponent<any>;
  let fixture: ComponentFixture<HeaderNumberFilterComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderNumberFilterComponent],
      providers: [{ provide: NgControl, useValue: { control: new FormControl() } }, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderNumberFilterComponent<any>);
    component = fixture.componentInstance;
    component.column = { type: 'number', columnDef: 'value', header: 'Value', property: 'value', searchable: true } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
