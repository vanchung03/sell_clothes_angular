import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { MaterialModule } from '../material.module';  // Import MaterialModule

import { DashboardComponent } from './dashboard/dashboard.component';  // Đảm bảo chỉ khai báo ở đây
import { UserManagementComponent } from './user-management/user-management.component';
import { SettingsComponent } from './settings/settings.component';
import { ProductsComponent } from './products/products.component';
import { ReportsComponent } from './reports/reports.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

@NgModule({
  declarations: [
    DashboardComponent,  // Khai báo ở đây một lần duy nhất
    UserManagementComponent,
    SettingsComponent,
    ProductsComponent,
    ReportsComponent,
    SidebarComponent,
    ToolbarComponent,
    AdminLayoutComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
  ],
})
export class AdminModule { }
