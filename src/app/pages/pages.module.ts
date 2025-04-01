// pages.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module'; // Định tuyến cho pages
import { HomeComponent } from './home/home.component';
import { PaymentComponent } from './payments-result/payments.component';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './home/components/header/header.component';
import { SaleProductsComponent } from './products/sale-products/sale-products.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { SliderComponent } from './home/components/slider/slider.component';
import { TopBarComponent } from './home/components/top-bar/top-bar.component';
import { DropdownMenuComponent } from './home/components/dropdown-menu/dropdown-menu.component';
import { SaleCollectionsComponent } from './products/sale-collections/sale-collections.component';
import { MaterialModule } from '../../assets/material.module';
import { SaleClothesComponent } from './products/sale-clothes/sale-clothes.component';
import { FooterComponent } from './home/components/footer/footer.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';  // Import MaterialModule
import { UniquePipe } from './products/product-detail/unique.pipe';
import { ProductCardComponent } from './products/product-card-all/product-card-all.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { NewsComponent } from './news/news.component';
import { ContactComponent } from './contact/contact.component';

import { OrdersListNewComponent } from './orders-list-new/orders-list-new.component';
import { OrderDetailsNewComponent } from './orders-list-new/order-details-new/order-details-new.component';
import { VoucherListComponent } from './voucher-list/voucher-list.component';
import { QuickViewComponent } from './quick-view/quick-view.component';
import { PolicyStoreComponent } from './home/components/policy-store/policy-store.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ChatFloatingComponent } from './home/components/chat-floating/chat-floating.component';

@NgModule({
  declarations: [HomeComponent, PaymentComponent, HeaderComponent, SaleProductsComponent, ProductDetailComponent, SliderComponent, TopBarComponent, DropdownMenuComponent, SaleCollectionsComponent, SaleClothesComponent, FooterComponent, CartComponent,
     CheckoutComponent,
     UniquePipe,
     ProductCardComponent,
     IntroductionComponent,
     NewsComponent,
     ContactComponent,
     OrdersListNewComponent,
     OrderDetailsNewComponent,
     VoucherListComponent,
     QuickViewComponent,
     PolicyStoreComponent,
     FavoriteComponent,
     ReviewsComponent,
     ChatFloatingComponent
    ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    FormsModule,  // Import FormsModule để sử dụng form controls
    MaterialModule,  // Import MaterialModule
  ],
})
export class PagesModule { }
