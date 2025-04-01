import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentHistory } from '../types/payment-history';
import * as XLSX from 'xlsx';

// Import environment
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class PaymentHistoryService {
  // ✅ Biến này chứa các URL Payment History từ environment
  private PAYMENT_HISTORY_URLS = environment.API_URLS.PAYMENT_HISTORY;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Lấy tất cả lịch sử giao dịch
  getAllPaymentHistories(): Observable<PaymentHistory[]> {
    return this.http.get<PaymentHistory[]>(
      this.PAYMENT_HISTORY_URLS.GET_ALL,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Lấy lịch sử giao dịch theo User ID
  getUserPaymentHistory(userId: number): Observable<PaymentHistory[]> {
    return this.http.get<PaymentHistory[]>(
      this.PAYMENT_HISTORY_URLS.GET_BY_USER(userId),
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Xóa lịch sử giao dịch theo ID
  deletePaymentHistory(historyId: number): Observable<void> {
    return this.http.delete<void>(
      this.PAYMENT_HISTORY_URLS.DELETE(historyId),
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Xuất dữ liệu ra file Excel
  exportToExcel(data: PaymentHistory[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment History');

    XLSX.writeFile(workbook, `payment_history.xlsx`);
  }
}
