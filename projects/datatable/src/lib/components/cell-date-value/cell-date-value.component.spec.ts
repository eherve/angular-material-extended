import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellDateValueComponent } from './cell-date-value.component';

describe('CellDateValueComponent', () => {
  let component: CellDateValueComponent<{ date: Date }>;
  let fixture: ComponentFixture<CellDateValueComponent<{ date: Date }>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellDateValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CellDateValueComponent<{ date: Date }>);
    component = fixture.componentInstance;
    component.column = {
      type: 'date',
      columnDef: 'date',
      header: 'Date',
      property: 'date',
    };
    component.setRow = { date: new Date('2026-01-01T00:00:00.000Z') };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
