import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellSelectValueComponent } from './cell-select-value.component';

describe('CellSelectValueComponent', () => {
  let component: CellSelectValueComponent;
  let fixture: ComponentFixture<CellSelectValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellSelectValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellSelectValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
