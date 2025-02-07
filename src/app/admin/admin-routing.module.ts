// admin-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { UserManagementComponent } from './component/users/user.component';
import { SettingsComponent } from './component/settings/settings.component';
import { ProductsComponent } from './component/products/products.component';
import { ReportsComponent } from './component/reports/reports.component';
import { AdminLayoutComponent } from './component/index-layout/index.component';

const routes: Routes = [
  { path: '', component: AdminLayoutComponent, children: [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'user-management', component: UserManagementComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'reports', component: ReportsComponent },
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
