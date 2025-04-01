import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../types/category';

// Import environment
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  // Tạo biến cục bộ cho các URL Category
  private CATEGORY_URLS = environment.API_URLS.CATEGORY;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(
      this.CATEGORY_URLS.GET_ALL, 
      { headers: this.getAuthHeaders() }
    );
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(
      this.CATEGORY_URLS.CREATE, 
      category, 
      { headers: this.getAuthHeaders() }
    );
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(
      this.CATEGORY_URLS.UPDATE(id), 
      category, 
      { headers: this.getAuthHeaders() }
    );
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(
      this.CATEGORY_URLS.DELETE(id), 
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text' 
      }
    );
  }

  // Lấy danh mục theo từ khóa (nam, nữ)
  searchCategories(keyword: string): Observable<Category[]> {
    return this.http.get<Category[]>(
      this.CATEGORY_URLS.SEARCH(keyword), 
      { headers: this.getAuthHeaders() }
    );
  }
}
