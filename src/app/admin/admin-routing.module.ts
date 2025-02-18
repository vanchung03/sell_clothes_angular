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
import { UpdateProductComponent } from './component/products/update-product/update-product.component';
const routes: Routes = [
  { 
    path: '', 
    component: AdminLayoutComponent, 
    canActivate: [AuthGuard], // Kiểm tra đăng nhập và quyền Admin
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'add-user', component: AddUserComponent },  // Thêm đư��ng d��n cho form thêm người dùng
      { path: 'settings', component: SettingsComponent },
      { path: 'add-product', component: AddProductComponent },  // Thêm đư��ng d��n cho form thêm sản phẩm
      { path: 'statistics', component: StatisticsComponent },  // Thêm đư��ng d��n cho thống kê sản phẩm (tính theo số lượng, giá trung bình,...)
      { path: 'products', component: ProductsComponent },
      { path: 'update-product/:id', component: UpdateProductComponent },  // Thêm đư��ng d��n cho form cập nhật sản phẩm theo ID
      { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
