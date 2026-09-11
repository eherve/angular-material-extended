import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HeaderDurationFilterComponent } from './header-duration-filter.component';

describe('HeaderDurationFilterComponent', () => {
  let component: HeaderDurationFilterComponent<any>;
  let fixture: ComponentFixture<HeaderDurationFilterComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderDurationFilterComponent],
      providers: [{ provide: NgControl, useValue: { control: new FormControl() } }, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderDurationFilterComponent<any>);
    component = fixture.componentInstance;
    component.column = { type: 'duration', columnDef: 'duration', header: 'Duration', property: 'duration', searchable: true } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate duration changes without a local debounce', () => {
    const onChange = jasmine.createSpy('onChange');
    component.registerOnChange(onChange);

    component.selectControl.setValue(5);

    expect(onChange).toHaveBeenCalledWith(
      jasmine.objectContaining({ unitOfTimeValue: 5, unitOfTime: 'second', value: 5000 }),
    );
  });
});
