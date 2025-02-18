import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductVariant } from '../types/product-variant';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantService {
  private apiUrl = 'http://localhost:8080/api/v1/product_variants';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Lấy tất cả biến thể của 1 product
  getAllVariantsByProductId(productId: number): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.apiUrl}/${productId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Tạo mới 1 biến thể
  createProductVariant(variant: ProductVariant): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(this.apiUrl, variant, {
      headers: this.getAuthHeaders(),
    });
  }

  // Cập nhật biến thể
  updateProductVariant(variantId: number, variant: ProductVariant): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(`${this.apiUrl}/${variantId}`, variant, {
      headers: this.getAuthHeaders(),
    });
  }

  // Xóa 1 biến thể
  deleteProductVariant(variantId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${variantId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text', // Không trả về dữ liệu, chỉ trả về mã HTTP status code
    });
  }
}
