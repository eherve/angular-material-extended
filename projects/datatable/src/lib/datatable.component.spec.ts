import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMatDatatableComponent } from './datatable.component';

describe('MongooseDatatableComponent', () => {
  let component: NgxMatDatatableComponent;
  let fixture: ComponentFixture<NgxMatDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxMatDatatableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxMatDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
