import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { HomeComponent } from './pages/home/home.component';  // Trang fage
// import { DashboardComponent } from './admin/dashboard/dashboard.component';  // Trang admin

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },  // Trang mặc định sẽ chuyển tới login
  // { path: 'fage', component: HomeComponent },  // Trang fage
  // { path: 'admin', component: DashboardComponent },  // Trang DashboardComponent
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  // Các route khác
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}