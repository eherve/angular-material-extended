/** @format */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorSelectComponent } from './operator-select.component';

describe('CellCheckboxValueComponent', () => {
  let component: OperatorSelectComponent;
  let fixture: ComponentFixture<OperatorSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
