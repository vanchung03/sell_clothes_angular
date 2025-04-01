import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethod } from '../types/payment-method';

// Import environment
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  // Gộp URL vào một biến cục bộ để code ngắn gọn
  private PAYMENT_METHODS_URLS = environment.API_URLS.PAYMENT_METHODS;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(
      this.PAYMENT_METHODS_URLS.GET_ALL, 
      { headers: this.getAuthHeaders() }
    );
  }

  getPaymentMethodById(id: number): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(
      this.PAYMENT_METHODS_URLS.GET_BY_ID(id), 
      { headers: this.getAuthHeaders() }
    );
  }

  createPaymentMethod(paymentMethod: PaymentMethod): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(
      this.PAYMENT_METHODS_URLS.CREATE, 
      paymentMethod,
      { headers: this.getAuthHeaders() }
    );
  }

  updatePaymentMethod(id: number, paymentMethod: PaymentMethod): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(
      this.PAYMENT_METHODS_URLS.UPDATE(id), 
      paymentMethod, 
      { headers: this.getAuthHeaders() }
    );
  }

  deletePaymentMethod(id: number): Observable<void> {
    return this.http.delete<void>(
      this.PAYMENT_METHODS_URLS.DELETE(id), 
      { headers: this.getAuthHeaders() }
    );
  }
}
