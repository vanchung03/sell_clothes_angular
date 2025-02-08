import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';  // Import CookieService

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private tokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';  // Key cho refreshToken

  constructor(private cookieService: CookieService) {}

  // Lưu accessToken vào localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Lấy accessToken từ localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Lấy refreshToken từ cookie
  getRefreshToken(): string | null {
    return this.cookieService.get(this.refreshTokenKey);  // Lấy refreshToken từ cookie
  }

  // Hàm log refreshToken ra console
  logRefreshToken(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      console.log(document.cookie);  // In tất cả cookie hiện tại
      console.log('Refresh Token: ', refreshToken);
    } else {
      console.log(document.cookie);  // In tất cả cookie hiện tại
      console.log('Không tìm thấy refresh token trong cookie.');
    }
  }

  // // Lưu refreshToken vào cookie
  // saveRefreshToken(token: string): void {
  //   this.cookieService.set(this.refreshTokenKey, token);  // Lưu refreshToken vào cookie
  // }

  // Xóa accessToken khỏi localStorage
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Xóa refreshToken khỏi cookie
  removeRefreshToken(): void {
    this.cookieService.delete(this.refreshTokenKey);  // Xóa refreshToken khỏi cookie
  }

  // Giải mã accessToken
  decodeToken(): any {
    const token = this.getToken();
    if (!token) {
      console.error('Token không tồn tại');
      return null;
    }
    try {
      return jwt_decode<any>(token);
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
      return null;
    }
  }

  // Lấy danh sách quyền (roles) từ token
  getRoles(): string[] {
    const decodedToken = this.decodeToken();
    return decodedToken?.roles || [];
  }

  // Lấy trạng thái (status) từ token
  getStatus(): string {
    const decodedToken = this.decodeToken();
    return decodedToken?.status ? decodedToken.status.toString() : null;
  }

  // Kiểm tra token còn hiệu lực không
  isTokenExpired(): boolean {
    const decodedToken = this.decodeToken();
    if (!decodedToken) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  }
}
