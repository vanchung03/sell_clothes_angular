import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { LoginRequest } from '../types/auth/LoginRequest';
import { RegisterRequest } from '../types/auth/RegisterRequest';
import { CookieService } from 'ngx-cookie-service'; // Import CookieService
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router, private tokenService: TokenService,private cookieService: CookieService ){ }
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

  // Đăng nhập
  login(request: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, request, { withCredentials: true }).pipe(
      switchMap(response => {
        if (response.accessToken) {
          this.tokenService.saveToken(response.accessToken);
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

  // Hàm làm mới accessToken  // Hàm làm mới accessToken
  refreshAccessToken(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();  // Lấy refreshToken từ cookie

    if (!refreshToken) {
      console.error('Refresh token không có trong cookie');
      this.logout();  // Nếu không có refreshToken thì đăng xuất
      return of(null);
    }

    // Kiểm tra token còn hiệu lực hay không
    // Gửi yêu cầu làm mới accessToken
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }, { withCredentials: true }).pipe(
      switchMap((response) => {
        if (response && response.accessToken) {
          // Lưu accessToken mới vào localStorage
          this.tokenService.saveToken(response.accessToken);
          return of(response.accessToken);  // Trả về accessToken mới
        } else {
          console.error('Không nhận được accessToken mới');
          this.logout();  // Đăng xuất nếu không nhận được accessToken mới
          return of(null);
        }
      }),
      catchError((error) => {
        console.error('Lỗi làm mới token:', error);
        this.logout();  // Đăng xuất nếu có lỗi trong quá trình làm mới token
        return of(null);
      })
    );
  }

  // Kiểm tra trạng thái đăng nhập
  checkLoginStatus() {
    if (this.tokenService.isTokenExpired()) {
      console.log('Token hết hạn, làm mới...');
      this.refreshAccessToken().pipe(
        switchMap((refreshResponse) => {
          if (refreshResponse && refreshResponse.accessToken) {
            this.tokenService.saveToken(refreshResponse.accessToken);
            return of(true);
          } else {
            this.router.navigateByUrl('/login');
            return of(false);
          }
        })
      ).subscribe();
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
      console.error('Trạng thái người dùng không hợp lệ');
      this.router.navigateByUrl('/login');
    }
  }
}
