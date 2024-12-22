import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatetimePickerComponent } from '../../projects/datetime-picker/src/public-api';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, DatetimePickerComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
