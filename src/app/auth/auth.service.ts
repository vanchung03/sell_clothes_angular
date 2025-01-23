import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://your-backend-api.com/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(fullName: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      fullName,
      email,
      password,
    });
  }
}
