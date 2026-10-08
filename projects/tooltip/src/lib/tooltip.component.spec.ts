import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMatTooltipComponent } from './tooltip.component';
import { NgxMatTooltipModule } from './tooltip.module';

describe('NgxMatTooltipComponent', () => {
  let component: NgxMatTooltipComponent;
  let fixture: ComponentFixture<NgxMatTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxMatTooltipModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxMatTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
