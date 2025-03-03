import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentHistory } from '../types/payment-history';
import * as XLSX from 'xlsx';
@Injectable({
  providedIn: 'root'
})
export class PaymentHistoryService {
  private apiUrl = 'http://localhost:8080/api/v1/payments-history';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Lấy tất cả lịch sử giao dịch
  getAllPaymentHistories(): Observable<PaymentHistory[]> {
    return this.http.get<PaymentHistory[]>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() });
  }

  // ✅ Lấy lịch sử giao dịch theo User ID
  getUserPaymentHistory(userId: number): Observable<PaymentHistory[]> {
    return this.http.get<PaymentHistory[]>(`${this.apiUrl}/user/${userId}/payment-history`, { headers: this.getAuthHeaders() });
  }

  // ✅ Xóa lịch sử giao dịch theo ID
  deletePaymentHistory(historyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${historyId}`, { headers: this.getAuthHeaders() });
  }

  // ✅ 2. Xuất dữ liệu ra file Excel
  exportToExcel(data: PaymentHistory[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");
    
    XLSX.writeFile(workbook, `payment_history.xlsx`);
  }
}
