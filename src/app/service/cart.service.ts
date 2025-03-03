import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Cart } from '../types/cart';
import { CartItem } from '../types/cart-item';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/v1/cart';

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * 🛒 **Lấy giỏ hàng của người dùng**
   * @returns Observable<Cart>
   */
  getCart(): Observable<Cart> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Người dùng chưa đăng nhập!'));
    }
    return this.http
      .get<Cart>(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * ➕ **Thêm sản phẩm vào giỏ hàng**
   * @param variantId ID biến thể sản phẩm
   * @param quantity Số lượng
   * @returns Observable<Cart>
   */
  addItemToCart(variantId: number, quantity: number): Observable<Cart> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Người dùng chưa đăng nhập!'));
    }

    const cartItem: Partial<CartItem> = { variantId, quantity };

    return this.http
      .post<Cart>(`${this.apiUrl}/${userId}`, cartItem, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   *  **Cập nhật số lượng sản phẩm trong giỏ hàng**
   * @param variantId ID biến thể sản phẩm
   * @param quantity Số lượng mới
   * @returns Observable<Cart>
   */
  updateCartItem(variantId: number, quantity: number): Observable<Cart> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Người dùng chưa đăng nhập!'));
    }

    const cartItem: Partial<CartItem> = { variantId, quantity };

    return this.http
      .put<Cart>(`${this.apiUrl}/${userId}`, cartItem, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

 
  removeItemFromCart(cartItemId: number): Observable<string> {
    return this.http
      .delete(`${this.apiUrl}/${cartItemId}`, {
        headers: this.getAuthHeaders(),
        responseType: 'text' // ✅ Chỉ định rõ kiểu dữ liệu trả về là text
      })
      .pipe(
        catchError(this.handleError) // ✅ Xử lý lỗi
      );
  }
  

  /**
   * **Xử lý lỗi API**
   */
  private handleError(error: any) {
    console.error('Lỗi API:', error);
    return throwError(() => new Error(error.message || 'Có lỗi xảy ra!'));
  }
}
