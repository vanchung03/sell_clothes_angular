import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://your-backend-api.com/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  register(username: string, password: string, email: string,fullName:string ,phone:string ): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      username,
      password,
      email,
      fullName,
      phone
    });
  }
}
