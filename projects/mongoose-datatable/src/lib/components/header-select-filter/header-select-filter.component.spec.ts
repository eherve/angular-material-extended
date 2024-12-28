/** @format */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSelectFilterComponent } from './header-select-filter.component';

describe('HeaderSelectFilterComponent', () => {
  let component: HeaderSelectFilterComponent;
  let fixture: ComponentFixture<HeaderSelectFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderSelectFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderSelectFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
