import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { TimeUnitSelectComponent } from './time-unit-select.component';

describe('TimeUnitSelectComponent', () => {
  let component: TimeUnitSelectComponent;
  let fixture: ComponentFixture<TimeUnitSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeUnitSelectComponent],
      providers: [{ provide: NgControl, useValue: { control: new FormControl() } }, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeUnitSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert time units', () => {
    expect(TimeUnitSelectComponent.toMilliseconds(2, 'second')).toBe(2000);
    expect(TimeUnitSelectComponent.convert(2000, 'second')).toBe(2);
  });
});
