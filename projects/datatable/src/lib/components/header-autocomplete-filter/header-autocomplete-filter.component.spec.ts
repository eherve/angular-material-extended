import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HeaderAutocompleteFilterComponent } from './header-autocomplete-filter.component';

describe('HeaderAutocompleteFilterComponent', () => {
  let component: HeaderAutocompleteFilterComponent<any>;
  let fixture: ComponentFixture<HeaderAutocompleteFilterComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderAutocompleteFilterComponent],
      providers: [{ provide: NgControl, useValue: { control: new FormControl() } }, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderAutocompleteFilterComponent<any>);
    component = fixture.componentInstance;
    component.column = {
      type: 'autocomplete',
      columnDef: 'name',
      header: 'Name',
      property: 'name',
      searchable: true,
      options: async () => [],
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should recover after an options loading error', fakeAsync(() => {
    let callCount = 0;
    component.column.options = async () => {
      callCount++;
      if (callCount === 1) throw new Error('load failed');
      return [{ value: 'ok', name: 'Recovered' }];
    };

    component.input.nativeElement.value = 'first';
    component.filter();
    tick(300);
    flushMicrotasks();

    expect(component.searching).toBeFalse();
    expect(component.hasMore).toBeFalse();
    expect(callCount).toBe(1);

    component.input.nativeElement.value = 'second';
    component.filter();
    tick(300);
    flushMicrotasks();

    expect(component.searching).toBeFalse();
    expect(callCount).toBe(2);
    expect(component.options).toEqual([{ value: 'ok', name: 'Recovered' }]);
  }));
});
