import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../types/users/UserResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8080/api/v1/users'; // URL backend của bạn

  constructor(private http: HttpClient) {}

  // Hàm gọi API để lấy tất cả người dùng
  getAllUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders(); // Lấy headers có JWT Token
    return this.http.get<User[]>(`${this.apiUrl}`, { headers });
  }

  // Hàm tạo headers với JWT Token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }
}
