import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/login-request.model'; 
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { RegisterRequest } from '../models/register-request.model'; 

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; 

  constructor(private http: HttpClient, private router: Router) {}
  
  // 🟢 ĐĂNG KÝ TÀI KHOẢN
  register(request: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, request);
  }
  // Phương thức đăng nhập
  login(request: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, request);
  }
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



  // Lưu token vào localStorage
  saveToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  // Lấy thông tin giải mã từ accessToken
  getDecodedAccessToken(): any {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('Token không tồn tại trong localStorage');
      return null;
    }
    try {
      const decodedToken = jwt_decode<any>(token); // Sử dụng any để đảm bảo giải mã không bị lỗi

      // Kiểm tra nếu token không có trường exp
      if (!decodedToken.exp) {
        console.error('Token không có trường expiration (exp)');
        this.logout(); // Đăng xuất người dùng nếu không có exp
        return null;
      }

      const expirationDate = decodedToken.exp * 1000;  // Chuyển từ giây sang mili giây
      const currentDate = new Date().getTime();
      
      if (currentDate > expirationDate) {
        console.error('Token đã hết hạn');
        this.logout(); // Thực hiện logout nếu token hết hạn
        return null;
      }
      
      return decodedToken;
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
      return null;
    }
  }

  // Đăng xuất người dùng và xóa token
  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigateByUrl('/login');
  }

  // Kiểm tra quyền và trạng thái người dùng
  checkUserRoleAndStatus(): { roles: string[], status: string } | null {
    const decodedToken = this.getDecodedAccessToken();
    if (decodedToken) {
      const roles = decodedToken.roles || [];  // roles là mảng chứa quyền
      const status = decodedToken.status || null;

      // Chỉ trả về khi cả roles và status hợp lệ
      if (roles.length > 0 && status) {
        return { roles, status: status.toString() };  // Trả về roles dưới dạng mảng
      }
    }
    return null;
  }

  // Kiểm tra role người dùng
  hasRole(role: string): boolean {
    const userInfo = this.checkUserRoleAndStatus();
    return userInfo ? userInfo.roles.includes(role) : false;  // Kiểm tra xem role có trong mảng roles không
  }

  // Kiểm tra trạng thái người dùng
  hasStatus(status: string): boolean {
    const userInfo = this.checkUserRoleAndStatus();
    return userInfo ? userInfo.status === status : false;
  }

  // Kiểm tra phiên đăng nhập và chuyển hướng
  checkLoginStatus() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const userInfo = this.checkUserRoleAndStatus();
      if (userInfo) {
        this.navigateBasedOnRoleAndStatus();
      } else {
        this.router.navigateByUrl('/login');  // Nếu không có thông tin hợp lệ, chuyển về login
      }
    } else {
      this.router.navigateByUrl('/login');  // Nếu không có token, chuyển về login
    }
  }

  // Phương thức chuyển hướng dựa trên quyền và trạng thái
  navigateBasedOnRoleAndStatus() {
    const userInfo = this.checkUserRoleAndStatus();
    if (userInfo) {
      const { roles, status } = userInfo;

      // Chỉ chuyển hướng khi trạng thái là '1'
      if (status === '1') {
        if (roles.includes('ROLE_ADMIN')) {
          this.router.navigateByUrl('/admin/dashboard');  // Chuyển đến trang admin
        } else if (roles.includes('ROLE_USER')) {
          this.router.navigateByUrl('/pages/home');  // Chuyển đến trang user
        } else {
          console.error('Không xác định quyền truy cập.');
        }
      } else {
        console.error('Trạng thái người dùng không hợp lệ');
      }
    } else {
      console.error('Không có thông tin người dùng hoặc token không hợp lệ');
    }
  }
}
