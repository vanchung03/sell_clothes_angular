import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../types/payment';
import * as XLSX from 'xlsx';

// Import environment
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  // ✅ Lấy các URL Payment từ environment
  private PAYMENT_URLS = environment.API_URLS.PAYMENTS;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // ✅ Tạo thanh toán (gọi API /{orderId}/pay?methodCode=xxx )
  createPayment(orderId: number, methodCode: string): Observable<any> {
    return this.http.post(
      this.PAYMENT_URLS.CREATE(orderId, methodCode), 
      {}, 
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  // ✅ Kiểm tra trạng thái thanh toán (gọi API /callback)
  checkPaymentStatus(params: any): Observable<any> {
    return this.http.get(
      this.PAYMENT_URLS.CHECK_STATUS,
      {
        headers: this.getAuthHeaders(),
        params: params,
        responseType: 'text',
      }
    );
  }

  // ✅ Lấy tất cả thanh toán
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      this.PAYMENT_URLS.GET_ALL, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Lấy thanh toán theo orderId
  getPaymentByOrderId(orderId: number): Observable<Payment> {
    return this.http.get<Payment>(
      this.PAYMENT_URLS.GET_BY_ORDER(orderId), 
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Xuất danh sách thanh toán ra file Excel
  exportToExcel(data: Payment[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment List');
    XLSX.writeFile(workbook, `payment_list.xlsx`);
  }
}
