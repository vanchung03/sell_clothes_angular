import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { MaterialModule } from '../../assets/material.module';  // Import MaterialModule

import { NgChartsModule } from 'ng2-charts';  // Import ChartsModule
import { NgxChartsModule } from '@swimlane/ngx-charts'; // 🔥 Import ngx-charts

import { DashboardComponent } from './component/dashboard/dashboard.component';  // Đảm bảo chỉ khai báo ở đây
import { UserManagementComponent } from './component/users/user.component';
import { SettingsComponent } from './component/settings/settings.component';
import { ProductsComponent } from './component/products/products.component';
import { ReportsComponent } from './component/reports/reports.component';
import { AdminLayoutComponent } from './component/index-layout/index.component';
import { AddProductComponent } from './component/products/add-product/add-product.component';
import { AddUserComponent } from './component/users/add-user/add-user.component';
import { UpdateUserComponent } from './component/users/update-user/update-user.component';
import { StatisticsComponent } from './component/reports/statistics/statistics.component';
import { UpdateProductComponent } from './component/products/update-product/update-product.component';
import { BrandComponent } from './component/brand/brand.component';
import { CategoryComponent } from './component/category/category.component';
import { RoleComponent } from './component/role/role.component';
import { OrderComponent } from './component/order/order.component';
import { OrderDetailComponent } from './component/order/order-detail/order-detail.component';
import { PaymentHistoryComponent } from './component/payment-history/payment-history.component';
import { PaymentComponent } from './component/payment/payment.component';
import { AddExcelProductComponent } from './component/products/add-excel-product/add-excel-product.component';
import { AddExcelProductImageComponent } from './component/products/add-excel-product-image/add-excel-product-image.component';
import { AddExcelProductVariantComponent } from './component/products/add-excel-product-variant/add-excel-product-variant.component';
import { VoucherComponent } from './component/voucher/voucher.component';

@NgModule({
  declarations: [
    DashboardComponent,  
    UserManagementComponent,
    SettingsComponent,
    ProductsComponent,
    ReportsComponent,
    AdminLayoutComponent,
    AddProductComponent,
    AddUserComponent,
    UpdateUserComponent,
    StatisticsComponent,
    UpdateProductComponent,
    BrandComponent,
    CategoryComponent,
    RoleComponent,
    OrderComponent,
    OrderDetailComponent,
    PaymentHistoryComponent,
    PaymentComponent,
    AddExcelProductComponent,
    AddExcelProductImageComponent,
    AddExcelProductVariantComponent,
    VoucherComponent,
    
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    NgChartsModule,  // Import ChartsModule
    NgxChartsModule, // �� Import ngx-charts
  ],
})
export class AdminModule { }
