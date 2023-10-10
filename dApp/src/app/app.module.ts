import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { W3mButtonComponent } from './w3m-button/w3m-button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateAuctionComponent } from './create-auction/create-auction.component';
import { ViewAuctionComponent } from './view-auction/view-auction.component';
import {HttpClientModule} from '@angular/common/http';
import { AuctionListComponent } from './auction-list/auction-list.component'

@NgModule({
  declarations: [
    AppComponent,
    W3mButtonComponent,
    CreateAuctionComponent,
    ViewAuctionComponent,
    AuctionListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
