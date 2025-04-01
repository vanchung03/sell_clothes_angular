import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../types/order';
import { TokenService } from './token.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // ✅ Tạo biến chứa các URL cho Order
  private ORDER_URLS = environment.API_URLS.ORDER;
  private ORDER_MAIL_URL = environment.API_URLS.ORDER.MAIL;
  constructor(
    private http: HttpClient,
    private tokenservice: TokenService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Lấy danh sách tất cả đơn hàng
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(
      this.ORDER_URLS.GET_ALL,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Lấy chi tiết đơn hàng theo ID
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(
      this.ORDER_URLS.GET_BY_ID(orderId),
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Cập nhật trạng thái đơn hàng
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(
      this.ORDER_URLS.UPDATE_STATUS(orderId, status),
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Xóa đơn hàng
  deleteOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(
      this.ORDER_URLS.DELETE(orderId),
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Checkout - Chuyển giỏ hàng thành đơn hàng (CÓ PHƯƠNG THỨC VẬN CHUYỂN)
  // ✅ Checkout - Chuyển giỏ hàng thành đơn hàng (THÊM VOUCHER)
  checkout(
    userId: number,
    addressId: number,
    shipMethodId: number,
    voucherCode?: string
  ): Observable<Order> {
    return this.http.post<Order>(
      this.ORDER_URLS.CHECKOUT(userId, addressId, shipMethodId, voucherCode),
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Lấy danh sách đơn hàng theo User
  getOrdersByUser(): Observable<Order[]> {
    const userId = this.tokenservice.getUserId();
    if (!userId) {
      throw new Error('User ID not found in localStorage');
    }
    return this.http.get<Order[]>(
      this.ORDER_URLS.GET_ORDERS_BY_USER(userId),
      { headers: this.getAuthHeaders() }
    );
  }

   /**
   * Gửi email xác nhận đơn hàng dựa trên orderId
   */
   sendOrderMail(orderId: number): Observable<any> {
    return this.http.post<any>(
      this.ORDER_MAIL_URL(orderId),
      {},  // Không cần body nếu API không yêu cầu dữ liệu
      { headers: this.getAuthHeaders() }
    );
  }
}
