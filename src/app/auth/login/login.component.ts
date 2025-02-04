import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';  
import { LoginRequest } from '../models/login-request.model';  
import { Router } from '@angular/router';  

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginRequest: LoginRequest = new LoginRequest();  

  constructor(
    private authService: AuthService,
    private router: Router,
    
  ) {}

  onLogin() {
    this.authService.login(this.loginRequest).subscribe(
      (response) => {
        console.log('Response from API:', response);  
        if (response && response.token) {
          this.authService.saveToken(response.token);
          console.log('Đăng nhập thành công!');
    
          // Kiểm tra và chuyển hướng sau khi đăng nhập thành công
          this.authService.navigateBasedOnRoleAndStatus();
        } else {
          console.error('Không có token trong phản hồi API!');
        }
      },
      (error) => {
        console.log('Lỗi đăng nhập:', error);
      }
    );
  }
}
