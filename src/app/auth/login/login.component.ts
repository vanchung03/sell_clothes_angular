import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';  // Import ToastrService
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
    private toastr: ToastrService  // Inject ToastrService
  ) {}

  onLogin() {
    this.authService.login(this.loginRequest).subscribe(
      (response) => {
        console.log('Response from API:', response);  
        if (response && response.token) {
          this.authService.saveToken(response.token);
          this.toastr.success('Đăng nhập thành công!');  // Hiển thị thông báo thành công
    
          // Kiểm tra và chuyển hướng sau khi đăng nhập thành công
          this.authService.navigateBasedOnRoleAndStatus();
        } else {
          this.toastr.error('Không có token trong phản hồi API!');  // Thông báo lỗi
        }
      },
      (error) => {
        console.log('Lỗi đăng nhập:', error);
        this.toastr.error('Lỗi đăng nhập!');  // Thông báo lỗi nếu có lỗi xảy ra
      }
    );
  }
}
