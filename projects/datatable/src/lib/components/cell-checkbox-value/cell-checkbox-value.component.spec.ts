import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellCheckboxValueComponent } from './cell-checkbox-value.component';

describe('CellCheckboxValueComponent', () => {
  let component: CellCheckboxValueComponent;
  let fixture: ComponentFixture<CellCheckboxValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellCheckboxValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellCheckboxValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
