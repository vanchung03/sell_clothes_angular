import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

// Define interfaces for better type safety
export interface OrderStatusRatio {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PaymentMethod {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface TopProduct {
  productId: number;
  name: string;
  image: string;
  soldCount: number;
  revenue: number;
  price: number;
}

export interface RevenueData {
  date: string;
  amount: number;
  orderCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/api/v1/statistics';
  private readonly maxRetries = 3;

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
      // Client-side error
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Mã lỗi: ${error.status}, Thông báo: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getTotalRevenue(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-revenue`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  getTotalOrders(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-orders`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  getOrderStatusRatio(): Observable<OrderStatusRatio[]> {
    return this.http.get<OrderStatusRatio[]>(`${this.apiUrl}/order-status-ratio`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(data => this.assignStatusColors(data)),
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  getPopularPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/popular-payment-methods`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  getTopSellingProducts(limit: number = 5): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.apiUrl}/top-products`, {
      headers: this.getAuthHeaders(),
      params: { limit: limit.toString() }
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  getRevenueByDate(startDate?: Date, endDate?: Date): Observable<RevenueData[]> {
    let params: any = {};
    
    if (startDate) {
      params.startDate = startDate.toISOString().split('T')[0];
    }
    if (endDate) {
      params.endDate = endDate.toISOString().split('T')[0];
    }

    return this.http.get<RevenueData[]>(`${this.apiUrl}/revenue-by-date`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  // Helper method to assign colors to order statuses
  private assignStatusColors(data: OrderStatusRatio[]): OrderStatusRatio[] {
    const statusColors = {
      'PENDING': '#ffa726',    // Orange
      'CONFIRMED': '#42a5f5',  // Blue
      'SHIPPING': '#ab47bc',   // Purple
      'COMPLETED': '#66bb6a',  // Green
      'CANCELLED': '#ef5350'   // Red
    };

    return data.map(item => ({
      ...item,
      color: statusColors[item.status as keyof typeof statusColors] || '#9e9e9e'
    }));
  }

  // New methods for additional statistics
  getDailyOrderCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/daily-orders`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  getMonthlyRevenue(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/monthly-revenue`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  getAverageOrderValue(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/average-order-value`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }
}