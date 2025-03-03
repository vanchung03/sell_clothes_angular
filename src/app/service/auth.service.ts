import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { LoginRequest } from '../types/auth/LoginRequest';
import { RegisterRequest } from '../types/auth/RegisterRequest';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router, private tokenService: TokenService, private cookieService: CookieService) { }
  // Gửi OTP
  requestOTP(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/request-otp`, { email });
  }

  // Xác nhận OTP
  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  // Đặt mật khẩu mới
  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/reset-password`, { email, otp, newPassword });
  }
  // Đăng ký tài khoản
  register(request: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, request, { withCredentials: true }).pipe(
      switchMap(response => {
        if (response.accessToken) {
          this.tokenService.saveToken(response.accessToken);

          // ✅ Kiểm tra status từ token sau khi lưu
          const status = this.tokenService.getStatus();
          if (status !== '1') {
            console.error('Tài khoản bị khóa!');
            this.tokenService.removeToken(); // Xóa token ngay lập tức
            return of({ error: 'Tài khoản bị khóa' });
          }
        }

        return of(response);
      })
    );
}



  // Đăng xuất
  logout(): void {
    // this.tokenService.removeToken();
    this.router.navigateByUrl('/login');
  }
  refreshAccessToken(): Observable<string | null> {
    const refreshToken = this.tokenService.getRefreshToken();
    
    if (!refreshToken) {
        console.error('Không có refreshToken');
        this.logout();
        return of(null);
    }
    // Gửi yêu cầu làm mới token đến server
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }, { withCredentials: true }).pipe(
      switchMap((response) => {
        console.log('Refresh Response:', response);
        if (response && response.accessToken) {
          this.tokenService.saveToken(response.accessToken);
          return of(response.accessToken);
        } else {
          console.error('Lỗi làm mới token. Đăng xuất.');
          this.logout();
          return of(null);
        }
      }),
      catchError((error) => {
        console.error('Lỗi khi làm mới token:', error);
        this.logout();
        return of(null);
      })
    );
  }

  checkLoginStatus() {
    if (this.tokenService.isTokenExpired()) {
      this.refreshAccessToken().subscribe((newToken) => {
        if (newToken) {
          this.navigateBasedOnRoleAndStatus();
        } else {
          this.router.navigateByUrl('/login');
        }
      });
    } else {
      this.navigateBasedOnRoleAndStatus();
    }
  }
  // Chuyển hướng theo quyền & trạng thái
  navigateBasedOnRoleAndStatus() {
    const roles = this.tokenService.getRoles();
    const status = this.tokenService.getStatus();

    if (status === '1') {
      if (roles.includes('ROLE_ADMIN')) {
        this.router.navigateByUrl('/admin/dashboard');
      } else if (roles.includes('ROLE_USER')) {
        this.router.navigateByUrl('/pages/home');
      } else {
        console.error('Không xác định quyền truy cập');
      }
    } else {
      console.error('Tài khoản người dùng đã bị khóa');
      this.router.navigateByUrl('/login');
    }
  }
}
