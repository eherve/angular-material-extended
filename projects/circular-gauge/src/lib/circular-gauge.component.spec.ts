import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CircularGaugeComponent } from './circular-gauge.component';

describe('CircularGaugeComponent', () => {
  let fixture: ComponentFixture<CircularGaugeComponent>;
  let host: HTMLElement;
  beforeEach(() => {
    fixture = TestBed.createComponent(CircularGaugeComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('label', 'Completion');
    fixture.componentRef.setInput('text', '42');
    fixture.componentRef.setInput('suffix', '%');
  });
  it('renders bounded progress and reacts to input changes', () => {
    for (const [progress, expected] of [[-5, '0%'], [150, '100%'], [42, '42%'], ['73.5extra', '73.5%'], [NaN, '0%'], [Infinity, '0%'], ['invalid', '0%']] as const) {
      fixture.componentRef.setInput('progress', progress);
      fixture.detectChanges();
      expect(host.style.getPropertyValue('--gauge-progress')).toBe(expected);
      expect(host.querySelector('strong')?.textContent).toBe('42');
    }
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Completion : 42%');
  });
  it('renders unavailable progress without a suffix and allows localization', () => {
    fixture.detectChanges();
    expect(host.querySelector('strong')?.textContent).toBe('—');
    expect(host.querySelector('span')).toBeNull();
    expect(host.getAttribute('aria-label')).toBe('Completion : Non calculable');
    expect(host.style.getPropertyValue('--gauge-progress')).toBe('0%');
    fixture.componentRef.setInput('unavailableLabel', 'Unavailable');
    fixture.detectChanges();
    expect(host.getAttribute('aria-label')).toBe('Completion : Unavailable');
    fixture.componentRef.setInput('progress', 42);
    fixture.detectChanges();
    expect(host.querySelector('span')?.textContent).toBe('%');
  });
  it('uses public theme tokens, explicit color overrides and compact dimensions', () => {
    host.style.setProperty('--ngx-mat-circular-gauge-color', 'rgb(1, 2, 3)');
    host.style.setProperty('--ngx-mat-circular-gauge-track-color', 'rgb(4, 5, 6)');
    host.style.setProperty('--ngx-mat-circular-gauge-surface-color', 'rgb(7, 8, 9)');
    fixture.componentRef.setInput('progress', 42);
    fixture.detectChanges();
    const gauge = host.querySelector('.gauge') as HTMLElement;
    expect(getComputedStyle(gauge).width).toBe('148px');
    expect(getComputedStyle(gauge, '::before').width).toBe('116px');
    expect(getComputedStyle(gauge).backgroundImage).toContain('rgb(1, 2, 3)');
    expect(getComputedStyle(gauge).backgroundImage).toContain('rgb(4, 5, 6)');
    expect(getComputedStyle(gauge, '::before').backgroundColor).toBe('rgb(7, 8, 9)');
    fixture.componentRef.setInput('color', 'rgb(10, 11, 12)');
    fixture.componentRef.setInput('compact', true);
    host.style.setProperty('--ngx-mat-circular-gauge-value-font-size', '17px');
    fixture.detectChanges();
    expect(getComputedStyle(gauge).backgroundImage).toContain('rgb(10, 11, 12)');
    expect(host.classList.contains('compact')).toBeTrue();
    expect(getComputedStyle(gauge).width).toBe('85px');
    expect(getComputedStyle(gauge, '::before').width).toBe('70px');
    expect(getComputedStyle(host.querySelector('strong')!).fontSize).toBe('17px');
  });
});
