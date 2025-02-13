// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { TokenService } from './token.service'; // Đảm bảo import TokenService đúng
import { User } from '../types/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/v1/users'; // URL backend của bạn

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // Lấy thông tin người dùng từ token
  getUserById(): Observable<User> {
    const userId = this.tokenService.getUserId(); // Lấy userId từ token
    if (!userId) {
      throw new Error('Không thể lấy userId từ token');
    }
    return this.http.get<User>(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() });
  }

  // Hàm gọi API để lấy tất cả người dùng
  getAllUsers(): Observable<User[]> { 
    return this.http.get<User[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  // Hàm gọi API để xóa người dùng
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() });
  }

  // Hàm gọi API để cập nhật thông tin người dùng
  updateUser(user: any): Observable<any> {
    const userId = this.tokenService.getUserId(); // Lấy userId từ token
    if (!userId) {
      throw new Error('Không thể lấy userId từ token');
    }
    // Chỉ gửi các trường cần thiết để cập nhật
    return this.http.put<any>(`${this.apiUrl}/${userId}`, user, { headers: this.getAuthHeaders() });
  }
  
  // Hàm tạo headers với JWT Token
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getToken(); // Lấy accessToken từ tokenService
    if (!token) {
      throw new Error('Không có token trong localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Hàm xử lý lỗi
  private handleError(error: any) {
    let errorMessage = 'Đã xảy ra lỗi, vui lòng thử lại sau';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Xử lý lỗi trả về từ server
      errorMessage = `Mã lỗi: ${error.status}, Thông báo: ${error.message}`;
    }
    console.error(errorMessage); // In lỗi ra console
    return throwError(errorMessage); // Trả về Observable lỗi
  }
}
