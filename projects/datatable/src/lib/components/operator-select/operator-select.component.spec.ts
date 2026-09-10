import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { OperatorSelectComponent } from './operator-select.component';

describe('OperatorSelectComponent', () => {
  let component: OperatorSelectComponent;
  let fixture: ComponentFixture<OperatorSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorSelectComponent],
      providers: [{ provide: NgControl, useValue: { control: new FormControl() } }, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
