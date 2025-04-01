import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../types/products';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Gán các URL cho Products từ environment
  private PRODUCT_URLS = environment.API_URLS.PRODUCTS;

  constructor(private http: HttpClient) {}

  // Lấy token từ localStorage (hoặc nơi bạn lưu trữ)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Lấy tất cả Products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.PRODUCT_URLS.GET_ALL, {
      headers: this.getAuthHeaders(),
    });
  }

  // Tìm kiếm sản phẩm theo từ khóa
  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.PRODUCT_URLS.SEARCH(keyword), {
      headers: this.getAuthHeaders(),
    });
  }

  // Lấy 1 Product theo ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(this.PRODUCT_URLS.GET_BY_ID(id), {
      headers: this.getAuthHeaders(),
    });
  }
  // 🟢 Lấy danh sách sản phẩm theo danh sách ID
  getProductsByIds(productIds: number[]): Observable<Product[]> {
    return this.http.post<Product[]>(this.PRODUCT_URLS.GET_BY_IDS, { productIds }, {
      headers: this.getAuthHeaders(),
    });
  }

  // Lấy danh sách sản phẩm theo categoryId
  getProductsByCategoryId(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(this.PRODUCT_URLS.GET_BY_CATEGORY(categoryId), {
      headers: this.getAuthHeaders(),
    });
  }

  // Tạo mới 1 Product
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.PRODUCT_URLS.CREATE, product, {
      headers: this.getAuthHeaders(),
    });
  }

  // Cập nhật Product
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(this.PRODUCT_URLS.UPDATE(id), product, {
      headers: this.getAuthHeaders(),
    });
  }

  // Xóa Product
  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(this.PRODUCT_URLS.DELETE(productId), {
      headers: this.getAuthHeaders(),
    });
  }



  // ✅ API Import Sản Phẩm từ Excel (Hỗ trợ tiến trình)
importProductsFromExcel(file: File, images: File[]): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  images.forEach((image) => formData.append('images', image));

  // ✅ Thêm `reportProgress: true` và `observe: 'events'`
  return this.http.post<any>(this.PRODUCT_URLS.IMPORT_EXCEL, formData, {
    reportProgress: true,
    observe: 'events',
  });
}
}
