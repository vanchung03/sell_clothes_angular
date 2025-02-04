import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app/app-routing.module';  // Import AppRoutingModule
import { AppComponent } from '../app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';  // Import ToastrModule

import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, DashboardComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,  // Đảm bảo AppRoutingModule được thêm vào
    HttpClientModule,  // Đảm bảo HttpClientModule đã được thêm vào
    BrowserAnimationsModule,  // Thêm BrowserAnimationsModule
    ToastrModule.forRoot({  // Khởi tạo ToastrModule
      positionClass: 'toast-top-right',  // Vị trí thông báo
      timeOut: 3000,  // Thời gian hiển thị thông báo
      preventDuplicates: true,  // Ngừng hiển thị thông báo trùng lặp
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
