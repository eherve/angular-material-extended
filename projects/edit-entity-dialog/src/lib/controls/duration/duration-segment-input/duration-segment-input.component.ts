/** @format */

import {
  ElementRef,
  Component,
  DoCheck,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  input,
  Optional,
  Self,
  ViewChild,
  forwardRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject, Subscription } from 'rxjs';

type DurationControlValue = number | null;
type DurationSegmentName = 'days' | 'hours' | 'minutes';

const AllowedEditingKeys = new Set<string>([
  'ArrowLeft',
  'ArrowRight',
  'Backspace',
  'Delete',
  'End',
  'Enter',
  'Escape',
  'Home',
  'Tab',
]);
const DigitKeyPattern = /^\d$/;

let nextDurationSegmentInputId = 0;

@Component({
  selector: 'app-duration-segment-input',
  templateUrl: './duration-segment-input.component.html',
  styleUrl: './duration-segment-input.component.scss',
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: forwardRef((): typeof DurationSegmentInputComponent => DurationSegmentInputComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'duration-segment-input-host',
    '[attr.id]': 'id',
    '[attr.aria-describedby]': 'describedByIds.join(" ")',
    '(focusin)': 'handleFocusIn()',
    '(focusout)': 'handleFocusOut($event)',
  },
})
export class DurationSegmentInputComponent
  implements ControlValueAccessor, DoCheck, MatFormFieldControl<DurationControlValue>, OnDestroy, OnInit, OnChanges
{
  readonly showDays = input(false);
  @Input() daysLabel = 'Jours';
  @Input() hoursLabel = 'Heures';
  @Input() minutesLabel = 'Minutes';
  @Input() daysUnit = 'j';
  @Input() hoursUnit = 'h';
  @Input() minutesUnit = 'min';

  @ViewChild('daysInput') daysInput!: ElementRef<HTMLInputElement>;
  @ViewChild('hoursInput') hoursInput!: ElementRef<HTMLInputElement>;
  @ViewChild('minutesInput') minutesInput!: ElementRef<HTMLInputElement>;

  @Input('placeholder')
  set setPlaceholder(placeholder: string | undefined) {
    this.placeholder = placeholder ?? '';
    this.syncPlaceholderSegments();
    this.refreshViewState();
    this.stateChanges.next();
  }

  @Input('required')
  set setRequired(isRequired: boolean) {
    this.requiredInput = isRequired !== false;
    this.syncControlStateFromNgControl();
  }

  @Input('disabled')
  set setDisabled(isDisabled: any) {
    this.setDisabledState(isDisabled !== false);
  }

  readonly stateChanges = new Subject<void>();
  readonly controlType = 'app-duration-segment-input';
  readonly disableAutomaticLabeling = true;
  readonly id = `app-duration-segment-input-${nextDurationSegmentInputId++}`;
  readonly daysInputId = `${this.id}-days`;
  readonly hoursInputId = `${this.id}-hours`;
  readonly minutesInputId = `${this.id}-minutes`;

  value: DurationControlValue = null;
  placeholder = '';
  focused = false;
  empty = true;
  shouldLabelFloat = false;
  required = false;
  disabled = false;
  errorState = false;
  describedByIds: string[] = [];
  hoursPlaceholder = '';
  minutesPlaceholder = '';
  visibleHoursPlaceholder = '';
  visibleMinutesPlaceholder = '';

  daysControl = new FormControl<string>('', { nonNullable: true });
  hoursControl = new FormControl<string>('', { nonNullable: true });
  minutesControl = new FormControl<string>('', { nonNullable: true });

  onChange: (value: DurationControlValue) => void = (_value: DurationControlValue): void => {};
  onTouched: () => void = (): void => {};

  private requiredInput = false;
  private syncingSegments = false;
  private subscriptions = new Subscription();

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl | null,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnChanges(): void {
    this.syncSegmentsFromValue(this.value);
    this.refreshViewState();
    this.stateChanges.next();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.daysControl.valueChanges.subscribe((value: string): void => this.onSegmentControlValueChange('days', value)),
    );
    this.subscriptions.add(
      this.hoursControl.valueChanges.subscribe((value: string): void =>
        this.onSegmentControlValueChange('hours', value),
      ),
    );
    this.subscriptions.add(
      this.minutesControl.valueChanges.subscribe((value: string): void =>
        this.onSegmentControlValueChange('minutes', value),
      ),
    );
    if (this.ngControl?.control) {
      this.subscriptions.add(
        this.ngControl.control.statusChanges.subscribe((): void => this.syncControlStateFromNgControl()),
      );
    }
    this.syncControlStateFromNgControl();
    this.refreshViewState();
  }

  ngDoCheck(): void {
    this.syncControlStateFromNgControl();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stateChanges.complete();
  }

  writeValue(value: DurationControlValue): void {
    const normalizedValue = this.normalizeDurationValue(value);
    this.value = normalizedValue;
    this.syncSegmentsFromValue(normalizedValue);
    this.refreshViewState();
    this.stateChanges.next();
  }

  registerOnChange(onChange: (value: DurationControlValue) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.disabled === isDisabled) return;

    this.disabled = isDisabled;
    if (this.disabled) {
      this.daysControl.disable({ emitEvent: false });
      this.hoursControl.disable({ emitEvent: false });
      this.minutesControl.disable({ emitEvent: false });
    } else {
      this.daysControl.enable({ emitEvent: false });
      this.hoursControl.enable({ emitEvent: false });
      this.minutesControl.enable({ emitEvent: false });
    }
    this.stateChanges.next();
  }

  setDescribedByIds(ids: string[]): void {
    this.describedByIds = ids;
    this.stateChanges.next();
  }

  onContainerClick(event: MouseEvent): void {
    if (this.disabled || event.target instanceof HTMLInputElement) return;
    this.focusDefaultSegment();
  }

  handleFocusIn(): void {
    if (this.disabled || this.focused) return;
    this.focused = true;
    this.refreshViewState();
    this.stateChanges.next();
  }

  handleFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && this.elementRef.nativeElement.contains(event.relatedTarget)) return;

    this.focused = false;
    this.normalizeSegments();
    this.onTouched();
    this.syncControlStateFromNgControl();
    this.refreshViewState();
    this.stateChanges.next();
  }

  onSegmentKeydown(event: KeyboardEvent, segment: DurationSegmentName): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;

    const segments: DurationSegmentName[] = this.showDays() ? ['days', 'hours', 'minutes'] : ['hours', 'minutes'];
    const index = segments.indexOf(segment);
    if (
      (event.key === ':' || (event.key === 'ArrowRight' && input && this.isCursorAtEnd(input))) &&
      index < segments.length - 1
    ) {
      event.preventDefault();
      this.focusSegment(segments[index + 1]);
      return;
    }
    if (event.key === 'ArrowLeft' && input && this.isCursorAtBeginning(input) && index > 0) {
      event.preventDefault();
      this.focusSegment(segments[index - 1]);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.adjustSegmentValue(segment, 1);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.adjustSegmentValue(segment, -1);
      return;
    }

    if (event.ctrlKey || event.metaKey || AllowedEditingKeys.has(event.key) || DigitKeyPattern.test(event.key)) {
      return;
    }

    event.preventDefault();
  }

  private onSegmentControlValueChange(segment: DurationSegmentName, value: string): void {
    if (this.syncingSegments) return;

    const sanitizedValue = this.sanitizeSegmentValue(segment, value);
    if (sanitizedValue !== value) {
      this.setSegmentText(segment, sanitizedValue);
    }
    this.updateValueFromSegments();
  }

  private updateValueFromSegments(): void {
    this.updateValue(this.buildValueFromSegments());
  }

  private updateValue(value: DurationControlValue): void {
    const normalizedValue = this.normalizeDurationValue(value);
    if (this.value !== normalizedValue) {
      this.value = normalizedValue;
      this.onChange(normalizedValue);
    }
    this.refreshViewState();
    this.stateChanges.next();
  }

  private buildValueFromSegments(): DurationControlValue {
    const daysText = this.showDays() ? this.daysControl.value.trim() : '';
    const hoursText = this.hoursControl.value.trim();
    const minutesText = this.minutesControl.value.trim();
    if (!daysText.length && !hoursText.length && !minutesText.length) return null;

    const days = daysText.length ? Number(daysText) : 0;
    if (!Number.isInteger(days) || days < 0) return null;
    const hours = hoursText.length ? Number(hoursText) : 0;
    const minutes = minutesText.length ? Number(minutesText) : 0;
    if (!Number.isInteger(hours) || hours < 0) return null;
    if (!Number.isInteger(minutes) || minutes < 0) return null;

    return days * 1440 + hours * 60 + minutes;
  }

  private normalizeSegments(): void {
    const normalizedValue = this.normalizeDurationValue(this.buildValueFromSegments());
    if (normalizedValue === null) {
      this.setSegmentTexts('', '', '');
      this.updateValue(null);
      return;
    }

    this.syncSegmentsFromValue(normalizedValue);
    this.updateValue(normalizedValue);
  }

  private syncSegmentsFromValue(value: DurationControlValue): void {
    this.syncingSegments = true;
    try {
      if (value === null) {
        this.setSegmentTexts('', '', '');
        return;
      }

      const days = this.showDays() ? Math.floor(value / 1440) : 0;
      const hours = Math.floor((this.showDays() ? value % 1440 : value) / 60);
      const minutes = value % 60;
      this.setSegmentTexts(this.showDays() ? String(days) : '', this.formatHours(hours), this.formatMinutes(minutes));
    } finally {
      this.syncingSegments = false;
    }
  }

  private setSegmentTexts(days: string, hours: string, minutes: string): void {
    this.daysControl.setValue(days, { emitEvent: false });
    this.hoursControl.setValue(hours, { emitEvent: false });
    this.minutesControl.setValue(minutes, { emitEvent: false });
  }

  private setSegmentText(segment: DurationSegmentName, value: string): void {
    const control =
      segment === 'days' ? this.daysControl
      : segment === 'hours' ? this.hoursControl
      : this.minutesControl;
    control.setValue(value, { emitEvent: false });
  }

  private sanitizeSegmentValue(segment: DurationSegmentName, value: string): string {
    const digits = value.replace(/\D/g, '');
    if (segment !== 'minutes') return digits;
    return this.sanitizeMinutesValue(digits);
  }

  private sanitizeMinutesValue(value: string): string {
    if (!value.length) return '';

    const minutes = Number(value);
    if (!Number.isFinite(minutes)) return '';
    if (value.length > 2) return String(minutes);
    return value;
  }

  private adjustSegmentValue(segment: DurationSegmentName, delta: number): void {
    const currentValue = this.readSegmentNumber(segment);
    const adjustedValue =
      segment === 'minutes' ? this.clampMinuteStepValue(currentValue + delta) : Math.max(0, currentValue + delta);
    const displayValue = segment === 'days' ? String(adjustedValue) : this.formatHours(adjustedValue);

    this.setSegmentText(segment, displayValue);
    this.updateValueFromSegments();
    this.focusSegment(segment);
  }

  private readSegmentNumber(segment: DurationSegmentName): number {
    const control =
      segment === 'days' ? this.daysControl
      : segment === 'hours' ? this.hoursControl
      : this.minutesControl;
    const value = Number(control.value || 0);
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.trunc(value);
  }

  private clampMinuteStepValue(minutes: number): number {
    return Math.min(59, Math.max(0, minutes));
  }

  private normalizeDurationValue(value: DurationControlValue): DurationControlValue {
    if (value === null || !Number.isFinite(value) || value < 0) return null;
    return Math.trunc(value);
  }

  private formatHours(hours: number): string {
    return String(hours).padStart(2, '0');
  }

  private formatMinutes(minutes: number): string {
    return String(minutes).padStart(2, '0');
  }

  private focusDefaultSegment(): void {
    const segment =
      this.showDays() ? 'days'
      : this.hoursControl.value.length ? 'minutes'
      : 'hours';
    this.focusSegment(segment);
  }

  private focusSegment(segment: DurationSegmentName): void {
    const input = this.resolveSegmentInput(segment);
    if (!input) return;

    input.focus();
    this.setCursorToEnd(input);
  }

  private resolveSegmentInput(segment: DurationSegmentName): HTMLInputElement | null {
    const input =
      segment === 'days' ? this.daysInput
      : segment === 'hours' ? this.hoursInput
      : this.minutesInput;
    return input?.nativeElement ?? null;
  }

  private setCursorToEnd(input: HTMLInputElement): void {
    const endPosition = input.value.length;
    input.setSelectionRange(endPosition, endPosition);
  }

  private isCursorAtEnd(input: HTMLInputElement): boolean {
    return input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
  }

  private isCursorAtBeginning(input: HTMLInputElement): boolean {
    return input.selectionStart === 0 && input.selectionEnd === 0;
  }

  private syncPlaceholderSegments(): void {
    const placeholderSegments = this.placeholder.split(':');
    this.hoursPlaceholder = placeholderSegments[0] ?? '';
    this.minutesPlaceholder = placeholderSegments[1] ?? '';
  }

  private refreshViewState(): void {
    this.empty =
      (!this.showDays() || !this.daysControl.value.length) &&
      !this.hoursControl.value.length &&
      !this.minutesControl.value.length;
    this.shouldLabelFloat = this.focused || !this.empty;
    this.visibleHoursPlaceholder = this.focused ? this.hoursPlaceholder : '';
    this.visibleMinutesPlaceholder = this.focused ? this.minutesPlaceholder : '';
  }

  private syncControlStateFromNgControl(): void {
    const control = this.ngControl?.control;
    const nextRequired = this.requiredInput || !!control?.hasValidator(Validators.required);
    const nextErrorState = !!control && control.invalid && (control.touched || control.dirty);
    const nextDisabled = control?.disabled ?? this.disabled;
    let stateChanged = false;

    if (this.required !== nextRequired) {
      this.required = nextRequired;
      stateChanged = true;
    }

    if (this.errorState !== nextErrorState) {
      this.errorState = nextErrorState;
      stateChanged = true;
    }

    if (this.disabled !== nextDisabled) {
      this.setDisabledState(nextDisabled);
      return;
    }

    if (stateChanged) {
      this.stateChanges.next();
    }
  }
}
