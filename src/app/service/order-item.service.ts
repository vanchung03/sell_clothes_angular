import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderItem } from '../types/order-item';

@Injectable({
  providedIn: 'root'
})
export class OrderItemService {
  private apiUrl = 'http://localhost:8080/api/v1/order-items';

  constructor(private http: HttpClient) {}

  getOrderItemsByOrderId(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.apiUrl}/order/${orderId}`);
  }
}
