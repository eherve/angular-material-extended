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
});
