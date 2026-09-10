import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellCheckboxValueComponent } from './cell-checkbox-value.component';

describe('CellCheckboxValueComponent', () => {
  let component: CellCheckboxValueComponent<{ active: boolean }>;
  let fixture: ComponentFixture<CellCheckboxValueComponent<{ active: boolean }>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellCheckboxValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CellCheckboxValueComponent<{ active: boolean }>);
    component = fixture.componentInstance;
    component.column = {
      type: 'checkbox',
      columnDef: 'active',
      header: 'Active',
      property: 'active',
    };
    component.row = { active: true };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
