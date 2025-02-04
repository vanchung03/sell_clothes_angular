import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/login-request.model'; 
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; 

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
      console.error('Token không tồn tại trong localStorage');
      this.router.navigateByUrl('/login');  
      return null;
    }
    try {
      return jwt_decode(token);  
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
      return null;
    }
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
