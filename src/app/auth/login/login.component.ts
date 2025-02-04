import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { LoginRequest } from '../models/login-request.model';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginRequest: LoginRequest = new LoginRequest();

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Nếu đã có token, kiểm tra trạng thái đăng nhập
    if (localStorage.getItem('accessToken')) {
      this.authService.checkLoginStatus();
    }
  }

  onLogin(): void {
    this.authService
      .login(this.loginRequest)
      .pipe(
        // Bắt lỗi và hiển thị thông báo
        catchError((error) => {
          console.error('Lỗi đăng nhập:', error);
          this.toastr.error('Đăng nhập thất bại, vui lòng thử lại!', 'Lỗi');
          // Trả về một observable rỗng để kết thúc stream
          return of(null);
        })
      )
      .subscribe((response) => {
        // Nếu có lỗi, response sẽ là null
        if (!response) {
          return;
        }
        console.log('Response từ API:', response);

        if (response && response.token) {
          // Lưu token vào localStorage
          this.authService.saveToken(response.token);

          // Hiển thị thông báo thành công
          this.toastr.success('Đăng nhập thành công!', 'Thông báo', {
            timeOut: 3000,
          });

          // Chuyển hướng sau khi đăng nhập thành công sau 1 giây
          setTimeout(() => {
            this.authService.navigateBasedOnRoleAndStatus();
          }, 1000);
        } else {
          // Nếu không có token trong phản hồi API
          this.toastr.error('Không có token trong phản hồi API!', 'Lỗi');
        }
      });
  }
}
