import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand } from '../types/brand';
// Import environment thay vì import API_URLS
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  
  // Lấy các URL Brands từ environment
  private BRAND_URLS = environment.API_URLS.BRANDS;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Lấy danh sách thương hiệu
  getAllBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(
      this.BRAND_URLS.GET_ALL, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Thêm mới thương hiệu
  createBrand(brand: Brand): Observable<Brand> {
    return this.http.post<Brand>(
      this.BRAND_URLS.CREATE, 
      brand, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Cập nhật thương hiệu
  updateBrand(id: number, brand: Brand): Observable<Brand> {
    return this.http.put<Brand>(
      this.BRAND_URLS.UPDATE(id), 
      brand, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Xóa thương hiệu
  deleteBrand(id: number): Observable<any> {
    return this.http.delete(
      this.BRAND_URLS.DELETE(id),
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text' // Expect plain text response
      }
    );
  }
}
