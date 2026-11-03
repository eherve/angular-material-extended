/** @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DurationSegmentInputComponent } from './duration-segment-input.component';

describe('Duration segments with days', () => {
  function setup(showDays = true): ComponentFixture<DurationSegmentInputComponent> {
    const fixture = TestBed.createComponent(DurationSegmentInputComponent);
    fixture.componentRef.setInput('showDays', showDays);
    fixture.detectChanges();
    return fixture;
  }
  it('splits persisted minutes without emitting and keeps total hours in the default mode', () => {
    const f = setup();
    const changed = jasmine.createSpy();
    f.componentInstance.registerOnChange(changed);
    f.componentInstance.writeValue(3075);
    f.detectChanges();
    const inputs = f.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(Array.from(inputs, input => input.value)).toEqual(['2', '03', '15']);
    expect(changed).not.toHaveBeenCalled();
    f.componentRef.setInput('showDays', false);
    f.detectChanges();
    expect(Array.from(f.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>, i => i.value)).toEqual(
      ['51', '15'],
    );
  });
  it('converts days to minutes and normalizes overflowing hours on blur', () => {
    const f = setup();
    const changed = jasmine.createSpy();
    f.componentInstance.registerOnChange(changed);
    const inputs = f.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    for (const [index, value] of ['2', '27', '15'].entries()) {
      inputs[index].value = value;
      inputs[index].dispatchEvent(new Event('input'));
    }
    expect(changed).toHaveBeenCalledWith(4515);
    f.componentInstance.handleFocusOut(new FocusEvent('focusout'));
    f.detectChanges();
    expect(Array.from(inputs, i => i.value)).toEqual(['3', '03', '15']);
  });
  it('allows native arrow movement inside segments and crosses their boundaries in both directions', () => {
    const f = setup();
    f.componentInstance.writeValue(3075);
    f.detectChanges();
    const [days, hours, minutes] = Array.from(
      f.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>,
    );
    for (const input of [days, hours, minutes]) {
      input.focus();
      input.setSelectionRange(1, 1);
      for (const key of ['ArrowLeft', 'ArrowRight']) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        input.dispatchEvent(event);
        if (key === 'ArrowLeft' || input !== days) expect(event.defaultPrevented).toBeFalse();
      }
    }
    minutes.focus();
    minutes.setSelectionRange(0, 0);
    minutes.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement).toBe(hours);
    hours.setSelectionRange(0, 0);
    hours.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement).toBe(days);
    days.setSelectionRange(1, 1);
    days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(hours);
    expect(f.componentInstance.value).toBe(3075);
    f.destroy();
  });
  it('preserves zero, clears all segments and disables the entire input', () => {
    const f = setup();
    f.componentInstance.writeValue(0);
    f.detectChanges();
    const inputs = f.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(Array.from(inputs, i => i.value)).toEqual(['0', '00', '00']);
    f.componentInstance.writeValue(null);
    f.componentInstance.setDisabledState(true);
    f.detectChanges();
    expect(Array.from(inputs, i => i.value)).toEqual(['', '', '']);
    expect(Array.from(inputs, i => i.disabled)).toEqual([true, true, true]);
  });
});
