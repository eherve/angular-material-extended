import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellNumberValueComponent } from './cell-number-value.component';

describe('CellNumberValueComponent', () => {
  let component: CellNumberValueComponent<{ value: number }>;
  let fixture: ComponentFixture<CellNumberValueComponent<{ value: number }>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellNumberValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CellNumberValueComponent<{ value: number }>);
    component = fixture.componentInstance;
    component.column = {
      type: 'number',
      columnDef: 'value',
      header: 'Value',
      property: 'value',
    };
    component.row = { value: 42 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
