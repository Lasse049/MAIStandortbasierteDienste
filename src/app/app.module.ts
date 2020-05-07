import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HttpClientModule } from '@angular/common/http';
import { RestProvider } from '../providers/rest/rest';
import { CheckboxPage } from '../pages/checkbox/checkbox';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProviderPhotoProvider } from '../providers/photo/photo';
import {FilterboxPage} from "../pages/filterbox/filterbox";
import { DatePicker } from '@ionic-native/date-picker/';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    CheckboxPage,
    FilterboxPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    CheckboxPage,
    FilterboxPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    RestProvider,
    Geolocation,
    ProviderPhotoProvider,
    DatePicker,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {}

