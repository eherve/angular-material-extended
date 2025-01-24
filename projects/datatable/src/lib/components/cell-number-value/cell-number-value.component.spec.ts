import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellNumberValueComponent } from './cell-number-value.component';

describe('CellCheckboxValueComponent', () => {
  let component: CellNumberValueComponent;
  let fixture: ComponentFixture<CellNumberValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellNumberValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellNumberValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
