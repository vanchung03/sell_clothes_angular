import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Cart } from '../types/cart';
import { CartItem } from '../types/cart-item';
import { TokenService } from './token.service';

// Thay vì import { API_URLS } from '../constants/api-urls';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Gán riêng endpoint Cart vào một biến để code gọn hơn
  private CART_URLS = environment.API_URLS.CART;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   *  **Lấy giỏ hàng của người dùng**
   * @returns Observable<Cart>
   */
  getCart(): Observable<Cart> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Người dùng chưa đăng nhập!'));
    }
    return this.http
      .get<Cart>(this.CART_URLS.GET_CART(userId), { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   *  **Thêm sản phẩm vào giỏ hàng**
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
      .post<Cart>(this.CART_URLS.ADD_ITEM(userId), cartItem, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * **Cập nhật số lượng sản phẩm trong giỏ hàng**
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
      .put<Cart>(this.CART_URLS.UPDATE_ITEM(userId), cartItem, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   ***Xóa sản phẩm khỏi giỏ hàng**
   * @param cartItemId ID sản phẩm trong giỏ hàng
   * @returns Observable<string>
   */
  removeItemFromCart(cartItemId: number): Observable<string> {
    return this.http
      .delete(this.CART_URLS.REMOVE_ITEM(cartItemId), {
        headers: this.getAuthHeaders(),
        responseType: 'text',
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * **Lấy số lượng đơn hàng trong giỏ hàng của người dùng**
   * @returns Observable<number>
   */
  getCartItemCount(): Observable<number> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Người dùng chưa đăng nhập!'));
    }
    return this.http
      .get<number>(this.CART_URLS.CART_COUNT(userId), { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * **Xử lý lỗi API**
   */
  private handleError(error: any) {
    console.error('Lỗi API:', error);
    return throwError(() => new Error(error.message || 'Có lỗi xảy ra!'));
  }
}
