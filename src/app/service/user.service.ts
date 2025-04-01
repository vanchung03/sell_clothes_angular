import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { Role } from '../types/roles';
import { User } from '../types/User';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Sử dụng các endpoint từ environment
  private USERS_URLS = environment.API_URLS.USERS;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // Lấy thông tin người dùng từ token
  getId_profile(): Observable<User> {
    const userId = this.tokenService.getUserId(); // Lấy userId từ token
    if (!userId) {
      throw new Error('Không thể lấy userId từ token');
    }
    return this.http.get<User>(this.USERS_URLS.GET_BY_ID(userId), { headers: this.getAuthHeaders() });
  }

  // Hàm gọi API để lấy tất cả người dùng
  getAllUsers(): Observable<User[]> { 
    return this.http.get<User[]>(this.USERS_URLS.GET_ALL, { headers: this.getAuthHeaders() });
  }

  // Hàm gọi API để xóa người dùng
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(this.USERS_URLS.DELETE(userId), { headers: this.getAuthHeaders() });
  }

  // Hàm gọi API để cập nhật thông tin người dùng (profile)
  updateProfile(user: any): Observable<any> {
    const userId = this.tokenService.getUserId(); // Lấy userId từ token
    if (!userId) {
      throw new Error('Không thể lấy userId từ token');
    }
    // Chỉ gửi các trường cần thiết để cập nhật
    return this.http.put<any>(this.USERS_URLS.UPDATE_PROFILE(userId), user, { headers: this.getAuthHeaders() });
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(this.USERS_URLS.GET_BY_ID(userId), { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Cập nhật thông tin người dùng theo ID
  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put<any>(this.USERS_URLS.UPDATE(userId), userData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.USERS_URLS.GET_ROLES, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
  
  updateAvatar_profile(file: FormData): Observable<any> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      throw new Error('Không thể lấy userId từ token');
    }
    return this.http.post<any>(this.USERS_URLS.UPDATE_AVATAR(userId), file, {
      headers: this.getAuthHeadersWithoutContentType()
    });
  }

  // Hàm thêm người dùng mới
  addUser(userData: any): Observable<any> {
    return this.http.post<any>(this.USERS_URLS.REGISTER, userData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Hàm upload avatar trước khi thêm User
  uploadAvatar(file: FormData): Observable<any> {
    return this.http.post<any>(this.USERS_URLS.UPLOAD_AVATAR, file, {
      headers: this.getAuthHeadersWithoutContentType()
    }).pipe(catchError(this.handleError));
  }
  
  updateAvatar(userId: number, file: FormData): Observable<any> {
    return this.http.post<any>(this.USERS_URLS.UPDATE_AVATAR(userId), file, {
      headers: this.getAuthHeadersWithoutContentType()
    }).pipe(catchError(this.handleError));
  }

  // Headers không có Content-Type (cho multipart/form-data)
  private getAuthHeadersWithoutContentType(): HttpHeaders {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('Không có token trong localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  
  // Headers với JWT Token
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getToken(); 
    if (!token) {
      throw new Error('Không có token trong localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Hàm xử lý lỗi
  private handleError(error: any) {
    let errorMessage = 'Đã xảy ra lỗi, vui lòng thử lại sau';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      errorMessage = `Mã lỗi: ${error.status}, Thông báo: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage); 
  }
}
