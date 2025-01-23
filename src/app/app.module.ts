import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app/app-routing.module';  // Import AppRoutingModule
import { AppComponent } from '../app/app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],  // Đảm bảo AppRoutingModule được thêm vào
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
