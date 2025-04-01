import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ProductVariant } from '../types/product-variant';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantService {
  // Sử dụng các URL từ environment
  private PRODUCT_VARIANTS_URLS = environment.API_URLS.PRODUCT_VARIANTS;

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
    return this.http.get<ProductVariant[]>(
      this.PRODUCT_VARIANTS_URLS.GET_ALL(productId),
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * 🏷 **Lấy thông tin Brand theo `variantId`**
   * @param variantId ID của biến thể sản phẩm
   * @returns Observable chứa thông tin brand
   */
  getBrandByVariantId(variantId: number): Observable<any> {
    return this.http
      .get<any>(this.PRODUCT_VARIANTS_URLS.BRAND(variantId), {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Lỗi khi lấy Brand:', error);
          return throwError(() => new Error('Không thể lấy thương hiệu!'));
        })
      );
  }

  // ✅ Lấy thông tin chi tiết của một biến thể sản phẩm theo `variantId`
  getVariantById(variantId: number): Observable<ProductVariant> {
    return this.http.get<ProductVariant>(
      this.PRODUCT_VARIANTS_URLS.VARIANT(variantId),
      { headers: this.getAuthHeaders() }
    );
  }

  // Tạo mới 1 biến thể
  createProductVariant(variant: ProductVariant): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(
      this.PRODUCT_VARIANTS_URLS.CREATE,
      variant,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cập nhật biến thể
  updateProductVariant(variantId: number, variant: ProductVariant): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(
      this.PRODUCT_VARIANTS_URLS.UPDATE(variantId),
      variant,
      { headers: this.getAuthHeaders() }
    );
  }

  // Xóa 1 biến thể
  deleteProductVariant(variantId: number): Observable<any> {
    return this.http.delete(
      this.PRODUCT_VARIANTS_URLS.DELETE(variantId),
      {
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json', // không trả về dữ liệu, chỉ trả về mã HTTP status
      }
    );
  }

  importProductVariantFromExcel(file: File, images: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    images.forEach((image) => formData.append('images', image));

    return this.http.post<any>(this.PRODUCT_VARIANTS_URLS.IMPORT_EXCEL, formData,{
      reportProgress: true,
      observe: 'events',
    });
  }

  downloadProductVariantTemplate(): Observable<any> {
    return this.http.get(this.PRODUCT_VARIANTS_URLS.TEMPLATE, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
}
