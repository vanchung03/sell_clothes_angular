import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { MaterialModule } from '../material.module';  // Import MaterialModule

import { NgChartsModule } from 'ng2-charts';  // Import ChartsModule

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
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    NgChartsModule,  // Import ChartsModule
  ],
})
export class AdminModule { }
