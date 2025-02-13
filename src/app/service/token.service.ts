import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private tokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken'; 

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
    return this.cookieService.get(this.refreshTokenKey);
  }
  // // Lưu refreshToken vào cookie
  saveRefreshToken(token: string): void {
    this.cookieService.set(this.refreshTokenKey, token); 
  }

  // Xóa accessToken khỏi localStorage
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Xóa refreshToken khỏi cookie
  removeRefreshToken(): void {
    this.cookieService.delete(this.refreshTokenKey);
  }

  // Giải mã accessToken
  decodeToken(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      return jwt_decode<any>(token);
    } catch (error) {
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
   // Lấy user_id từ token (user_id là dạng string)
   getUserId(): number | null {
    const decodedToken = this.decodeToken();
    return decodedToken?.user_id || null; // Assuming 'userId' is stored as a string in the token payload
  }
}
