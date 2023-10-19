import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuyPageComponent } from './buy-page/buy-page.component';
import { HomeComponent } from './home/home.component';
import { OrderPageComponent } from './order-page/order-page.component';
import { SellPageComponent } from './sell-page/sell-page.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'sell', component: SellPageComponent},
  {path: 'buy', component: BuyPageComponent},
  {path: 'order/:id', component: OrderPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
