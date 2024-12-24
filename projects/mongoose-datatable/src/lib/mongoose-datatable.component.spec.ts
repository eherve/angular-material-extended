import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongooseDatatableComponent } from './mongoose-datatable.component';

describe('MongooseDatatableComponent', () => {
  let component: MongooseDatatableComponent;
  let fixture: ComponentFixture<MongooseDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MongooseDatatableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MongooseDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
