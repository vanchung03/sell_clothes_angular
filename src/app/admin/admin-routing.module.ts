import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { UserManagementComponent } from './component/users/user.component';
import { AddUserComponent } from './component/users/add-user/add-user.component';
import { SettingsComponent } from './component/settings/settings.component';
import { ProductsComponent } from './component/products/products.component';
import { AddProductComponent } from './component/products/add-product/add-product.component';
import { ReportsComponent } from './component/reports/reports.component';
import { AdminLayoutComponent } from './component/index-layout/index.component';
import { AuthGuard } from './auth.guard'; // Import AuthGuard

import { StatisticsComponent } from './component/reports/statistics/statistics.component';
import { ProductSummaryComponent } from './component/reports/product-summary/product-summary.component';
import { UpdateProductComponent } from './component/products/update-product/update-product.component';
import { CategoryComponent } from './component/category/category.component';
import { BrandComponent } from './component/brand/brand.component';
import { RoleComponent } from './component/role/role.component';
import { OrderComponent } from './component/order/order.component';
import { OrderDetailComponent } from './component/order/order-detail/order-detail.component';

import { PaymentHistoryComponent } from './component/payment-history/payment-history.component';
import { PaymentComponent } from './component/payment/payment.component';
import { AddExcelProductComponent } from './component/products/add-excel-product/add-excel-product.component';
import { AddExcelProductImageComponent } from './component/products/add-excel-product-image/add-excel-product-image.component';
import { AddExcelProductVariantComponent } from './component/products/add-excel-product-variant/add-excel-product-variant.component';
import { VoucherComponent } from './component/voucher/voucher.component';
const routes: Routes = [
  { 
    path: '', 
    component: AdminLayoutComponent, 
    canActivate: [AuthGuard], // Kiểm tra đăng nhập và quyền Admin
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'add-user', component: AddUserComponent },
      { path: 'roles', component:RoleComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'add-product', component: AddProductComponent },  


      
      { path: 'statistics', component: StatisticsComponent },

      { path: 'products', component: ProductsComponent },
      { path: 'add-excel-product', component: AddExcelProductComponent },  // Thêm sản phẩm từ file Excel
      { path: 'add-excel-product-image', component: AddExcelProductImageComponent },  // Thêm ảnh cho sản phẩm từ file Excel
      { path: 'add-excel-product-variant', component: AddExcelProductVariantComponent },  // Thêm variant cho sản phẩm từ file Excel
      { path: 'update-product/:id', component: UpdateProductComponent }, 
      { path: 'order', component: OrderComponent }, 
      { path: 'vouchers', component: VoucherComponent },  // Thêm mã giảm giá
      { path: 'orders/:id', component: OrderDetailComponent}, 
      { path: 'payment-history', component: PaymentHistoryComponent }, 
      { path: 'payment', component: PaymentComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'product-summary', component: ProductSummaryComponent },
      { path: 'brand', component: BrandComponent },
      { path: 'category', component: CategoryComponent }, 
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
