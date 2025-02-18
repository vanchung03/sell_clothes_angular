import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../types/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:8080/api/v1/categories'; // URL tùy theo config

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl, { headers: this.getAuthHeaders() });
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category, { headers: this.getAuthHeaders() });
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category, { headers: this.getAuthHeaders() });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // API search category by name
  getCategoryByName(name: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/search?name=${name}`, {
      headers: this.getAuthHeaders()
    });
  }
}
