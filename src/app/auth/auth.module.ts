import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from '../auth/auth-routing.module';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,  // Đảm bảo import AuthRoutingModule
    FormsModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class AuthModule {}
