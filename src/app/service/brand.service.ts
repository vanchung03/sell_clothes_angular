import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand } from '../types/brand';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private baseUrl = 'http://localhost:8080/api/v1/brands'; // URL tùy theo config

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.baseUrl, { headers: this.getAuthHeaders() });
  }

  createBrand(brand: Brand): Observable<Brand> {
    return this.http.post<Brand>(this.baseUrl, brand, { headers: this.getAuthHeaders() });
  }

  updateBrand(id: number, brand: Brand): Observable<Brand> {
    return this.http.put<Brand>(`${this.baseUrl}/${id}`, brand, { headers: this.getAuthHeaders() });
  }

  deleteBrand(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + `/${id}`, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' // Expect plain text response
    });
  }
  
}
