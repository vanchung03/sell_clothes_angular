import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../types/payment';
import * as XLSX from 'xlsx';
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/v1/payments';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  createPayment(orderId: number, methodCode: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${orderId}/pay?methodCode=${methodCode}`,
      {},
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  checkPaymentStatus(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/callback`, {
      headers: this.getAuthHeaders(),
      params: params,
      responseType: 'text',
    });
  }
    // ✅ Lấy tất cả thanh toán
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // ✅ Lấy thanh toán theo orderId
  getPaymentByOrderId(orderId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/order/${orderId}`, { headers: this.getAuthHeaders() });
  }


  // ✅ Xuất danh sách thanh toán ra file Excel
  exportToExcel(data: Payment[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payment List");
    XLSX.writeFile(workbook, `payment_list.xlsx`);
  }
}
