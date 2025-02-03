// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';  // Import model LoginRequest
import { Router } from '@angular/router';
const jwt_decode = require('jwt-decode');


// auth.service.ts
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';  // URL API của bạn

  constructor(private http: HttpClient, private router: Router) {}

  // Phương thức đăng nhập
  login(request: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, request);
  }

  // Lưu token vào localStorage
  saveToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  // Lấy thông tin giải mã từ accessToken
  getDecodedAccessToken(): any {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }
    try {
      return jwt_decode(token);  // Giải mã token và trả về thông tin
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
      return null;
    }
  }

  // Kiểm tra quyền và trạng thái người dùng
  checkUserRoleAndStatus(): { role: string, status: string } | null {
    const decodedToken = this.getDecodedAccessToken();
    if (decodedToken) {
      const role = decodedToken?.role || null;
      const status = decodedToken?.status || null;
      return role && status ? { role, status } : null;
    }
    return null;
  }

  // Kiểm tra role người dùng
  hasRole(role: string): boolean {
    const userInfo = this.checkUserRoleAndStatus();
    return userInfo ? userInfo.role === role : false;
  }

  // Kiểm tra trạng thái người dùng
  hasStatus(status: string): boolean {
    const userInfo = this.checkUserRoleAndStatus();
    return userInfo ? userInfo.status === status : false;
  }

  // Phương thức chuyển hướng dựa trên quyền và trạng thái
  navigateBasedOnRoleAndStatus() {
    const decodedToken = this.getDecodedAccessToken();
    if (decodedToken) {
      const role = decodedToken?.role;
      const status = decodedToken?.status;

      // Nếu trạng thái là 0 mới chuyển hướng
      if (status === '0') {
        if (role === 'admin') {
          this.router.navigate(['/admin']);  // Chuyển đến trang admin
        } else if (role === 'user') {
          this.router.navigate(['/user']);  // Chuyển đến trang user
        }
      } else {
        console.error('Trạng thái người dùng không hợp lệ');
        // Có thể hiển thị thông báo lỗi nếu trạng thái không hợp lệ
      }
    }
  }
}
