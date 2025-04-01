import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShipMethod } from '../types/ship-method';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShipMethodService {
  // Sử dụng endpoint được cấu hình trong environment
  private SHIPPING_METHODS_URL = environment.API_URLS.SHIPPING.METHODS;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Lấy danh sách tất cả phương thức vận chuyển
  getAllShipMethods(): Observable<ShipMethod[]> {
    return this.http.get<ShipMethod[]>(this.SHIPPING_METHODS_URL, { headers: this.getAuthHeaders() });
  }

  // ✅ Lấy phương thức vận chuyển theo ID
  getShipMethodById(shipMethodId: number): Observable<ShipMethod> {
    return this.http.get<ShipMethod>(`${this.SHIPPING_METHODS_URL}/${shipMethodId}`, { headers: this.getAuthHeaders() });
  }

  // ✅ Thêm mới phương thức vận chuyển
  createShipMethod(shipMethod: ShipMethod): Observable<ShipMethod> {
    return this.http.post<ShipMethod>(this.SHIPPING_METHODS_URL, shipMethod, { headers: this.getAuthHeaders() });
  }

  // ✅ Cập nhật phương thức vận chuyển
  updateShipMethod(shipMethodId: number, shipMethod: ShipMethod): Observable<ShipMethod> {
    return this.http.put<ShipMethod>(`${this.SHIPPING_METHODS_URL}/${shipMethodId}`, shipMethod, { headers: this.getAuthHeaders() });
  }

  // ✅ Xóa phương thức vận chuyển
  deleteShipMethod(shipMethodId: number): Observable<void> {
    return this.http.delete<void>(`${this.SHIPPING_METHODS_URL}/${shipMethodId}`, { headers: this.getAuthHeaders() });
  }
}
