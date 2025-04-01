import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private readonly maxRetries = 3;

  // ✅ Tạo biến cục bộ cho nhóm STATISTICS URL
  private STATS_URL = environment.API_URLS.STATISTICS;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi khi tải dữ liệu thống kê.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      errorMessage = `Mã lỗi: ${error.status}, Thông báo: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Tổng doanh thu
  getTotalRevenue(): Observable<number> {
    return this.http
      .get<number>(this.STATS_URL.TOTAL_REVENUE, { headers: this.getAuthHeaders() })
      .pipe(retry(this.maxRetries), catchError(this.handleError));
  }

  // Tổng số đơn hàng
  getTotalOrders(): Observable<number> {
    return this.http
      .get<number>(this.STATS_URL.TOTAL_ORDERS, { headers: this.getAuthHeaders() })
      .pipe(retry(this.maxRetries), catchError(this.handleError));
  }
}
