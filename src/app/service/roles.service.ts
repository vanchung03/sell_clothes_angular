import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Role } from '../types/roles';
import { TokenService } from './token.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  // Sử dụng các endpoint đã cấu hình cho Roles
  private ROLES_URLS = environment.API_URLS.ROLES;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // ✅ Lấy danh sách tất cả roles từ backend
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.ROLES_URLS.GET_ALL, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ Lấy role theo ID
  getRoleById(roleId: number): Observable<Role> {
    return this.http.get<Role>(this.ROLES_URLS.GET_BY_ID(roleId), { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ Thêm role mới
  addRole(roleData: Role): Observable<Role> {
    return this.http.post<Role>(this.ROLES_URLS.CREATE, roleData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ Cập nhật role
  updateRole(roleId: number, roleData: Role): Observable<Role> {
    return this.http.put<Role>(this.ROLES_URLS.UPDATE(roleId), roleData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ Xóa role
  deleteRole(roleId: number): Observable<void> {
    return this.http.delete<void>(this.ROLES_URLS.DELETE(roleId), { headers: this.getAuthHeaders() })
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
