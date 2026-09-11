/** @format */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NgxMatDatatableModule } from '../../projects/datatable/src/public-api';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule, NgxMatDatatableModule],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the demo application', () => {
    expect(component).toBeTruthy();
  });

  it('should render the datatable demo', () => {
    component.datatableOptions.configService = undefined;
    fixture.detectChanges();

    const datatable = fixture.nativeElement.querySelector('ngx-mat-datatable');
    expect(datatable).not.toBeNull();
  });
});
