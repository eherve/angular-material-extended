import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IntersectionObserverModule } from 'ngx-intersection-observer';
import {
  BehaviorSubject,
  debounceTime,
  exhaustMap,
  filter,
  map,
  Observable,
  scan,
  startWith,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {
  IMongooseDatatableSearchAutocompleteColumn,
  MongooseDatatableSearchListOption,
} from '../../types/datatable-column.type';

@Component({
  selector: 'lib-header-autocomplete-filter',
  imports: [
    CommonModule,
    FormsModule,
    IntersectionObserverModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './header-autocomplete-filter.component.html',
  styleUrl: './header-autocomplete-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => HeaderAutocompleteFilterComponent),
    },
  ],
})
export class HeaderAutocompleteFilterComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  column!: IMongooseDatatableSearchAutocompleteColumn;

  options: MongooseDatatableSearchListOption[] = [];
  hasMore = false;
  searching = false;
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  control!: FormControl<any>;
  selectControl = new FormControl();

  onChange = () => {};

  onTouched = () => {};

  private filter$ = new BehaviorSubject<string | undefined>(undefined);
  private nextPage$ = new Subject<void>();
  private injector = inject(Injector);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private subsink = new Subscription();

  writeValue = () => {};

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  async ngAfterViewInit(): Promise<void> {
    const ngControl: NgControl | null = this.injector.get(NgControl, null);
    if (!ngControl) throw new Error(`${this.constructor.name} missing control [column:${this.column.columnDef}]`);
    this.control = ngControl.control as UntypedFormControl;
    this.subsink.add(
      this.selectControl.valueChanges.subscribe((value: any) => {
        if (value === undefined) this.control.setValue(undefined);
        else this.control.setValue({ value, regex: false });
      })
    );
    this.buildOptions();
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }

  loadMore(intersect: boolean) {
    if (!intersect) return;
    this.nextPage$.next();
  }

  focus() {
    if (this.column.loadOnFocus) {
      const search = this.input.nativeElement.value;
      if (this.filter$.value !== search) this.filter$.next(search);
    }
  }

  filter() {
    const search = this.input.nativeElement.value;
    this.filter$.next(search);
  }

  private buildOptions() {
    this.subsink.add(
      this.filter$
        .pipe(
          filter((value) => typeof value === 'string'),
          debounceTime(300),
          switchMap((search: string) => {
            this.options = [];
            let skip = 0;
            return this.nextPage$.pipe(
              startWith(skip),
              tap(() => (this.searching = true)),
              switchMap(async () => this.column.options(this.column.limit || 10, skip, search)),
              map((data) => {
                this.options.push(...data);
                skip += this.column.limit || 10;
                this.hasMore = data?.length === (this.column.limit || 10);
                this.searching = false;
              })
            );
          })
        )
        .subscribe()
    );
  }
}
