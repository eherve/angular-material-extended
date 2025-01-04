import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderNumberFilterComponent } from './header-number-filter.component';

describe('HeaderSelectFilterComponent', () => {
  let component: HeaderNumberFilterComponent;
  let fixture: ComponentFixture<HeaderNumberFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderNumberFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderNumberFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
