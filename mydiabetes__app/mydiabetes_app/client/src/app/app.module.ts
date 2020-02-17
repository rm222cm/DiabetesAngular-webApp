// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ModalDialogModule } from 'ngx-modal-dialog';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';
import { MustMatchDirective } from './_helpers/must-match.directive';
import { TweetImgComponent } from './tweet-img/tweet-img.component';
import { FooterComponent } from './footer/footer.component';
import { InsulinComponent } from './insulin/insulin.component';
import { ActivityComponent } from './activity/activity.component';
import { CarbsComponent } from './carbs/carbs.component';
// import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DiabatesServicesComponent } from './diabates-services/diabates-services.component';
import { DiabetesGraphComponent } from './diabetes-graph/diabetes-graph.component';
import { GlucoseLevelComponent } from './glucose-level/glucose-level.component';
import { ReportComponent } from './report/report.component';
import { CommonModule } from '@angular/common';

// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { BarChartComponent } from './bar-chart/bar-chart.component';

import { NgxChartsModule } from '@swimlane/ngx-charts';
// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    SignUpComponent,
    InsulinComponent,
    ActivityComponent,
    CarbsComponent,
    MainComponent,
    LoginComponent,
    HeaderComponent,
    MustMatchDirective,
    TweetImgComponent,
    FooterComponent,
    DiabatesServicesComponent,
    DiabetesGraphComponent,
    GlucoseLevelComponent,
    ReportComponent,
    BarChartComponent
  ],
  entryComponents: [DiabetesGraphComponent],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    ModalDialogModule.forRoot(),
    ReactiveFormsModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    // BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  })
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
