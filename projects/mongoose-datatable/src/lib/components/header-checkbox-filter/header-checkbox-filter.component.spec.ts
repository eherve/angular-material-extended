import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderCheckboxFilterComponent } from './header-checkbox-filter.component';

describe('HeaderSelectFilterComponent', () => {
  let component: HeaderCheckboxFilterComponent;
  let fixture: ComponentFixture<HeaderCheckboxFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderCheckboxFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderCheckboxFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
