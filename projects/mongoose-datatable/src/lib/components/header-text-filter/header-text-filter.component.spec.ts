import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTextFilterComponent } from './header-text-filter.component';

describe('HeaderSelectFilterComponent', () => {
  let component: HeaderTextFilterComponent;
  let fixture: ComponentFixture<HeaderTextFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderTextFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderTextFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
