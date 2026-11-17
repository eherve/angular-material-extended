/** @format */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControlDurationComponent } from './duration.component';

@Component({
  imports: [FormsModule, FormControlDurationComponent],
  template: `<app-form-control-duration [showDays]="true" [(ngModel)]="value" />`,
})
class DurationHostComponent {
  value: number | null = 1440;
}

describe('Duration field form integration', () => {
  it('propagates edits, quick choices and clearing to ngModel without recursive emissions', async () => {
    const f = TestBed.createComponent(DurationHostComponent);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const inputs = f.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    for (const [index, value] of ['2', '03', '15'].entries()) {
      inputs[index].value = value;
      inputs[index].dispatchEvent(new Event('input'));
    }
    expect(f.componentInstance.value).toBe(3075);
    const field = f.debugElement.query(By.directive(FormControlDurationComponent))
      .componentInstance as FormControlDurationComponent;
    field.applyQuickOption(2880);
    expect(f.componentInstance.value).toBe(2880);
    field.clearValue();
    expect(f.componentInstance.value).toBeNull();
    f.destroy();
  });
});
