// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TokenService } from './token.service'; // Đảm bảo import TokenService đúng
import { Role } from '../types/roles';
import { User } from '../types/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/v1/users'; // URL backend của bạn

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // Lấy thông tin người dùng từ token
  getId_profile(): Observable<User> {
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
  updateProfile(user: any): Observable<any> {
    const userId = this.tokenService.getUserId(); // Lấy userId từ token
    if (!userId) {
      throw new Error('Không thể lấy userId từ token');
    }
    // Chỉ gửi các trường cần thiết để cập nhật
    return this.http.put<any>(`${this.apiUrl}/${userId}/profile`, user, { headers: this.getAuthHeaders() });
  }
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Cập nhật thông tin người dùng theo ID
  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}`, userData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
  
  updateAvatar_profile(file: FormData): Observable<any> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      throw new Error('Không thể lấy userId từ token');
    }
  
    return this.http.post<any>(`${this.apiUrl}/${userId}/avatar`, file, {
      headers: this.getAuthHeadersWithoutContentType()
    });
  }

  // Hàm thêm người dùng mới
  addUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  //Hàm upload avatar trước khi thêm User
  uploadAvatar(file: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload-avatar`, file, {
      headers: this.getAuthHeadersWithoutContentType()
    }).pipe(
      catchError(this.handleError)
    );
  }
  updateAvatar(userId: number, file: FormData): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/${userId}/avatar`, file, {
    headers: this.getAuthHeadersWithoutContentType()
  }).pipe(catchError(this.handleError));
}

  
  // Ensure headers are correct for `multipart/form-data`
  private getAuthHeadersWithoutContentType(): HttpHeaders {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('Không có token trong localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // Don't set Content-Type manually
    });
  }
  
  // Hàm tạo headers với JWT Token
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getToken(); 
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
    console.error(errorMessage);
    return throwError(errorMessage); 
  }
}