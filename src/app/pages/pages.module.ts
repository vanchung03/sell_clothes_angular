// pages.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module'; // Định tuyến cho pages
import { HomeComponent } from './home/home.component';
import { PaymentComponent } from './payments-result/payments.component';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './home/components/header/header.component';
import { NavbarComponent } from './home/components/navbar/navbar.component';
import { SaleProductsComponent } from './products/sale-products/sale-products.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SliderComponent } from './home/components/slider/slider.component';
import { TopBarComponent } from './home/components/top-bar/top-bar.component';
import { DropdownMenuComponent } from './home/components/dropdown-menu/dropdown-menu.component';
import { SaleCollectionsComponent } from './products/sale-collections/sale-collections.component';
import { MaterialModule } from '../material.module';
import { SaleClothesComponent } from './products/sale-clothes/sale-clothes.component';
import { FooterComponent } from './home/components/footer/footer.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';  // Import MaterialModule
import { UniquePipe } from './product-detail/unique.pipe';
import { OrderListComponent } from './order-list/order-list.component';
import { ProductCardComponent } from './products/product-card/product-card.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { NewsComponent } from './news/news.component';
import { ContactComponent } from './contact/contact.component';
import { CollectionsComponent } from './collections/collections.component';
@NgModule({
  declarations: [HomeComponent, PaymentComponent, HeaderComponent, NavbarComponent, SaleProductsComponent, ProductDetailComponent, SliderComponent, TopBarComponent, DropdownMenuComponent, SaleCollectionsComponent, SaleClothesComponent, FooterComponent, CartComponent,
     CheckoutComponent,
     UniquePipe,
     OrderListComponent,
     ProductCardComponent,
     IntroductionComponent,
     NewsComponent,
     ContactComponent,
     CollectionsComponent,
    ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    FormsModule,  // Import FormsModule để sử dụng form controls
    MaterialModule,  // Import MaterialModule
  ],
})
export class PagesModule { }
