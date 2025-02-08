import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth.service';
import { LoginRequest } from '../../types/auth/LoginRequest';
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
    // Nếu đã có access token, kiểm tra trạng thái đăng nhập
    if (localStorage.getItem('accessToken')) {
      this.authService.checkLoginStatus();
    }
  }

  onLogin(): void {
    if (!this.loginRequest.username || !this.loginRequest.password) {
      this.toastr.error('Vui lòng nhập tài khoản và mật khẩu!', 'Lỗi');
      return;
    }

    this.authService.login(this.loginRequest).pipe(
      catchError((error) => {
        console.error('Lỗi đăng nhập:', error);
        this.toastr.error('Đăng nhập thất bại, vui lòng thử lại!', 'Lỗi');
        return of(null);
      })
    ).subscribe((response) => {
      if (response && response.accessToken) {
        this.toastr.success('Đăng nhập thành công!', 'Thông báo', { timeOut: 3000 });
        this.authService.checkLoginStatus();
      }
    });
  }
}
