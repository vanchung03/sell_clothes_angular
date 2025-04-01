import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderItem } from '../types/order-item';

// Import environment
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderItemService {
  // Lấy object ORDER_ITEM từ environment để code ngắn gọn
  private ORDER_ITEM_URLS = environment.API_URLS.ORDER_ITEM;

  constructor(private http: HttpClient) {}

  getOrderItemsByOrderId(orderId: number): Observable<OrderItem[]> {
    // Trước đây: `${this.apiUrl}/order/${orderId}`
    // Bây giờ dùng environment
    return this.http.get<OrderItem[]>(
      this.ORDER_ITEM_URLS.GET_BY_ORDER(orderId)
    );
  }
}
