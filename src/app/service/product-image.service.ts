import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductImage } from '../types/product-image';

// Import environment
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductImageService {
  // Tạo biến cục bộ chứa các URL cho Product Images
  private PRODUCT_IMAGES_URLS = environment.API_URLS.PRODUCT_IMAGES;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Lấy tất cả ProductImages của 1 product
  getAllProductImages(productId: number): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(
      this.PRODUCT_IMAGES_URLS.GET_ALL(productId),
      { headers: this.getAuthHeaders() }
    );
  }

  // Tạo mới 1 ProductImage
  createProductImage(image: ProductImage): Observable<ProductImage> {
    return this.http.post<ProductImage>(
      this.PRODUCT_IMAGES_URLS.CREATE,
      image,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cập nhật 1 ProductImage
  updateProductImage(imageId: number, image: ProductImage): Observable<ProductImage> {
    return this.http.put<ProductImage>(
      this.PRODUCT_IMAGES_URLS.UPDATE(imageId),
      image,
      { headers: this.getAuthHeaders() }
    );
  }

  // Xóa 1 ProductImage
  deleteProductImage(imageId: number): Observable<any> {
    return this.http.delete(
      this.PRODUCT_IMAGES_URLS.DELETE(imageId),
      {
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json', // <-- thêm dòng này nếu cần
      }
    );
  }

  importProductImagesFromExcel(file: File, images: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    images.forEach((image) => formData.append('images', image));

    return this.http.post<any>(this.PRODUCT_IMAGES_URLS.IMPORT_EXCEL, formData,{
      reportProgress: true,
      observe: 'events',
    });
  }

  downloadProductImageTemplate(): Observable<any> {
    return this.http.get(this.PRODUCT_IMAGES_URLS.TEMPLATE, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
}
