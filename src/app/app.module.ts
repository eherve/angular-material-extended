/** @format */

import { Injectable, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import 'moment/locale/fr';
import { NgxMatDatatableIntl } from '../../projects/datatable/src/lib/datatable.intl';
import { NgxMatDatatableModule } from '../../projects/datatable/src/public-api';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
registerLocaleData(localeFr);

@Injectable()
class AppDatatableIntl extends NgxMatDatatableIntl {
  public override noDateLabel = 'Aucune donnée pour les filtres sélectionnés';
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    NgxMatDatatableModule,
  ],
  providers: [
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: NgxMatDatatableIntl, useClass: AppDatatableIntl },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
