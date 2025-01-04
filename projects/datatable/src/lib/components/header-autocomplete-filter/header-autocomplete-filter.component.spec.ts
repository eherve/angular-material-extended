import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderAutocompleteFilterComponent } from './header-autocomplete-filter.component';

describe('HeaderSelectFilterComponent', () => {
  let component: HeaderAutocompleteFilterComponent;
  let fixture: ComponentFixture<HeaderAutocompleteFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderAutocompleteFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderAutocompleteFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
