import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';  // Import AuthService
import { LoginRequest } from '../models/login-request.model';  // Import model LoginRequest
import { Router } from '@angular/router';  // Import Router

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginRequest: LoginRequest = new LoginRequest();  // Khởi tạo đối tượng model

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.loginRequest).subscribe(
      (response) => {
        // Lưu accessToken vào localStorage
        this.authService.saveToken(response.token);
        console.log('Đăng nhập thành công!');

        // Kiểm tra và chuyển hướng sau khi đăng nhập thành công
        const userInfo = this.authService.checkUserRoleAndStatus();
        if (userInfo) {
          const { role, status } = userInfo;

          // Nếu trạng thái là 0, kiểm tra quyền và chuyển hướng
          if (status === '0') {
            if (role === 'ADMIN') {
              this.router.navigate(['/admin']);  // Chuyển đến trang admin
            } else if (role === 'USER') {
              this.router.navigate(['/fage']);  // Chuyển đến trang user
            }
          } else {
            // Nếu trạng thái không phải là 0, hiển thị thông báo hoặc làm gì đó
            console.error('Trạng thái người dùng không hợp lệ!');
            // Ví dụ: Có thể hiển thị thông báo cho người dùng
          }
        }
      },
      (error) => {
        console.log('Lỗi đăng nhập:', error);
      }
    );
  }
}
