// app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found.component';
// Định tuyến cho các module con
const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Lazy Loading cho module Auth
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },

  // Lazy Loading cho module Admin
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

  // Lazy Loading cho module Pages
  { path: 'pages', loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule) },

  // Định tuyến mặc định cho các route không tồn tại (redirect về login)
  // { path: '**', redirectTo: 'auth/login', pathMatch: 'full' },
  // Route 404
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
