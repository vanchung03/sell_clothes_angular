import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Role } from '../types/roles';
import { TokenService } from './token.service'; // Đảm bảo đã có TokenService để lấy token

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = 'http://localhost:8080/api/v1/roles'; // ✅ API endpoint cho roles

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // ✅ Lấy danh sách tất cả roles từ backend
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ Lấy role theo ID
  getRoleById(roleId: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${roleId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ Thêm role mới
  addRole(roleData: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}`, roleData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ Cập nhật role
  updateRole(roleId: number, roleData: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${roleId}`, roleData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ Xóa role
  deleteRole(roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roleId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ Headers với Token Auth
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

  // ✅ Xử lý lỗi
  private handleError(error: any) {
    console.error('Lỗi API:', error);
    return throwError(() => new Error('Lỗi khi gọi API RolesService'));
  }
}
