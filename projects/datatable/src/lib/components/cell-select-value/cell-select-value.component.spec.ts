import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellSelectValueComponent } from './cell-select-value.component';

describe('CellSelectValueComponent', () => {
  let component: CellSelectValueComponent<{ status: string }>;
  let fixture: ComponentFixture<CellSelectValueComponent<{ status: string }>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellSelectValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CellSelectValueComponent<{ status: string }>);
    component = fixture.componentInstance;
    component.column = {
      type: 'select',
      columnDef: 'status',
      header: 'Status',
      property: 'status',
      options: [{ value: 'active', name: 'Active' }],
    };
    component.row = { status: 'active' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
