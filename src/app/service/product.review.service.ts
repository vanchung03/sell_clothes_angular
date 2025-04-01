import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductReview } from '../types/product-review';
import { TokenService } from './token.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductReviewService {
  private REVIEW_URLS = environment.API_URLS.REVIEWS;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Lấy danh sách đánh giá theo sản phẩm
  getReviewsByProductId(productId: number): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(
      this.REVIEW_URLS.GET_BY_PRODUCT(productId),
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Lấy danh sách đánh giá của người dùng
  getReviewsByUserId(): Observable<ProductReview[]> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      throw new Error('User ID not found in localStorage');
    }
    return this.http.get<ProductReview[]>(
      this.REVIEW_URLS.GET_BY_USER(userId),
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Thêm đánh giá mới
  addReview(review: ProductReview): Observable<ProductReview> {
    return this.http.post<ProductReview>(
      this.REVIEW_URLS.CREATE,
      review,
      { headers: this.getAuthHeaders() }
    );
  }
  updateReview(reviewId: number, review: ProductReview): Observable<ProductReview> {
    return this.http.put<ProductReview>(
      this.REVIEW_URLS.UPDATE(reviewId),
      review,
      { headers: this.getAuthHeaders() }
    );
  }
  
  

  // ✅ Xóa đánh giá
  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(
      this.REVIEW_URLS.DELETE(reviewId),
      { headers: this.getAuthHeaders() }
    );
  }
}
