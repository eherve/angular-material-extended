import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellDurationValueComponent } from './cell-duration-value.component';

describe('CellCheckboxValueComponent', () => {
  let component: CellDurationValueComponent;
  let fixture: ComponentFixture<CellDurationValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellDurationValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellDurationValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
