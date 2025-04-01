// pages-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PaymentComponent } from './payments-result/payments.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SaleProductsComponent } from './products/sale-products/sale-products.component';
import { IntroductionComponent } from './introduction/introduction.component';
// import { OrderListComponent } from './order-list/order-list.component';
import { NewsComponent } from './news/news.component';
import { ContactComponent } from './contact/contact.component';
import { OrdersListNewComponent } from './orders-list-new/orders-list-new.component';
import { OrderDetailsNewComponent } from './orders-list-new/order-details-new/order-details-new.component';
import { FavoriteComponent } from './favorite/favorite.component';

import { ProductCardComponent } from './products/product-card-all/product-card-all.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'payment-result', component: PaymentComponent },

  { path: 'product-detail/:id', component: ProductDetailComponent }, 
  { path: 'cart', component: CartComponent }, 
  { path: 'products-category', component: SaleProductsComponent }, 

  { path: 'orders-list-new', component: OrdersListNewComponent },  // new orders list component added here
  { path: 'order-details-new/:id', component: OrderDetailsNewComponent },  // new order details component added here
  
  { path: 'introduction', component: IntroductionComponent },
  { path: 'products-card', component: ProductCardComponent },  // new product card component added here
  
  { path: 'favorite', component: FavoriteComponent },  // new favorite component added here
  { path: 'news', component: NewsComponent }, 
  { path: 'contact', component: ContactComponent }, 
  { path: 'checkout', component: CheckoutComponent }, 
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
