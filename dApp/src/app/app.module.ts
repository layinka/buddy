import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { W3mButtonComponent } from './w3m-button/w3m-button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';
import { SellPageComponent } from './sell-page/sell-page.component';
import { BuyModalComponent } from './buy-modal/buy-modal.component';
import { BuyPageComponent } from './buy-page/buy-page.component';
import { OrderPageComponent } from './order-page/order-page.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastsComponent } from './toasts/toasts.component';
import { NextIdProfileComponent } from './next-id-profile/next-id-profile.component';


@NgModule({
  declarations: [
    AppComponent,
    W3mButtonComponent,
    SignupComponent,
    HomeComponent,
    SellPageComponent,
    BuyModalComponent,
    BuyPageComponent,
    OrderPageComponent,
    ToastsComponent,
    NextIdProfileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule // .forRoot({ })
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
