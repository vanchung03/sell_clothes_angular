import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../types/order';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  constructor(private http: HttpClient , private tokenservice:TokenService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Lấy danh sách tất cả đơn hàng
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // ✅ Lấy chi tiết đơn hàng theo ID
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`, { headers: this.getAuthHeaders() });
  }

  // ✅ Cập nhật trạng thái đơn hàng
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status?status=${status}`, {}, { headers: this.getAuthHeaders() });
  }

  // ✅ Xóa đơn hàng
  deleteOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`, { headers: this.getAuthHeaders() });
  }

  // ✅ Checkout - Chuyển giỏ hàng thành đơn hàng (CÓ PHƯƠNG THỨC VẬN CHUYỂN)
  checkout(userId: number, addressId: number, shipMethodId: number): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}/${userId}/checkout?addressId=${addressId}&shipMethodId=${shipMethodId}`, 
      {}, 
      { headers: this.getAuthHeaders() }
    );
  }
  getOrdersByUser(): Observable<any> {
    const userId = this.tokenservice.getUserId();
    if (!userId) {
      throw new Error('User ID not found in localStorage');
    }
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() });
  }
  
}
