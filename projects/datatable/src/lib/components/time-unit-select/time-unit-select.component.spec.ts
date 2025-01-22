/** @format */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeUnitSelectComponent } from './time-unit-select.component';

describe('CellCheckboxValueComponent', () => {
  let component: TimeUnitSelectComponent;
  let fixture: ComponentFixture<TimeUnitSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeUnitSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeUnitSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
