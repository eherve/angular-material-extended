import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellDurationValueComponent } from './cell-duration-value.component';

describe('CellDurationValueComponent', () => {
  let component: CellDurationValueComponent<{ duration: number }>;
  let fixture: ComponentFixture<CellDurationValueComponent<{ duration: number }>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellDurationValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CellDurationValueComponent<{ duration: number }>);
    component = fixture.componentInstance;
    component.column = {
      type: 'duration',
      columnDef: 'duration',
      header: 'Duration',
      property: 'duration',
    };
    component.setRow = { duration: 1000 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
