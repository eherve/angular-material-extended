import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellDateValueComponent } from './cell-date-value.component';

describe('CellCheckboxValueComponent', () => {
  let component: CellDateValueComponent;
  let fixture: ComponentFixture<CellDateValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellDateValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellDateValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
