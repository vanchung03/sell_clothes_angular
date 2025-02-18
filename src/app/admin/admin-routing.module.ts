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
      
      { path: 'products', component: ProductsComponent },
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
