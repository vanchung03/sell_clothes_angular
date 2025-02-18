import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductImage } from '../types/product-image';

@Injectable({
  providedIn: 'root',
})
export class ProductImageService {
  private apiUrl = 'http://localhost:8080/api/v1/product_images';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Lấy tất cả ProductImages thuộc 1 product
  getAllProductImages(productId: number): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.apiUrl}/${productId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Tạo mới 1 ProductImage
  createProductImage(image: ProductImage): Observable<ProductImage> {
    return this.http.post<ProductImage>(this.apiUrl, image, {
      headers: this.getAuthHeaders(),
    });
  }

  // Cập nhật 1 ProductImage
  updateProductImage(imageId: number, image: ProductImage): Observable<ProductImage> {
    return this.http.put<ProductImage>(`${this.apiUrl}/${imageId}`, image, {
      headers: this.getAuthHeaders(),
    });
  }

  // Xóa 1 ProductImage
  // Xóa 1 ProductImage
deleteProductImage(imageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${imageId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'  //  <-- thêm dòng này
    });
  }
}
