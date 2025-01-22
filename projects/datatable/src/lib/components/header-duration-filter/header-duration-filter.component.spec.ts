import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDateFilterComponent } from './header-duration-filter.component';

describe('HeaderSelectFilterComponent', () => {
  let component: HeaderDateFilterComponent;
  let fixture: ComponentFixture<HeaderDateFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderDateFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderDateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
