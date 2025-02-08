import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { PageNotFoundComponent } from './exception/page-not-found.component';
import { CookieService } from 'ngx-cookie-service';  // Import CookieService
// Import MaterialModule
import { MaterialModule } from './material.module'; 

// Import admin and pages module
import { AdminModule } from './admin/admin.module';  
import { PagesModule } from './pages/pages.module';
// Import auth module
import { AuthModule } from './auth/auth.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
  ],
  imports: [
    AdminModule,
    MaterialModule,  
    PagesModule,
    AuthModule,
    
    

    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
