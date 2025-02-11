import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { MaterialModule } from '../material.module';  // Import MaterialModule

import { DashboardComponent } from './component/dashboard/dashboard.component';  // Đảm bảo chỉ khai báo ở đây
import { UserManagementComponent } from './component/users/user.component';
import { SettingsComponent } from './component/settings/settings.component';
import { ProductsComponent } from './component/products/products.component';
import { ReportsComponent } from './component/reports/reports.component';
import { AdminLayoutComponent } from './component/index-layout/index.component';

@NgModule({
  declarations: [
    DashboardComponent,  
    UserManagementComponent,
    SettingsComponent,
    ProductsComponent,
    ReportsComponent,
    AdminLayoutComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
  ],
})
export class AdminModule { }
