import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly maxRetries = 3;

  private REPORTS_URL = environment.API_URLS.REPORTS;

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

  // 📌 API lấy doanh thu theo ngày
  getRevenueReport(fromDate: string, toDate: string): Observable<any> {
    const url = `${this.REPORTS_URL.REVENUE}?fromDate=${fromDate}&toDate=${toDate}`;
    return this.http
      .get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(retry(this.maxRetries), catchError(this.handleError));
  }

  // 📌 API lấy doanh thu theo tháng
  getMonthlyRevenue(year: number, month: number): Observable<any> {
  
    const url = `${this.REPORTS_URL.MONTHLY_REVENUE}?year=${year}&month=${month}`;
    return this.http
      .get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(retry(this.maxRetries), catchError(this.handleError));
  }
}
